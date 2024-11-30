import { Request, Response } from 'express';
import axios from 'axios';
import Producto from '../models/Producto';
import sequelize from '../config/db';
import { Transaction } from 'sequelize';
import redis from '../config/redis';

export class ProductController {

  static getProduct = async (req: Request, res: Response) => {
    try {
      const cacheKey = 'all_products';
      const cachedProducts = await redis.get(cacheKey);

      if (cachedProducts) {
        return res.json(JSON.parse(cachedProducts));
      }

      const products = await Producto.findAll();
      await redis.set(cacheKey, JSON.stringify(products), 'EX', 3600); // Cache por 1 hora
      res.json(products);
    } catch (error) {
      res.status(500).json({ error: 'Error al encontrar los productos' });
    }
  }

  static getProductById = async (req: Request, res: Response) => {
    const { id } = req.params;
    try {
      const producto = await Producto.findByPk(id);
      if (!producto) {
        return res.status(404).json({ error: 'Producto no encontrado' });
      }
      res.json(producto);
    } catch (error) {
      res.status(500).json({ error: 'Error al obtener el producto' });
    }
  }

  static createProduct = async (req: Request, res: Response) => {
    const { nombre, precio, activado } = req.body;
    const transaction = await sequelize.transaction({
      isolationLevel: Transaction.ISOLATION_LEVELS.REPEATABLE_READ // Isolation
    });

    try {
      // Consistency
      if (!nombre || !precio) {
        throw new Error('Nombre y precio son requeridos');
      }

      // Crear el producto
      const newProduct = await Producto.create({
        nombre,
        precio,
        activado: activado ?? true
      }, { transaction });

      await transaction.commit(); // Atomicity
      res.status(201).json(newProduct);
    } catch (error) {
      await transaction.rollback(); // Atomicity
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default ProductController;