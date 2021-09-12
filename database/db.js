const mysql = require('mysql');

const connection = mysql.createConnection({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_DATABASE
})

// Estado de la conexión
connection.connect((error) => {
    if(error){
        console.log(`El error de conexión es: ${error}`);
        return;
    }
    console.log('¡Conectado a la base de datos!');
})

// Exportamos todo el modulo para poder usarlo en cualquier arichivo del proyecto
module.exports = connection;