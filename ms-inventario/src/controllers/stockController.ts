import { Request, Response } from 'express';
import Stock from '../models/Stock';

export const updateStock = async (req: Request, res: Response) => {
  const stock = await Stock.create(req.body);
  res.status(201).json(stock);
};
