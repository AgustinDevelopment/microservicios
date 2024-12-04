import { Request, Response } from 'express';
import axios from 'axios';
import sequelize from '../config/db';
import axiosRetry from 'axios-retry';
import { createCircuitBreaker } from '../utils/circuitBreaker';
import compensateSaga from '../utils/compensateSaga'; // Importación de las funciones de compensación
import dotenv from 'dotenv';


dotenv.config();

const MS_CATALOG = process.env.MS_CATALOG || 'http://ms-catalog:4000';
const MS_COMPRAS = process.env.MS_COMPRAS || 'http://ms-compras:4001';
const MS_INVENTARIO = process.env.MS_INVENTARIO || 'http://ms-inventario:4002';
const MS_PAYMENTS = process.env.MS_PAYMENTS || 'http://ms-payments:4003';

// Configurar reintentos automáticos para axios
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

const withRetries = async (action: () => Promise<any>, retries: number = 3): Promise<any> => {
  let attempt = 0;
  while (attempt < retries) {
    try {
      return await action();
    } catch (error) {
      attempt++;
      const errorMessage = (error as any).message;
      console.error(`Intento ${attempt} fallido:`, errorMessage); // Registro del intento fallido
      if (attempt >= retries) {
        throw error; // Lanzar error si se superan los intentos
      }
    }
  }
};

export const realizarTransaccion = async (req: Request, res: Response) => {
  const transaction = await sequelize.transaction(); // Crear transacción para operaciones atómicas
  let paymentId: number | undefined;
  let purchaseId: number | undefined;

  try {
    const { producto_id, cantidad, medio_pago, direccion_envio } = req.body;

    // Validar datos requeridos
    if (!producto_id || !cantidad || !direccion_envio) {
      return res.status(400).json({ message: 'Todos los campos son obligatorios' });
    }

    // Verificar si el producto existe y está activado
    const productoResponse = await axios.get(`${MS_CATALOG}/api/products/productos/${producto_id}`);
    const producto = productoResponse.data;
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    if (!producto.activado) {
      throw new Error('Producto inactivo');
    }

    // Verificar el stock antes de crear la compra
    const stockResponse = await axios.get(`${MS_INVENTARIO}/api/products/stock/${producto_id}`);
    const stockActual = stockResponse.data;
    if (!stockActual || stockActual.cantidad < cantidad) {
      throw new Error('Stock insuficiente');
    }

    // Crear la compra
    const compraResponse = await axios.post(`${MS_COMPRAS}/api/products/compra/create`, {
      producto_id,
      fecha_compra: new Date(),
      direccion_envio,
    });
    const compra = compraResponse.data;
    purchaseId = compra.id; // Guardar ID de la compra

    // Actualizar el inventario (restar la cantidad del stock)
    await axios.put(`${MS_INVENTARIO}/api/products/stock/${producto_id}`, {
      cantidad: stockActual.cantidad - cantidad,
      fecha_transaccion: new Date(),
      entrada_salida: 2, // Indica salida de stock
    });

    // Crear el registro de pago
    const pagoResponse = await axios.post(`${MS_PAYMENTS}/api/products/pagos/procesar`, {
      producto_id,
      precio: producto.precio * cantidad,
      medio_pago,
    });
    const pago = pagoResponse.data;
    paymentId = pago.id; // Guardar ID del pago

    await transaction.commit(); // Confirmar transacción

    res.status(201).json({ compra, pago });
  } catch (error) {
    if (error instanceof Error) {
      console.error('Error al realizar la transacción:', error.message);
    } else {
      console.error('Error al realizar la transacción:', error);
    }

    // Revertir el pago si ya se procesó
    if (paymentId) {
      try {
        await compensateSaga(paymentId, 0, req.body.producto_id, req.body.cantidad);
      } catch (compensateError) {
        if (compensateError instanceof Error) {
          console.error('Error al revertir el pago:', compensateError.message);
        } else {
          console.error('Error al revertir el pago:', compensateError);
        }
      }
    }

    // Revertir la compra si ya se creó
    if (purchaseId) {
      try {
        await compensateSaga(0, purchaseId, req.body.producto_id, req.body.cantidad);
      } catch (compensateError) {
        if (compensateError instanceof Error) {
          console.error('Error al revertir la compra:', compensateError.message);
        } else {
          console.error('Error al revertir la compra:', compensateError);
        }
      }
    }

    await transaction.rollback(); // Revertir transacción si ocurre un error
    res.status(500).json({ message: 'No se pudo realizar la compra' });
  }
};