require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

// export one function that gets called once as the server is being initialized
module.exports = function (app, server) {

    const db_options = {
        dbName: process.env.DB_NAME,
        user: process.env.DB_USER,
        pass: process.env.DB_PASS,
        useNewUrlParser: true,
        useUnifiedTopology: true
    }
    mongoose.connect(process.env.DB_ADDRESS, db_options)
        .then(() => console.log('database [OK]'))
        .catch((error) => console.error(`database [ERROR] ${error}`));

    app.use((req, res, next) => {
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
        res.setHeader('Access-Control-Allow-Methods', '*');
        next();
    });

    app.use(express.json());

    const io = require('socket.io')(server, {
        cors: {
            origin: "http://localhost",
            methods: ["GET", "POST"]
        }
    })

    require('./socket/chat')(io);
    app.use(function (req, res, next) { req.io = io; next(); });
}
