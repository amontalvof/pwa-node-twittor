// Guardar  en el cache dinamico
function actualizaCacheDinamico(dynamicCache, req, res) {
    if (res.ok) {
        return caches.open(dynamicCache).then((cache) => {
            if (
                !req.url.includes('chrome-extension') &&
                !(
                    req.url.includes('localhost') ||
                    req.url.includes('127.0.0.1')
                )
            ) {
                //skip request
                cache.put(req, res.clone());
            }

            return res.clone();
        });
    } else {
        return res;
    }
}

// Cache with network update
function actualizaCacheStatico(staticCache, req, APP_SHELL_INMUTABLE) {
    if (APP_SHELL_INMUTABLE.includes(req.url)) {
        // No hace falta actualizar el inmutable
        // console.log('existe en inmutable', req.url );
    } else {
        // console.log('actualizando', req.url );
        return fetch(req).then((res) => {
            return actualizaCacheDinamico(staticCache, req, res);
        });
    }
}

// Network with cache fallback / update
function manejoApiMensajes(cacheName, req) {
    if (req.clone().method === 'POST') {
        req.clone()
            .text()
            .then((body) => {
                const bodyObj = JSON.parse(body);
                guardarMensaje(bodyObj);
            });
        return fetch(req);
    } else {
        return fetch(req)
            .then((res) => {
                if (res.ok) {
                    actualizaCacheDinamico(cacheName, req, res.clone());
                    return res.clone();
                } else {
                    return caches.match(req);
                }
            })
            .catch((err) => {
                return caches.match(req);
            });
    }
}
