var url = window.location.href;
var swLocation = '/twittor/sw.js';

if (navigator.serviceWorker) {
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
        swLocation = '/sw.js';
    }

    navigator.serviceWorker.register(swLocation);
}

// Referencias de jQuery

var titulo = $('#titulo');
var nuevoBtn = $('#nuevo-btn');
var salirBtn = $('#salir-btn');
var cancelarBtn = $('#cancel-btn');
var postBtn = $('#post-btn');
var avatarSel = $('#seleccion');
var timeline = $('#timeline');

var modal = $('#modal');
var modalAvatar = $('#modal-avatar');
var avatarBtns = $('.seleccion-avatar');
var txtMensaje = $('#txtMensaje');

var btnActivadas = $('.btn-noti-activadas');
var btnDesactivadas = $('.btn-noti-desactivadas');

// El usuario, contiene el ID del hÃ©roe seleccionado
var usuario;

// ===== Codigo de la aplicaciÃ³n

function crearMensajeHTML(mensaje, personaje) {
    var content = `
    <li class="animated fadeIn fast">
        <div class="avatar">
            <img src="img/avatars/${personaje}.jpg">
        </div>
        <div class="bubble-container">
            <div class="bubble">
                <h3>@${personaje}</h3>
                <br/>
                ${mensaje}
            </div>
            
            <div class="arrow"></div>
        </div>
    </li>
    `;

    timeline.prepend(content);
    cancelarBtn.click();
}

// Globals
function logIn(ingreso) {
    if (ingreso) {
        nuevoBtn.removeClass('oculto');
        salirBtn.removeClass('oculto');
        timeline.removeClass('oculto');
        avatarSel.addClass('oculto');
        modalAvatar.attr('src', 'img/avatars/' + usuario + '.jpg');
    } else {
        nuevoBtn.addClass('oculto');
        salirBtn.addClass('oculto');
        timeline.addClass('oculto');
        avatarSel.removeClass('oculto');

        titulo.html('<i class="fa fa-user"></i>&nbsp;&nbsp;Select Character');
    }
}

// Seleccion de personaje
avatarBtns.on('click', function () {
    usuario = $(this).data('user');

    titulo.text('@' + usuario);

    logIn(true);
});

// Boton de salir
salirBtn.on('click', function () {
    logIn(false);
});

// Boton de nuevo mensaje
nuevoBtn.on('click', function () {
    modal.removeClass('oculto');
    modal.animate(
        {
            marginTop: '-=1000px',
            opacity: 1,
        },
        200
    );
});

// Boton de cancelar mensaje
cancelarBtn.on('click', function () {
    if (!modal.hasClass('oculto')) {
        modal.animate(
            {
                marginTop: '+=1000px',
                opacity: 0,
            },
            200,
            function () {
                modal.addClass('oculto');
                txtMensaje.val('');
            }
        );
    }
});

// Boton de enviar mensaje
postBtn.on('click', function () {
    const mensaje = txtMensaje.val();
    if (mensaje.length === 0) {
        cancelarBtn.click();
        return;
    }

    const data = {
        mensaje,
        user: usuario,
    };

    fetch('api', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then((res) => res.json())
        .then((res) => console.log('app.js', res))
        .catch((err) => console.log('app.js error', err));

    crearMensajeHTML(mensaje, usuario);
});

// Get server messages
function getMensajes() {
    fetch('api')
        .then((resp) => resp.json())
        .then((posts) => {
            posts.forEach((post) => {
                crearMensajeHTML(post.mensaje, post.user);
            });
        });
}
getMensajes();

// Detectar cambios de conexion
function isOnline() {
    if (window.navigator.onLine) {
        // Estamos online
        $.mdtoast('Online', {
            interaction: true,
            interactionTimeout: 2000,
            actionText: 'Ok',
        });
    } else {
        // Estamos offline
        $.mdtoast('Offline', {
            interaction: true,
            actionText: 'Ok',
            type: 'warning',
        });
    }
}

window.addEventListener('online', isOnline);
window.addEventListener('offline', isOnline);
isOnline();

// Notificaciones
function verificaSuscripcion(activadas) {
    if (activadas) {
        btnActivadas.removeClass('oculto');
        btnDesactivadas.addClass('oculto');
    } else {
        btnActivadas.addClass('oculto');
        btnDesactivadas.removeClass('oculto');
    }
}

verificaSuscripcion();

function enviarNotification() {
    const notificationOpts = {
        icon: 'img/icons/icon-72x72.png',
        body: 'This is the body of the notification.',
    };
    const n = new Notification('Hello World!', notificationOpts);
    n.onclick = () => {
        console.log('Notification clicked');
    };
}

function notificarme() {
    if (!window.Notification) {
        return;
    }

    if (Notification.permission === 'granted') {
        enviarNotification();
    } else if (
        Notification.permission !== 'denied' ||
        Notification.permission === 'default'
    ) {
        Notification.requestPermission(function (permission) {
            if (permission === 'granted') {
                enviarNotification();
            }
        });
    }
}
// notificarme();

// Get Key
function getPublicKey() {
    return fetch('api/key')
        .then((res) => res.arrayBuffer())
        .then((key) => new Uint8Array(key));
}
getPublicKey().then((key) => console.log(key));
