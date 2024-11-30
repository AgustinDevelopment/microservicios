import { Request, Response } from 'express';
import Stock from '../models/Stock';
import { createCircuitBreaker } from '../utils/circuitBreaker';

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