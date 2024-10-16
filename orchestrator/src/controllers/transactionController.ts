import { Request, Response } from 'express';
import axios from 'axios';

export const executeTransaction = async (req: Request, res: Response) => {
  const { producto_id, medio_pago, cantidad, direccion_envio } = req.body;

  try {
    // Paso 1: Obtener detalles del producto del ms-catalog
    const productoResponse = await axios.get(`http://localhost:4000/api/products/productos/${producto_id}`);
    const producto = productoResponse.data;

    // Paso 2: Realizar el pago a través del ms-pagos
    const pagoResponse = await axios.post('http://localhost:4003/api/pagos', {
      productoi_id: producto_id,
      precio: producto.precio,
      medio_pago: medio_pago,
    });
    const pago = pagoResponse.data;

    // Paso 3: Actualizar el inventario en el ms-inventory
    const stockResponse = await axios.post('http://localhost:4002/api/products/stock', {
      producto_id: producto_id,
      fecha_transaccion: new Date(),
      cantidad: cantidad,
      entrada_salida: 2, // salida de inventario
    });
    const stock = stockResponse.data;

    // Paso 4: Registrar la compra en el ms-compras
    const compraResponse = await axios.post('http://localhost:4001/api/products/compra/create', {
      producto_id: producto_id,
      fecha_compra: new Date(),
      direccion_envio: direccion_envio,
    });
    const compra = compraResponse.data;

    // Responder con los detalles de la transacción
    res.status(201).json({
      message: 'Transacción completada exitosamente',
      producto,
      pago,
      stock,
      compra,
    });
  } catch (error) {
    res.status(500).json({ error });
  }
};
