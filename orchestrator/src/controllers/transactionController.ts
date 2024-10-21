import { Request, Response } from 'express';
import sequelize from '../config/db';

import Pago from '../../../ms-payments/src/models/Pago';
import Stock from '../../../ms-inventario/src/models/Stock'
import Compra from '../../../ms-compras/src/models/Compra';
import Producto from '../../../ms-catalog/src/models/Producto'

export const realizarTransaccion = async (req: Request, res: Response) => {
  const { producto_id, direccion_envio, cantidad, medio_pago } = req.body;

  const transaction = await sequelize.transaction(); // Inicia una transacción de Sequelize

  try {
      // 1. Verificar si el producto existe y está activado
      const producto = await Producto.findOne({ where: { id: producto_id, activado: true } });
      if (!producto) {
          throw new Error('Producto no encontrado o inactivo');
      }

      // 2. Crear la compra
      const compra = await Compra.create({
          producto_id,
          fecha_compra: new Date(),
          direccion_envio,
      }, { transaction });

      // 3. Actualizar el inventario (restar la cantidad del stock)
      const stockActual = await Stock.findOne({ where: { producto_id }, transaction });
      if (!stockActual || stockActual.cantidad < cantidad) {
          throw new Error('Stock insuficiente');
      }

      await stockActual.update({
          cantidad: stockActual.cantidad - cantidad,
          fecha_transaccion: new Date(),
          entrada_salida: 2, // Indica salida de stock
      }, { transaction });

      // 4. Procesar el pago
      const pago = await Pago.create({
          producto_id,
          precio: producto.precio * cantidad, // Total basado en cantidad
          medio_pago,
      }, { transaction });

      // Confirma la transacción
      await transaction.commit();

      // 5. Responder con los detalles de la transacción
      res.status(201).json({
          message: 'Transacción realizada con éxito',
          compra,
          pago,
          stock: stockActual,
      });
  } catch (error) {
      // En caso de error, se revierte la transacción
      await transaction.rollback();
      res.status(500).json({ error: (error as Error).message });
  }
};