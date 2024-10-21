import { Request, Response } from 'express';
import Stock from '../models/Stock';

export const updateStock = async (req: Request, res: Response) => {
  try {
    const { producto_id, cantidad, entrada_salida } = req.body;
    const stock = await Stock.create({
      producto_id,
      fecha_transaccion: new Date(), // Establecer la fecha de transacción a la fecha actual
      cantidad,
      entrada_salida
    });
    res.status(201).json(stock);
  } catch (error) {
    res.status(500).json({ error: 'Error al actualizar el stock' });
  }
};