import mysql2 from 'mysql2/promise';

//.env
process.loadEnvFile();


const db = mysql2.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    port: process.env.DB_PORT || 3306,
    database: process.env.DB_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0

});

const check = async () => {
    try {
        const connection = await db.getConnection();
        console.log('Conectado correctamente a MYSQL');
        connection.release();
    } catch (error) {
        console.log('Error de conexión', error);
        process.exit(1)
    }
}
check();

export default db;

