import { Router } from 'express';
import { realizarTransaccion } from '../controllers/transactionController';

const router = Router();
router.post('/transaction', realizarTransaccion);

export default router;
