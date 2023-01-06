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

// Post mensajes
router.post('/', function (req, res) {
    const mensaje = {
        mensaje: req.body.mensaje,
        user: req.body.user,
    };
    mensajes.push(mensaje);
    console.log(mensajes);
    res.json({ ok: true, mensaje });
});

// Almacenar suscripciones
router.post('/subscribe', (req, res) => {
    res.json('subscribe');
});

// Obtener llave pública
router.get('/key', (req, res) => {
    res.json('key publico');
});

// Enviar notificación push
// Es algo que se hace desde el servidor
// No se expone en la API
// Esta asi ahora para poder acceder desde postman
router.post('/push', (req, res) => {
    res.json('push');
});

module.exports = router;
