import { Router } from 'express';
import { updateStock, getStockByProductId } from '../controllers/stockController';

const router = Router();
router.get('/stock/:producto_id', getStockByProductId);
router.put('/stock/:producto_id', updateStock);

export default router;
