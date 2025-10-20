const express = require('express')
require('dotenv').config()
const mongoose = require('mongoose')
const app = express()
app.use(express.json())

//affichage f console lel requests
app.use(request, res, next => {
    console.log(request.path, request.method)
    next()
})

//connection to db
mongoose.connect(process.env.URL)
    .then(() => {
        app.listen(process.env.PORT, () => {
            console.log('server works')
        })
    })
    .catch((error) => {
        console.log(error)
    })

