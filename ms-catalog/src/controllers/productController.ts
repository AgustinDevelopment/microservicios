import { Request, Response } from 'express';
import Producto from '../models/Producto';

import Stock from '../../../ms-inventario/src/models/Stock'

export class ProductController {

  static getProduct = async (req: Request, res: Response) => {

    try {
        const products = await Producto.findAll()
        res.json(products)
    } catch (error) {
        res.status(500).json({error: 'Error al encontrar los productos'})
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

    const { nombre, precio, activado, cantidad_inicial } = req.body

    try {
      const newProduct = await Producto.create({
        nombre,
        precio,
        activado: activado ?? true
      })

      await Stock.create({
        producto_id: newProduct.id,
        fecha_transaccion: new Date(),
        cantidad: cantidad_inicial,
        entrada_salida: 1
      })

      res.status(201).json(newProduct)
    } catch (error) {
      res.status(500).json({error: 'Error al crear el producto'})
    }

  }

}

export default ProductController


