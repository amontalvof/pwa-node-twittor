// imports
importScripts('https://cdn.jsdelivr.net/npm/pouchdb@8.0.0/dist/pouchdb.min.js');
importScripts('js/sw-db.js');
importScripts('js/sw-utils.js');

const STATIC_CACHE = 'static-v2';
const DYNAMIC_CACHE = 'dynamic-v1';
const INMUTABLE_CACHE = 'inmutable-v1';

const APP_SHELL = [
    '/',
    'index.html',
    'css/style.css',
    'img/favicon.ico',
    'img/avatars/hulk.jpg',
    'img/avatars/ironman.jpg',
    'img/avatars/spiderman.jpg',
    'img/avatars/thor.jpg',
    'img/avatars/wolverine.jpg',
    'js/app.js',
    'js/sw-utils.js',
    'js/libs/plugins/mdtoast.min.js',
    'js/libs/plugins/mdtoast.min.css',
];

const APP_SHELL_INMUTABLE = [
    'https://fonts.googleapis.com/css?family=Quicksand:300,400',
    'https://fonts.googleapis.com/css?family=Lato:400,300',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.2.1/css/all.min.css',
    'https://cdnjs.cloudflare.com/ajax/libs/animate.css/3.7.0/animate.css',
    'https://cdnjs.cloudflare.com/ajax/libs/jquery/3.3.1/jquery.min.js',
    'https://cdn.jsdelivr.net/npm/pouchdb@8.0.0/dist/pouchdb.min.js',
];

self.addEventListener('install', (e) => {
    const cacheStatic = caches
        .open(STATIC_CACHE)
        .then((cache) => cache.addAll(APP_SHELL));

    const cacheInmutable = caches
        .open(INMUTABLE_CACHE)
        .then((cache) => cache.addAll(APP_SHELL_INMUTABLE));

    e.waitUntil(Promise.all([cacheStatic, cacheInmutable]));
});

self.addEventListener('activate', (e) => {
    const respuesta = caches.keys().then((keys) => {
        keys.forEach((key) => {
            if (key !== STATIC_CACHE && key.includes('static')) {
                return caches.delete(key);
            }

            if (key !== DYNAMIC_CACHE && key.includes('dynamic')) {
                return caches.delete(key);
            }
        });
    });

    e.waitUntil(respuesta);
});

self.addEventListener('fetch', (e) => {
    let respuesta;
    if (e.request.url.includes('/api')) {
        respuesta = manejoApiMensajes(DYNAMIC_CACHE, e.request);
    } else {
        respuesta = caches.match(e.request).then((res) => {
            if (res) {
                actualizaCacheStatico(
                    STATIC_CACHE,
                    e.request,
                    APP_SHELL_INMUTABLE
                );
                return res;
            } else {
                return fetch(e.request).then((newRes) => {
                    return actualizaCacheDinamico(
                        DYNAMIC_CACHE,
                        e.request,
                        newRes
                    );
                });
            }
        });
    }

    e.respondWith(respuesta);
});

// async tasks
self.addEventListener('sync', (e) => {
    if (e.tag === 'nuevo-post') {
        const respuesta = postearMensajes();
        e.waitUntil(respuesta);
    }
});

// Listen push
self.addEventListener('push', (e) => {
    const data = JSON.parse(e.data.text());
    const title = data.title;
    const options = {
        body: data.body,
        // icon: `img/icons/icon-72x72.png`,
        icon: `img/avatars/${data.user}.jpg`,
        badge: 'img/favicon.ico',
        // image: 'https://datainfox.com/wp-content/uploads/2017/10/avengers-tower.jpg',
        vibrate: [
            125, 75, 125, 275, 200, 275, 125, 75, 125, 275, 200, 600, 200, 600,
        ],
        openUrl: '/',
        data: {
            url: '/',
            id: data.user,
        },
        // actions: [
        //     {
        //         action: 'thor-action',
        //         title: 'Thor',
        //         icon: 'img/avatars/thor.jpg',
        //     },
        // ],
    };
    e.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclose', (e) => {
    console.log('Notification closed', e);
});

self.addEventListener('notificationclick', (e) => {
    const notificacion = e.notification;
    // const accion = e.action;
    // console.log({ notificacion, accion });
    const resp = clients.matchAll().then((c) => {
        let cliente = c.find((i) => i.visibilityState === 'visible');
        if (cliente !== undefined) {
            cliente.navigate(notificacion.data.url);
            cliente.focus();
        } else {
            clients.openWindow(notificacion.data.url);
        }
        return notificacion.close();
    });
    e.waitUntil(resp);
});
