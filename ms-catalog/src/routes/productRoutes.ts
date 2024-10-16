import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/productos', ProductController.getProduct);
router.get('/productos/:id', ProductController.getProductById);
router.post('/productos/create', ProductController.createProduct)

export default router;
