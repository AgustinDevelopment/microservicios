import { Request, Response } from "express";
import Pago from "../models/Pago";
import { createCircuitBreaker } from '../utils/circuitBreaker';
import sequelize from "../config/db";

class PaymentController {
  // Método genérico para manejar reintentos
  static async withRetries(action: () => Promise<any>, retries: number = 3): Promise<any> {
    let attempt = 0;
    while (attempt < retries) {
      try {
        return await action();
      } catch (error) {
        attempt++;
        if (attempt >= retries) {
          throw error; // Lanzar error si se superan los intentos
        }
      }
    }
  }

  // Other methods can be added here
}

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

export const compensatePayment = async (req: Request, res: Response) => {
  const { paymentId } = req.params;

  const transaction = await sequelize.transaction();

  try {
    // Buscar el pago en la base de datos
    const payment = await PaymentController.withRetries(() => Pago.findByPk(paymentId, { transaction }), 3);

    if (!payment) {
      await transaction.rollback(); // Revertir la transacción si no se encuentra el pago
      return res.status(404).json({ error: 'Pago no encontrado' });
    }

    // Eliminar el registro del pago
    await payment.destroy({ transaction });

    // Confirmar la transacción
    await transaction.commit();

    // Ahora solo retornamos un mensaje exitoso.
    // La compensación del inventario (reversión de stock) ya debe ser gestionada por el orquestador
    return res.json({ message: 'Pago revertido exitosamente. La compensación de inventario debe ser gestionada por el orquestador.' });
  } catch (error) {
    await transaction.rollback(); // Asegurarse de hacer rollback en caso de error
    if (error instanceof Error) {
      console.error('Error al revertir el pago:', error.message);
    } else {
      console.error('Error al revertir el pago:', error);
    }
    return res.status(500).json({ error: 'Error al revertir el pago' });
  }

}