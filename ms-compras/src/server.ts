import express from 'express'
import colors from 'colors'
import cors, { CorsOptions } from 'cors'
import db from './config/db'
import router from './routes/compraRoutes'

export async function connectDB() {

    try {
        await db.authenticate()
        db.sync()
    } catch (error) {
        console.log(colors.bgRed.white('Hubo un error al conectar a la BD'), error)
    }
}

connectDB()

// Instancia de express
const server = express()

// Leer datos de formularios
server.use(express.json())

server.use('/api/products', router)

server.get('/api', (req, res) => {
    res.json({msg: 'Desde API'})
})

export default server