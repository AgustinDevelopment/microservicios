import { Request, Response } from "express";
import Pago from "../models/Pago";

export const createPago = async (req: Request, res: Response) => {
    const { producto_id, precio, medio_pago } = req.body;
    try {
      const pago = await Pago.create({
        producto_id,
        precio,
        medio_pago,
      });
      res.status(201).json(pago);
    } catch (error) {
      res.status(500).json({ error: 'Error al crear el pago' });
    }
  };

export const proccesPayment = async (req: Request, res: Response) => {
    const pago = await Pago.create(req.body)
    res.status(201).json(pago)
}