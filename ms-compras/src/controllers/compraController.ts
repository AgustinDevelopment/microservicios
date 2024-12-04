import { Request, Response } from 'express';
import Compra from '../models/Compra';
import {createCircuitBreaker} from '../utils/circuitBreaker';
import sequelize from '../config/db';

export class CompraController {

    static withRetries = async (action: () => Promise<any>, retries: number) => {
        for (let i = 0; i < retries; i++) {
          try {
            return await action();
          } catch (error) {
            console.error('Error en la operación:', error);
          }
        }
        throw new Error('Error en la operación');
      }

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

      static revertCompra = async (req: Request, res: Response) => {
        const { purchase_id } = req.body;

        const transaction = await sequelize.transaction();

        try {
          const purchase = await CompraController.withRetries(() =>
            Compra.findByPk(purchase_id, { transaction }), 3
          );

          if (!purchase) {
            await transaction.rollback();
            return res.status(404).json({ error: 'Compra no encontrada' });
          }

          await purchase.destroy({ transaction });
          await transaction.commit();

          return res.json({ message: 'Compra revertida' });
        } catch (error) {
          await transaction.rollback();
          const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
          console.error('Error al revertir la compra:', errorMessage);
          return res.status(500).json({ error: 'Error al revertir la compra' });
        }
      }
}

export default CompraController