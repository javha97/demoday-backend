import express from 'express'
import bodyParser from 'body-parser'
import cors from 'cors'
import products from './crud/products.js'
import news from './crud/routes.js'
const app = express()
app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true, parameterLimit: 50000 }))
app.use(express.json())
const port = 8080;
app.use(cors())
app.use('/news', news)
app.use('/', products)
app.listen(port, () => {
    console.log(`app listening on port ${port}`)
})