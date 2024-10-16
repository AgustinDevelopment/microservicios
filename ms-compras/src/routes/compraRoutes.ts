import  { Router } from 'express'
import CompraController from '../controllers/compraController'

const router = Router()

router.get('/compras', CompraController.getAllCompras)
router.post('/compra/create', CompraController.createCompra)

export default router

