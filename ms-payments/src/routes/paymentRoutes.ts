import { Router } from 'express';
import { proccesPayment } from '../controllers/paymentController';

const router = Router();
router.post('/pagos', proccesPayment);

export default router;
