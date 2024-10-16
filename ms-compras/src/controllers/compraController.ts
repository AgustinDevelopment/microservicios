import { Request, Response } from 'express';
import Compra from '../models/Compra';

export class CompraController {

    static getAllCompras = async(req: Request, res: Response) => {

        try {
            const compra = await Compra.findAll()
            res.json(compra)
        } catch (error) {
            res.status(500).json({error: 'Error al encontrar todas las compras'})
        }

    }

    static createCompra = async (req: Request, res: Response) => {

        try {
            const compra = await Compra.create(req.body)
            res.json(201).json(compra)
        } catch (error) {
            res.status(500).json({error: 'Error al crear la compra'})
        }

    }

}

export default CompraController