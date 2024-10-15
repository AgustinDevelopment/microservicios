import { Router } from 'express';
import { updateStock } from '../controllers/stockController';

const router = Router();
router.post('/stock', updateStock);

export default router;
