import { Router } from 'express';
import { updateStock, getStockByProductId, checkInventory } from '../controllers/stockController';

const router = Router();
router.get('/stock/:producto_id', getStockByProductId);
router.put('/stock/:producto_id', updateStock);
router.get('/stock/check/:producto_id', checkInventory);

export default router;
