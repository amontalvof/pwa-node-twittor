const db = new PouchDB('mensajes');

function guardarMensaje(mensaje) {
    mensaje._id = new Date().toISOString();
    return db.put(mensaje).then(() => {
        self.registration.sync.register('nuevo-post');
        const newResp = { ok: true, offline: true };
        return new Response(JSON.stringify(newResp));
    });
}
