const express = require('express')
const apiRouter = express.Router()
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

const knex = require('knex') ({
    client: 'pg',
    connection:  {
        connectionString : process.env.DATABASE_URL,
        ssl: { rejectUnauthorized: false },
    }
})

let checkToken = (req, res, next) => {
    let authToken = req.headers["authorization"]
    if(!authToken) {
        res.status(401).json({ message: 'Token de acesso requerida.' })
    }
    else {
        let token = authToken.split(' ')[1]
        req.token = token
    }
    jwt.verify(req.token, process.env.SECRET_KEY, (err, decodeToken) => {
        if(err) {
            res.status(401).json({ message: 'Acesso Negado.' })
            return
        }
        req.usuarioId = decodeToken.id
        next()
    })
}

let isAdmin = (req, res, next) => { 
    knex 
        .select ('*').from ('usuario').where({ id: req.usuarioId }) 
        .then ((usuarios) => { 
            if (usuarios.length) { 
                let usuario = usuarios[0] 
                let roles = usuario.roles.split(';') 
                let adminRole = roles.find(i => i === 'ADMIN') 
                if (adminRole === 'ADMIN') { 
                    next() 
                    return 
                } 
                else { 
                    res.status(403).json({ message: 'Role de ADMIN requerida' }) 
                    return 
                } 
            } 
        }) 
        .catch (err => { 
            res.status(500).json({  
              message: 'Erro ao verificar roles de usuário - ' + err.message }) 
        }) 
} 

// middleware processar o body em formato urlenconded
apiRouter.use(express.urlencoded({ extended: true }))
//middleware que processa o body em formato JSON
apiRouter.use(express.json())

// middleware Obter a lista de produtos do banco - RETRIEVE
apiRouter.get('/produtos', checkToken, (req, res, next) => {
    knex.select('*')
        .from('produto')
        .then(produtos => {
            res.status(200).json(produtos)
        })
        .catch(err => { 
            res.status(500).json({  
            message: 'Erro ao recuperar produtos - ' + err.message }) 
        })   
})

// middleware Obter um produto específico do banco - RETRIEVE
apiRouter.get('/produtos/:id', checkToken, (req, res, next) => {
     knex.select('*')
        .from('produto')
        .where({ id: req.params.id })
        .then(produtos => {
            if(produtos.length)
                res.status(200).json(produtos[0])
            else
                res.status(404).json({ message: 'Produto não encontrado!' })
        })
        .catch(err => { 
            res.status(500).json({  
            message: 'Erro ao recuperar produto - ' + err.message }) 
        })
})

// middleware Incluir um produto (Post) no banco - CREATE
apiRouter.post('/produtos', checkToken, isAdmin, (req, res, next) => {
    knex('produto')
        .insert({ descricao: req.body.descricao, valor: req.body.valor, marca: req.body.marca })
        .then(result => {
            res.status(201).json({ message: 'Produto incluído com sucesso!' })    
        })
        .catch(err => { 
            res.status(500).json({  
            message: 'Erro ao incluir produto - ' + err.message }) 
        })
})

// middleware Alterar um produto (Put) no banco - UPDATE
apiRouter.put('/produtos/:id', checkToken, isAdmin, (req, res, next) => {
    knex('produto')
        .where({ id: req.params.id })
        .update({ descricao: req.body.descricao, valor: req.body.valor, marca: req.body.marca })
        .then(n => {
            if(n)
                res.status(200).json({ message: 'Produto alterado com sucesso!' })
            else
                res.status(404).json({ message: 'Produto não encontrado para alteração.' })
        })
        .catch(err => {
            res.status(500).json({ message: 'Erro na alteração - ' + err.message })
        })   
})

// middleware Excluir um produto no banco (Delete) - DELETE
apiRouter.delete('/produtos/:id', checkToken, isAdmin, (req, res, next) => {
    knex('produto')
        .where({ id: req.params.id })
        .del()
        .then(n => {
            if(n)
                res.status(200).json({ message: 'Produto excluído com sucesso!' })
            else
                res.status(404).json({ message: 'Produto não encontrado para exclusão.' })
        })
        .catch(err => {
            res.status(500).json({ message: 'Erro na exclusão - ' + err.message })
        })
})


// middleware de segurança, Inserir um novo usuário no banco
apiRouter.post ('/register', (req, res) => { 
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

// middleware de segurança, Login e gerar token
apiRouter.post('/login', (req, res) => {  
    knex 
      .select('*')
      .from('usuario')
      .where({ login: req.body.login }) 
      .then( usuarios => { 
          if(usuarios.length){ 
              let usuario = usuarios[0] 
              let checkSenha = bcrypt.compareSync(req.body.senha, usuario.senha) 
              if(checkSenha) { 
                var tokenJWT = jwt.sign({ id: usuario.id }, process.env.SECRET_KEY, { 
                    expiresIn: 3600 
                }) 
 
                res.status(200).json ({ 
                    id: usuario.id, 
                    login: usuario.login,  
                    nome: usuario.nome,  
                    roles: usuario.roles, 
                    token: tokenJWT 
                })   
                return  
              } 
          }  
             
          res.status(401).json({ message: 'Login ou senha incorretos.' }) 
      }) 
      .catch (err => { 
          res.status(500).json({  
             message: 'Erro ao verificar login - ' + err.message }) 
      }) 
}) 

module.exports = apiRouter