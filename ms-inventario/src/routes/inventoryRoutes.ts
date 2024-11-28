import { Router } from 'express';
import { updateStock, getStockByProductId, checkInventory, createInventory } from '../controllers/stockController';

const router = Router();
router.get('/stock/:producto_id', getStockByProductId);
router.put('/stock/:producto_id', updateStock);
router.get('/stock/check/:producto_id', checkInventory);
router.post('/stock/create', createInventory);

export default router;
