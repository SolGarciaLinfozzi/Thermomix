const express = require('express')          //revisar cuales son necesarias
const app = express()
const mysql = require('mysql2')
const hbs = require('hbs')
const path = require('path')
const nodemailer = require('nodemailer')
const bcryptjs = require(`bcryptjs`)
const session = require(`express-session`)
const { default: swal } = require('sweetalert')

require('dotenv').config()

//configuración puerto
const PORT = process.env.PORT || 9000

//middelware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static(path.join(__dirname, 'public')))

//express-session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true
}))

//configuración hbs
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
hbs.registerPartials(path.join(__dirname, 'views/partials'))

//conexión a la base de datos
const conexion = mysql.createConnection({
    host: process.env.HOST,
    port: process.env.DBPORT,
    user: process.env.USER,
    password: process.env.PASSWORD,
    database: process.env.DATABASE
})

conexion.connect((error) => {
    if (error) {
        console.log(`El error es: ${error}`);
    } else {
        console.log(`Conectado a la Base de Datos ${process.env.DATABASE}`);
    }
})



//Rutas de las peticiones

app.get('/', (req, res) => {

    var mensajeComentario

    if (req.session.loggedin) {
        mensajeComentario = "Agregar un comentario"
    }
    else {
        mensajeComentario = "Debe iniciar sesión para agregar un comentario"
    }

    let sql = "select * from comentarios";
    conexion.query(sql, function (err, result) {
        if (err) throw err;
        res.render('index', {
            login: req.session.loggedin,
            nombreLogin: req.session.nombre,
            emailLogin: req.session.mail,
            datos: result,
            mensajeComentario: mensajeComentario
        })
    })
})


app.get('/login', (req, res) => {
    res.render('login')
})

app.get('/TM6', (req, res) => {
    res.render('TM6', {
        login: req.session.loggedin,
        nombreLogin: req.session.nombre,
        emailLogin: req.session.mail
    })
})


app.get('/contacto', (req, res) => {
    res.render('contacto', {
        login: req.session.loggedin,
        nombre: req.session.nombre,
        emailLogin: req.session.mail
    })
})


app.get('/miPerfil', (req, res) => {

    res.render('perfil', {
        login: req.session.loggedin,
        nombreLogin: req.session.nombre,
        emailLogin: req.session.mail
    })
})


//Cambiar contraseña
app.post('/cambiarContrasenia', async (req, res) => {

    const mailUsuario = req.session.mail
    const actualContrasenia = req.body.actualContrasenia
    const nuevaContrasenia = req.body.nuevaContrasenia
    let passwordHash = await bcryptjs.hash(nuevaContrasenia, 8); //constraseña encriptada

    function modificarContrasenia() {

        let sql2 = `update usuarios set contrasenia = "${passwordHash}" where email = "${mailUsuario}" `;

        conexion.query(sql2, function (err) {
            if (err) throw err;
            res.render('perfil', {
                login: req.session.loggedin,
                nombreLogin: req.session.nombre,
                emailLogin: req.session.mail,
                error: 'Contraseña modificada'
            })
        })
    }

    let sql = `select * from usuarios where email = "${mailUsuario}" `;

    conexion.query(sql, async (err, result) => {

        if (result.length == 0) {
            res.render('perfil', {
                login: req.session.loggedin,
                nombreLogin: req.session.nombre,
                emailLogin: req.session.mail,
                error: 'ERROR'
            })
        }
        else {
            if (!(await bcryptjs.compare(actualContrasenia, result[0].contrasenia))) {
                res.render('perfil', {
                    login: req.session.loggedin,
                    nombreLogin: req.session.nombre,
                    emailLogin: req.session.mail,
                    error: 'Error: contraseña actual incorrecta'
                })
            }
            else {
                modificarContrasenia()
            }
        }

    })

})


//Cerrar sesión
app.post('/cerrarSesion', (req, res) => {

    function cerrarSesion() {
        var mensajeComentario

        req.session.loggedin = false

        if (req.session.loggedin) {
            mensajeComentario = "Agregar un comentario"
        }
        else {
            mensajeComentario = "Debe iniciar sesión para agregar un comentario"
        }

        let sql = "select * from comentarios";
        conexion.query(sql, function (err, result) {
            if (err) throw err;
            res.render('index', {
                login: req.session.loggedin,
                nombreLogin: req.session.nombre,
                emailLogin: req.session.mail,
                datos: result,
                mensajeComentario: mensajeComentario
            })
        })
    }

    cerrarSesion()

})

//Eliminar cuenta
app.post('/eliminarCuenta', (req, res) => {

    function eliminarCuenta() {
        req.session.loggedin = false
        var mensajeComentario

        if (req.session.loggedin) {
            mensajeComentario = "Agregar un comentario"
        }
        else {
            mensajeComentario = "Debe iniciar sesión para agregar un comentario"
        }


        let sql = `DELETE FROM usuarios where email = "${req.session.mail}" `;
        conexion.query(sql, function (err, result) {
            if (err) throw err;
            let sql2 = "select * from comentarios"
            conexion.query(sql2, function (err, result) {
                if (err) throw err;
                res.render('index', {
                    login: req.session.loggedin,
                    nombreLogin: req.session.nombre,
                    emailLogin: req.session.mail,
                    datos: result,
                    mensajeComentario: mensajeComentario
                })
            })
        })
    }

    eliminarCuenta()

})

//Comentarios
app.post('/', (req, res) => {
    const comentario = req.body.comentario
    const nombreUsuario = req.session.nombre
    const mailUsuario = req.session.mail
    var mensajeComentario

    if (req.session.loggedin) {
        mensajeComentario = "Agregar un comentario"
    }
    else {
        mensajeComentario = "Debe iniciar sesión para agregar un comentario"
    }

    function comentar() {

        if (req.session.loggedin) {
            let datos = {
                email: mailUsuario,
                nombre: nombreUsuario,
                comentario: comentario
            }
            let sql = "INSERT INTO comentarios SET ?"
            conexion.query(sql, datos, function (err) {
                if (err) throw err;
                let sql2 = "select * from comentarios";
                conexion.query(sql2, function (err, result) {
                    if (err) throw err;
                    res.render('index', {
                        login: req.session.loggedin,
                        nombreLogin: req.session.nombre,
                        emailLogin: req.session.mail,
                        datos: result,
                        mensajeComentario: mensajeComentario
                    })
                })
            })
        }
        else {
            let sql3 = "select * from comentarios";
            conexion.query(sql3, function (err, result) {
                if (err) throw err;
                res.render('index', {
                    login: req.session.loggedin,
                    nombreLogin: req.session.nombre,
                    emailLogin: req.session.mail,
                    datos: result,
                    mensajeComentario: mensajeComentario
                })
            })
        }
    }

    comentar()

})

//Inicio de sesión
app.post('/sesion', async (req, res) => {

    const mailUsuario = req.body.emailUsuario
    const passwordUsuario = req.body.passwordUsuario
    let passwordHash = await bcryptjs.hash(passwordUsuario, 8)
    var mensajeComentario

    mensajeComentario = "Agregar un comentario"



    let sql = `select * from usuarios where email = "${mailUsuario}" `;

    conexion.query(sql, async (err, result) => {

        if (result.length == 0) {

            res.render('login', { error: 'Error: usuario NO registrado' })

        }
        else {
            if (!(await bcryptjs.compare(passwordUsuario, result[0].contrasenia))) {
                res.render('login', { error: 'Error: Contraseña incorrecta' })

            }
            else {
                req.session.loggedin = true
                req.session.nombre = result[0].nombre
                req.session.mail = result[0].email
                let sql2 = "select * from comentarios";
                conexion.query(sql2, function (err, result) {
                    if (err) throw err;
                    res.render('index', {
                        login: req.session.loggedin,
                        nombreLogin: req.session.nombre,
                        emailLogin: req.session.mail,
                        datos: result,
                        mensajeComentario: mensajeComentario
                    })
                })
            }
        }
    })
})



//Registro
app.post('/login', async (req, res) => {

    const nombreRegistro = req.body.name
    const passwordRegistro = req.body.password
    const emailRegistro = req.body.email
    let passwordHash = await bcryptjs.hash(passwordRegistro, 8); //constraseña encriptada


    //funcion para enviar Email al cliente
    async function enviarMail() {

        //Configuración cuenta de envío
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAILPASSWORD
            },
            tls: { rejectUnauthorized: false }
        });

        //Envío del mail
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: `${emailRegistro}`,
            subject: "Thermomix :: Registro exitoso",
            html: `Muchas gracias por sumarte a nuestra comunidad <br> Recibirás novedades y promociones exclusivas a esta dirrección de correo. :) `
        })
    }

    let datos = {
        email: emailRegistro,
        nombre: nombreRegistro,
        contrasenia: passwordHash
    }
    let sql = "INSERT INTO usuarios SET ?"
    conexion.query(sql, datos, function (err) {
        if (err) {
            res.render('login', { error: 'Error: El email ya se encuentra registrado' })


        } else {
            enviarMail()
            res.render('login', { error: 'Registro exitoso' })
        }

    })
})

//Consultas
app.post('/contacto', (req, res) => {
    const email = req.body.email
    const consulta = req.body.consulta
    const nombre = req.body.nombre

    //funcion para enviar Email al cliente
    async function enviarMail() {

        //Configuración cuenta de envío
        let transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAILPASSWORD
            },
            tls: { rejectUnauthorized: false }
        });

        //Envío del mail
        let info = await transporter.sendMail({
            from: process.env.EMAIL,
            to: `${email}`,
            subject: `${nombre} recibimos su consulta`,
            html: ` Dentro de 48hs un agente Thermomix se contatará contigo mediante este mail para asesorarte. Atentamente el equipo de Thermomix. `
        })
    }

    //inserto datos en la tabla de la BD thermomix
    let datos = {
        nombre: nombre,
        email: email,
        consulta: consulta
    }

    let sql = "INSERT INTO consultas SET ?"
    conexion.query(sql, datos, function (err) {
        if (err) throw err;
        enviarMail()
    })

})


// servidor 
app.listen(PORT, () => {
    console.log(`Servidor trabajando en el puerto ${PORT}`);
})
