import { Request, Response } from 'express';
import Compra from '../models/Compra';
import {createCircuitBreaker} from '../utils/circuitBreaker';

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
        const { producto_id, fecha_compra, direccion_envio } = req.body;
    
        const createCompraAction = async () => {
          if (!producto_id || !direccion_envio) {
            throw new Error('Producto ID y dirección de envío son requeridos');
          }
    
          const newCompra = await Compra.create({
            producto_id,
            fecha_compra: fecha_compra ?? new Date(),
            direccion_envio
          });
    
          return newCompra;
        };
    
        const breaker = createCircuitBreaker(createCompraAction);
    
        try {
          const newCompra = await breaker.fire();
          res.status(201).json(newCompra);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          res.status(500).json({ error: errorMessage });
        }
      }

}

export default CompraController