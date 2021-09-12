// 1 - Invocamos a express
const express = require('express');
const app = express(); //instancia de express

// 2 - seteamos urlencoded para capturar los datos del formulario
// Para eviatar los errores que puedan ocacionar la captura de los datos de formularios 
// Ej: variables no definidas
app.use(express.urlencoded({extended:false}));
// indicamos que vamos a usar formatos json
app.use(express.json());

// 3 - invocamos a dotenv para configurar variables de entorno
const dotenv = require('dotenv');
// indicamos donde vamos guardar las variables de entorno
dotenv.config({path: './env/.env'})

// 4 - archivos estaticos 
// referenciamos a la carpeta public, via de acceso absoluta del directorio.
app.use(express.static('public'));
// indicamos que todo lo que refenciamos con /resources en estatico
app.use('/resources', express.static(__dirname + '/public')); 

// 5 - Configurar plantilla ejs
const ejs = require('ejs');
app.set('view engine', 'ejs');


// 6 - Invocamos a bcryptjs que nos permite hashear
const bcryptjs = require('bcryptjs');

// 7 - Variables de session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}));

// 8 - Invocamos al módulo de conexión de la BD
const connection = require('./database/db');



// 9 - Estableciendo las rutas
    app.get('/registro', (req, res) => {
        res.render('registro', {nombre: 'Pardo'});
    })
    app.get('/login', (req, res) => {
        res.render('login', {nombre: 'Pard'});
    })


// 10 - Registro
app.post('/registro', async(req, res) => {
    const email = req.body.email;
    const user = req.body.user;
    const name = req.body.name;
    const rol = req.body.rol;
    const pass = req.body.pass;
    let passHash = await bcryptjs.hash(pass, 8);

    // Agregar datos a la tabla login_node_curso 
    connection.query('INSERT INTO login_node_curso SET ?', 
    {email:email, user:user, name:name, rol:rol, pass:passHash}, async(error, result) => {
        if(error){
            console.log(error);
        }else{
            res.render('registro', {
                alert: true,
                alertTitle: 'Registration',
                alertMessage: '¡Seccesful Registration!',
                alertIcon: 'success',
                showConfirmButton: false,
                timer: 1500,
                ruta: 'login'
            });
        }
    })
})


// 11 - Autenticación 
app.post('/auth', async(req, res) => {
    const email = req.body.email;
    const pass = req.body.pass;
    let passwordHash = await bcryptjs.hash(pass, 8);

    if(email && pass){
        connection.query('SELECT * FROM login_node_curso WHERE email = ?', [email], async (error, results) => {
            if(results.length == 0 || !(await bcryptjs.compare(pass, results[0].pass))){
                res.render('login',{
                    alert: true,
                    alertTitle: 'Error',
                    alertMessage: 'Usuario y/o password incorrectas',
                    alertIcon: 'error',
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'login'   
                });
            }else{
                
                req.session.loggedin = true;  // variable de sesión
                req.session.name = results[0].name;
                res.render('login', {
                    alert: true,
                    alertTitle: 'Conexión exitosa',
                    alertMessage: '¡Login Correcto!',
                    alertIcon: 'success',
                    showConfirmButton: false    ,
                    timer: 1500,
                    ruta: '/'
                });
            }
        })
    }else{
        res.render('login', {
            alert: true,
            alertTitle: 'Advertencia',
            alertMessage: '¡Por favor ingrese un usuario y/o una password!',
            alertIcon: 'warning',
            showConfirmButton: true,
            timer: false,
            ruta: 'login'
        });
    }
})

// 12 - Auth pages
app.get('/', (req, res) =>{
    if(req.session.loggedin){
        res.render('index', {
            login: true,
            name: req.session.name
        });
    }else{
        res.render('index', {
            login: false,
            name: 'Debe iniciar sesión'
        })
    }
})

// 13 - Logout
app.get('/logout', (req, res) => {
    req.session.destroy(() => {
        res.redirect('/')
    })
})


// conexion con el puerto
app.listen(3000, (req, res) => {
    console.log(`SERVER RUNNING IN http://localhost:3000`);
})