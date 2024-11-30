import { Request, Response } from "express";
import Pago from "../models/Pago";
import { createCircuitBreaker } from '../utils/circuitBreaker';

export const createPago = async (req: Request, res: Response) => {
  const { producto_id, precio, medio_pago } = req.body;

  const createPagoAction = async () => {
    const pago = await Pago.create({
      producto_id,
      precio,
      medio_pago,
    });
    return pago;
  };

  const breaker = createCircuitBreaker(createPagoAction);

  try {
    const pago = await breaker.fire();
    res.status(201).json(pago);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: errorMessage });
  }
};

export const proccesPayment = async (req: Request, res: Response) => {
  const processPaymentAction = async () => {
    const pago = await Pago.create(req.body);
    return pago;
  };

  const breaker = createCircuitBreaker(processPaymentAction);

  try {
    const pago = await breaker.fire();
    res.status(201).json(pago);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
    res.status(500).json({ error: errorMessage });
  }
};