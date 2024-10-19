import { Router } from 'express';
import { realizarTransaccion } from '../controllers/transactionController';

const router = Router();

router.post('/process-order', realizarTransaccion);

export default router;