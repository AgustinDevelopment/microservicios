import { Request, Response } from 'express';
import axios from 'axios';
import axiosRetry from 'axios-retry';
import sequelize from '../config/db';

// Configurar reintentos automáticos para axios
axiosRetry(axios, { retries: 3, retryDelay: axiosRetry.exponentialDelay });

export const realizarTransaccion = async (req: Request, res: Response) => {
  const { producto_id, direccion_envio, cantidad, medio_pago } = req.body;
  
  const transaction = await sequelize.transaction();

  try {
    // 1. Verificar si el producto existe y está activado
    const productoResponse = await axios.get(`http://localhost:4000/api/products/productos/${producto_id}`);
    const producto = productoResponse.data;
    if (!producto) {
      throw new Error('Producto no encontrado');
    }
    if (!producto.activado) {
      throw new Error('Producto inactivo');
    }
  
    // 2. Crear la compra
    const compraResponse = await axios.post('http://localhost:4001/api/products/compra/create', {
      producto_id,
      fecha_compra: new Date(),
      direccion_envio,
    });
    const compra = compraResponse.data;

    // 3. Actualizar el inventario (restar la cantidad del stock)
    const stockResponse = await axios.get(`http://localhost:4002/api/products/stock/${producto_id}`);
    const stockActual = stockResponse.data;
    if (!stockActual || stockActual.cantidad < cantidad) {
      throw new Error('Stock insuficiente');
    }
  
    await axios.put(`http://localhost:4002/api/products/stock/${producto_id}`, {
      cantidad: stockActual.cantidad - cantidad,
      fecha_transaccion: new Date(),
      entrada_salida: 2, // Indica salida de stock
    });

    // 4. Crear el registro de pago
    const pagoResponse = await axios.post('http://localhost:4003/api/products/pagos/procesar', {
      producto_id,
      precio: producto.precio * cantidad,
      medio_pago,
    });
    const pago = pagoResponse.data;
  
    await transaction.commit();
    res.status(201).json({compra, pago});
  } catch (error) {
    await transaction.rollback();
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: errorMessage });
  }
};