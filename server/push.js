const urlSafeBase64 = require('urlsafe-base64');
const webpush = require('web-push');
const database = require('./db');
// const fs = require('fs');
// const suscripciones = require('./subs-db.json');

webpush.setVapidDetails(
    'mailto:camontf92@gmail.com',
    process.env.PUBLIC_VAPID_KEY,
    process.env.PRIVATE_VAPID_KEY
);

module.exports.getKey = () => {
    return urlSafeBase64.decode(process.env.PUBLIC_VAPID_KEY);
};

module.exports.addSubscription = (subscription) => {
    database.insert(subscription);
    // suscripciones.push(subscription);
    // fs.writeFileSync(
    //     `${__dirname}/subs-db.json`,
    //     JSON.stringify(suscripciones)
    // );
};

module.exports.sendPush = (post) => {
    database.find({}, (err, docs) => {
        if (err) {
            console.log(err);
        }
        docs.forEach((doc) => {
            webpush.sendNotification(doc, JSON.stringify(post)).catch((err) => {
                if (err.statusCode === 410) {
                    database.remove({ _id: doc._id });
                }
            });
        });
    });
    // const notificacionesEnviadas = [];
    // suscripciones.forEach((sus, i) => {
    //     const pushProm = webpush
    //         .sendNotification(sus, JSON.stringify(post))
    //         .catch((err) => {
    //             if (err.statusCode === 410) {
    //                 suscripciones[i].borrar = true;
    //             }
    //         });
    //     notificacionesEnviadas.push(pushProm);
    // });
    // Promise.all(notificacionesEnviadas).then(() => {
    //     const suscripcionesActivas = suscripciones.filter((sub) => !sub.borrar);
    //     fs.writeFileSync(
    //         `${__dirname}/subs-db.json`,
    //         JSON.stringify(suscripcionesActivas)
    //     );
    // });
};
