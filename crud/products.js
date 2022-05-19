import express from 'express'
import { getProducts, productDetail, deleteProduct, updateProduct, createProduct } from './productsFunctions.js'
let router = express.Router()
router.route('/').get(getProducts).post(createProduct)
router.route('/:id').delete(deleteProduct).patch(updateProduct).get(productDetail)
export default router