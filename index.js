import express from 'express';
import cors from 'cors';
import morgan from 'morgan';

import clientsRoutes from './src/routes/clientsRoutes.js'
import estateRoutes from './src/routes/estateRoutes.js';
import billsRoutes from './src/routes/billsRoutes.js';
import ownersRoutes from './src/routes/ownersRoutes.js';

//.env
process.loadEnvFile();

//Variables
const app = express();
const port = process.env.PORT || 3600;

//Middleware
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));
/*app.use((req, res, next)=>{
    res.status(500).json({msg: 'Error del servidor'})
})*/

//Conexión a la DB
app.use('/api/clients', clientsRoutes)
app.use('/api/estates', estateRoutes)
app.use('/api/bills', billsRoutes)
app.use('/api/owners', ownersRoutes)

//Conexión del servidor
app.listen(port, () => {
    console.log(`Servidor conectado en el puerto..... ${port}`);
})

