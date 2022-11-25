//1 - invocamos a express
const express = require('express');
const dotenv = require('dotenv')
const app = express(); //constante app para utilizar los metodos de la libreria
//const cookieParser = require ('cookie-parser')
//const controller = require('./controllers/authcontroller')


//2 - seteamos urlencoded para capturar datos del formulario
app.use(express.urlencoded({extended:false}));
app.use(express.json())

//3 - invocamos a dotenv para las variables de entorno
dotenv.config({path:'./env/.env'})

//4- seteamos el directorio public
app.use(express.static('public'))
app.use('/resources',express.static('public'))
app.use('/resources',express.static(__dirname + '/public'))

//5 - setenamos el motor de plantillas EJS
app.set('view engine','ejs');

//6 - invocamos bcrypts para hashing de password
const  bcrypts = require('bcryptjs');

//7 - invocamos variables de session
const session = require('express-session');
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized:true
}));

//8- Llamado a la base de datos
const conexion = require('./database/db')


//9- rutas para las vistas

app.get('/login',(req,res)=>{
    res.render('login')
})

app.get('/register',(req,res)=>{
    res.render('register')
})

//10- ruta para register "POST"
const bcryptjs = require ('bcryptjs');
const { render } = require('ejs');
app.post('/register',async (req,res)=>{
    const name = req.body.userName
    const user = req.body.user
    const pass = req.body.userPassword
    const rol= req.body.rol
    let passHash = await bcryptjs.hash(pass,8)
        
    conexion.query(`INSERT INTO users ("usuario", "name", "password", "rol") values ('${user}','${name}','${passHash}','${rol}')`,async(error,results)=>{
        if (error){
            console.log(error)
        }else{
            res.render('register',{
                alert:true,
                alertTitle: "registracion!",
                alertMessage:"Registracion exitosa",
                alertIcon:"success",
                showConfirmBurron:false,
                timer:2500,
                ruta:""

            })
        }
    })   
    
})

//11-autenticacion
app.post('/auth', async(req,res)=>{
    const usuario = req.body.user
    const pass = req.body.pass
    let passHash = await bcryptjs.hash(pass,8)

    if(usuario && pass){
        conexion.query(`select * from users where "usuario" = '${usuario}'`,async(error,results)=>{       
            if(results.rows.length==0 || !(await bcryptjs.compare(pass,results.rows[0].password))){
                res.render('login',{
                    alert:true,
                    alertTitle: "Error",
                    alertMessage:"Usuario y/o password incorrectas",
                    alertIcon:"error",
                    showConfirmBurron:true,
                    timer:2000,
                    ruta:'login'
                })
            }else{
                req.session.loggedin = true
                req.session.user= results.rows[0].usuario
                console.log(req.session.user)
                res.render('login',{
                    alert:true,
                    alertTitle: "Conexion exitosa",
                    alertMessage:"¡LOGIN CORRECTO!",
                    alertIcon:"success",
                    showConfirmBurron:false,
                    timer:2000,
                    ruta:''
            })
            }
        })
    }else{
        res.render('login',{
            alert:true,
            alertTitle: "Advertencia",
            alertMessage:"¡Por favor ingrese un usuario y/o contraseña!",
            alertIcon:"Warning",
            showConfirmBurron:true,
            timer:2000,
            ruta:'login'
    })
    }
})


//12- Auth page
app.get('/',(req,res)=>{
    if (req.session.loggedin){
        res.render('index',{
            login:true,
            name: req.session.user
        })
    }else{
        res.render('index',{
            login: false,
            name: 'Debe iniciar sesion'
        })

    }
})

//12- Logout
app.get('/logout',(req,res)=>{
    req.session.destroy(()=>{
        res.redirect('/')
    })
})
/*// invocamos al router  
app.use('/',require('./routes/router'))*/


//seteamos el port del servidor
app.listen(3000,(req,res)=>{
    console.log ("Server running in http://localhost:3000");
})
