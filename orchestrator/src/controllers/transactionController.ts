import { Request, Response } from 'express';
import sequelize from '../config/db';


import Producto from '../../../ms-catalog/src/models/Producto';
import Compra from '../../../ms-compras/src/models/Compra';
import Stock from  '../../../ms-inventario/src/models/Stock';
import Pago from '../../../ms-payments/src/models/Pago';	

export const realizarTransaccion = async (req: Request, res: Response) => {
  const { producto_id, direccion_envio, cantidad, medio_pago } = req.body;

  const transaction = await sequelize.transaction(); // Inicia una transacción de Sequelize

  try {
    // 1. Verificar si el producto existe y está activado
    const producto = await Producto.findByPk(producto_id);
    if (!producto || !producto.activado) {
      throw new Error('Producto no encontrado o inactivo');
    }

    // 2. Realizar el pago
    const pago = await Pago.create({
      producto_id,
      precio: producto.precio,
      medio_pago,
    }, { transaction });

    // 3. Actualizar inventario
    await Stock.create({
      producto_id,
      fecha_transaccion: new Date(),
      cantidad,
      entrada_salida: 2, // salida
    }, { transaction });

    // 4. Crear la compra
    const compra = await Compra.create({
      producto_id,
      fecha_compra: new Date(),
      direccion_envio,
    }, { transaction });

    await transaction.commit();
    res.json({ producto, pago, compra });
  } catch (error) {
    await transaction.rollback();
    res.status(500).json({ error });
  }
};