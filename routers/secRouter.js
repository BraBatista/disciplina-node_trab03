/*const express = require('express')
const secRouter = express.Router()
const bcrypt = require('bcryptjs') 
*/ 
// middleware teste
/*secRouter.get('/', (req, res, next) => {
    res.send('API de segurança')
})*/ 
/* 
secRouter.post ('/register', (req, res) => { 
    knex ('usuario') 
        .insert({ 
            nome: req.body.nome,  
            login: req.body.login,  
            senha: bcrypt.hashSync(req.body.senha, 8),  
            email: req.body.email 
        }, ['id']) 
        .then((result) => { 
            let usuario = result[0] 
            res.status(200).json({"id": usuario.id })  
            return 
        }) 
        .catch(err => { 
            res.status(500).json({  
                message: 'Erro ao registrar usuário - ' + err.message }) 
        })   
}) 

module.exports = secRouter
*/