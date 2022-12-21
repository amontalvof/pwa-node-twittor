// Routes.js - Módulo de rutas
var express = require('express');
var router = express.Router();

const mensajes = [
    {
        _id: 'XXX',
        user: 'spiderman',
        mensaje: 'Hello World',
    },
    {
        _id: 'YYY',
        user: 'ironman',
        mensaje: 'lorem ipsum',
    },
];

// Get mensajes
router.get('/', function (req, res) {
    res.json(mensajes);
});

module.exports = router;
