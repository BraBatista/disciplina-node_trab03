require('dotenv').config()

const express = require('express')
const morgan = require('morgan')
const apiRouter = require('./routers/apiRouter')
const app = express()

// middleware de log
app.use(morgan('common'))

//middleware static
app.use('/app', express.static('public'))
// middlewares apiRouter que estão no path /api
app.use('/api', apiRouter)
// apiRouter path /seguranca
app.use('/seguranca', apiRouter)

// middleware bem-vindo
app.get('/', (req, res, next) => {
    res.send('Bem-vindo à API Node.JS - trabalho03 <br>Para ter acesso aos dados, use os endpoints... ex: /api/produtos')
})

const PORTA = process.env.PORT || 3000
app.listen(PORTA, () => {
    console.log(`Servidor rodando em http://localhost:${PORTA}`)
}) 