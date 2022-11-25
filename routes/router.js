const express = require('express')
const router = express.Router()
const conexion = require('../database/db')
const controller = require('../controllers/authcontroller')

//router para las vistas
router.get('/',(req,res)=>{    
    res.render('index',{msg:'CARLOS'})
})

router.get('/login',(req,res)=>{
    res.render('login')
})

router.get('/register',(req,res)=>{
    res.render('register')
})

//router para los metodos del controller

router.post('/register',controller.register)

module.exports = router