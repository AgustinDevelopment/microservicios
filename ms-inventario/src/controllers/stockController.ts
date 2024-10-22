import { Request, Response } from 'express';
import Stock from '../models/Stock';

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
  try {
    const stock = await Stock.findOne({ where: { producto_id } });
    if (!stock) {
      return res.status(404).json({ error: 'Stock no encontrado' });
    }
    await stock.update({ cantidad, fecha_transaccion, entrada_salida });
    res.json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
};