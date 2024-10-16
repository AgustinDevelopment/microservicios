import { Request, Response } from "express";
import Pago from "../models/Pago";

export const proccesPayment = async (req: Request, res: Response) => {
    const pago = await Pago.create(req.body)
    res.status(201).json(pago)
}