import { Router } from 'express';
import { updateStock, getStockByProductId, checkInventory, createInventory, revertPurchase } from '../controllers/stockController';

const router = Router();
router.get('/stock/:producto_id', getStockByProductId);
router.put('/stock/:producto_id', updateStock);
router.get('/stock/check/:producto_id', checkInventory);
router.post('/stock/create', createInventory);
router.put('/revert/:producto_id', revertPurchase);

export default router;
