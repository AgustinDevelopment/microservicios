import { Router } from 'express';
import { compensatePayment, createPago, proccesPayment } from '../controllers/paymentController';

const router = Router();
router.post('/pagos',  createPago);
router.post('/pagos/procesar', proccesPayment);
router.delete('/:paymentId', compensatePayment);

export default router;
