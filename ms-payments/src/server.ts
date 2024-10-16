// Configuracion del servidor

import express from 'express'
import colors from 'colors'
import cors, { CorsOptions } from 'cors'
import morgan from 'morgan'
import router from './routes/paymentRoutes'
import db from './config/db'

// Conectar a la BD
export async function connectDB() {
    try {
        await db.authenticate()
        db.sync()
        // console.log(colors.bgBlue.white('Conexion Exitosa a la BD'))
    } catch (error) {
        console.log(colors.bgRed.white('Hubo un error al conectar a la BD'), error)
    }
}

connectDB()

// Instancia de express
const server = express()

// Permitir conexiones
const corsOptions: CorsOptions = {
    origin: function(origin, callback) {
        if (!origin || origin === process.env.FRONTEND_URL) {
            callback(null, true);
        } else {
            console.error('Origen bloqueado por CORS: ', origin);
            callback(new Error('No permitido por CORS'));
        }
    },
    credentials: true, // Para cookies o credenciales
};

server.use(cors(corsOptions));


// Leer datos de formularios
server.use(express.json())

// server.use(morgan('dev'))

server.use('/api', router)

server.get('/api', (req, res) => {
    res.json({msg: 'Desde API'})
})


export default server