import { Request, Response } from 'express';
import Stock from '../models/Stock';
import { createCircuitBreaker } from '../utils/circuitBreaker';
import sequelize from '../config/db';

export const getStockByProductId = async (req: Request, res: Response) => {
  const { producto_id } = req.params;
  try {
    const stock = await Stock.findOne({ where: { producto_id } });
    if (!stock) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener el stock' });
  }
};

export const updateStock = async (req: Request, res: Response) => {
  const { producto_id } = req.params;
  const { cantidad, fecha_transaccion, entrada_salida } = req.body;

  const updateStockAction = async () => {
    const stock = await Stock.findOne({ where: { producto_id } });
    if (!stock) {
      throw new Error('Stock no encontrado');
    }
    await stock.update({ cantidad, fecha_transaccion, entrada_salida });
    return stock;
  };

  const breaker = createCircuitBreaker(updateStockAction);

  try {
    const updatedStock = await breaker.fire();
    res.json(updatedStock);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: errorMessage });
  }
};

export const checkInventory = async (req: Request, res: Response) => {
  const { producto_id } = req.params;
  try {
    const stock = await Stock.findOne({ where: { producto_id } });
    if (!stock) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }
    res.json({ producto_id, cantidad: stock.cantidad });
  } catch (error) {
    res.status(500).json({ error: 'Error al chequear el inventario' });
  }
};

export const createInventory = async (req: Request, res: Response) => {
  const { producto_id, cantidad, fecha_transaccion, entrada_salida } = req.body;

  const createInventoryAction = async () => {
    const stock = await Stock.create({ producto_id, cantidad, fecha_transaccion, entrada_salida });
    return stock;
  };

  const breaker = createCircuitBreaker(createInventoryAction);

  try {
    const newStock = await breaker.fire();
    res.json(newStock);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: errorMessage });
  }
};

export const revertPurchase = async (req: Request, res: Response) => {
  const { product_id } = req.params; // ID del producto
    const { cantidad } = req.body; // Cantidad a revertir
    
    if (!product_id || cantidad <= 0) {
      return res.status(400).json({ message: 'La cantidad debe ser mayor a 0' });
    }
  
    const transaction = await sequelize.transaction();
    try {
      // Buscar el stock actual del producto
      const stock = await Stock.findOne({ where: { product_id }, transaction });
      if (!stock) {
        await transaction.rollback();
        return res.status(404).json({ message: 'Stock no encontrado' });
      }

      // Validar que la cantidad a revertir no exceda la reducción realizada previamente
      const previousReduction = await Stock.findOne({
        where: {
          product_id,
          input_output: 2, // Indica que fue una salida previa
        },
        transaction,
      });

      if (!previousReduction || previousReduction.cantidad < cantidad) {
        await transaction.rollback();
        return res.status(400).json({
          message: 'No hay suficientes registros de reducción para revertir esta cantidad',
        });
      }

      // Ajustar el stock incrementando la cantidad
      stock.cantidad += cantidad;
  
      // Registrar la operación como "reversión" (entrada de stock)
      const revertLog = await Stock.create(
        {
          product_id,
          cantidad,
          input_output: 1, // Indica que es una entrada (reversión de salida)
        },
        { transaction }
      );
  
      // Guardar el stock actualizado
      const updatedStock = await stock.save({ transaction });
      await transaction.commit();
  
      return res.status(200).json({
        message: 'Stock revertido exitosamente',
        updatedStock,
        revertLog,
      });
    } catch (error) {
      await transaction.rollback();
      return res.status(500).json({
        message: 'Error al revertir compra y actualizar stock',
        error,
      });
    }

}