import { Request, Response } from 'express';
import axios from 'axios';
import Producto from '../models/Producto';
import sequelize from '../config/db';

export class ProductController {

  static getProduct = async (req: Request, res: Response) => {
    try {
      const products = await Producto.findAll();
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
    const { nombre, precio, activado, cantidad_inicial } = req.body;
    const transaction = await sequelize.transaction();

    try {
      // Crear el producto
      const newProduct = await Producto.create({
        nombre,
        precio,
        activado: activado ?? true
      }, { transaction });

     

      await transaction.commit();
      res.status(201).json(newProduct);
    } catch (error) {
      await transaction.rollback();
      const errorMessage = error instanceof Error ? error.message : 'Error desconocido';
      res.status(500).json({ error: errorMessage });
    }
  }
}

export default ProductController;