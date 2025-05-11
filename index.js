import app from './src/app.js';

//.env
process.loadEnvFile();

const port = process.env.PORT || 3600;


//Conexión del servidor
app.listen(port, () => {
    console.log(`Servidor conectado en el puerto..... ${port}`);
    console.log(`Documentación disponible en http://localhost:${port}/api-docs`);

})

