import { Router } from 'express';
import { ProductController } from '../controllers/productController';

const router = Router();

router.get('/productos', ProductController.getProduct);

export default router;
