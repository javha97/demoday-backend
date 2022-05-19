import express from 'express'
import {createNews, deleteNews, updateNews, getNews} from './newsRoutes.js'
let router = express.Router()
router.route('/').get(getNews).post(createNews)
router.route('/:id').delete(deleteNews).patch(updateNews)
export default router