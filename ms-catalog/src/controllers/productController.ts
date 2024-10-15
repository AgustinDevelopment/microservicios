import { Request, Response } from 'express';
import Producto from '../models/Producto';

export class ProductController {

  static getProduct = async (req: Request, res: Response) => {

    try {
        const products = await Producto.findAll()
        res.json(products)
    } catch (error) {
        res.status(500).json({error: 'Error al encontrar los productos'})
    }

  }

}

export default ProductController


