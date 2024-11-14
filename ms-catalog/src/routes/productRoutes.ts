import { Router } from 'express';
import { ProductController } from '../controllers/productController';
import { handleInputErrors } from '../middleware/index'
import { body } from 'express-validator';


const router = Router();

router.get('/productos', ProductController.getProduct);
router.get('/productos/:id', ProductController.getProductById);
router.post('/productos/create', 
    
    body('nombre')
        .notEmpty()
        .withMessage('Nombre es requerido'),

    body('precio')
        .isFloat({ gt: 0 })
        .withMessage('Precio debe ser un número mayor que 0'),

    body('activado')
        .isBoolean()
        .withMessage('Activado debe ser un booleano'),
    

    handleInputErrors,
    ProductController.createProduct
)

export default router;
