import { Router } from 'express';
import { executeTransaction } from '../controllers/transactionController';

const router = Router();
router.post('/transaccion', executeTransaction);

export default router;
