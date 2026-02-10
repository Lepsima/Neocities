const isWebSocketLoaded = true;
let isWebSocketOpen = false;
let isAdmin = false;

const gateway ="ws://" + window.location.host + "/ws";
let websocket;

let clientIP;
let clientID;

window.addEventListener('load', onLoad);

// Inicia el websocket
function initWebSocket() {
    websocket = new WebSocket(gateway);
    websocket.onopen    = onOpen;
    websocket.onclose   = onClose;
    websocket.onmessage = onMessage;
}

// Al cargar la pagina
function onLoad(event) {
    initWebSocket();
}

// Al abrir el websocket
function onOpen(event) {
    console.log("Connection opened");
    websocket.send("URL:" + window.location.href);
    isWebSocketOpen = true;
}

// Al cerrar el websocket
function onClose(event) {
    console.log("Connection closed");
    setTimeout(initWebSocket, 2000);
    isWebSocketOpen = false;
}

// Envia la contraseña de administrador para iniciar sesion
function loginAdmin(password) {
    websocket.send("ADMIN:" + password);
}

// Cierra la sesion de administrador
function logoutAdmin() {
    websocket.send("ADMIN:LOGOUT");
}

function wsAddLine(value) {
    if (typeof isTerminalLoaded != 'undefined') {
        addLine(value);
    }
}

function wsUpdateLines()  {
    if (typeof isTerminalLoaded != 'undefined') {
        updateLines();
    }
}

function onMessage(event) {
    const params = event.data.split(":");

    let command = params[0];
    let value = "";

    if (params.length > 1) {
        value = params[1];
    }

    switch (command) {
    // Comandos relacionados con la sesion de administrador
    case "ADMIN":{
        switch (value) {
            case "OK":
            wsAddLine("Sesión iniciada como administrador.\n La sesión se cerrara automaticamente en 15min.");
            isAdmin = true;
            break;

            case "FAIL":
            wsAddLine("Contraseña de administrador incorrecta");
            break;

            case "LOGOUT":
            wsAddLine("Tu sesión de administrador se ha cerrado.");
            isAdmin = false;
            break;

            case "EXPIRED":
            wsAddLine("Tu sesión de administrador ha expirado.\n Escribe 'ADMIN [contraseña]' para volver a iniciar sesión.");
            isAdmin = false;
            break;

            default: return;
        }

        wsUpdateLines();
        break;
    }

    // Comandos relacionados con los equipos (Player A/B)
    case "PLAYER":{
    switch (value) {
        case "NOT_EMPTY":
        wsAddLine("El equipo al que intentas entrar ya esta ocupado.");
        break;   

        case "NO_QUIT":
        wsAddLine("No se ha podido salir del equipo actual. No estas en ningun equipo.");
        break;

        case "QUIT":
        wsAddLine("Has abandonado el equipo, ya no perteneces a ningun equipo.");
        break;

        case "ALREADY_LINKED":
        wsAddLine("Ya estas en un equipo, si quieres cambiar primero usa el comando: [quitTeam].");
        break;

        case "LINK_UNIT_A":
        wsAddLine("Te has unido al Equipo A correctamente.");
        break;

        case "LINK_UNIT_B":
        wsAddLine("Te has unido al Equipo B correctamente.");
        break;

        default: return;
    }
    
    wsUpdateLines();
    break;
    }

    case "STATUS_UNIT_A":{
    switch (value) {
        case "NOT_EMPTY":
        mmUpdateA(false);
        break;   

        case "EMPTY":
        mmUpdateA(true);
        break;

        default: return;
    }
    break;
    }

    case "STATUS_UNIT_B":{
    switch (value) {
        case "NOT_EMPTY":
        mmUpdateB(false);
        break;   

        case "EMPTY":
        mmUpdateB(true);
        break;

        default: return;
    }
    break;
    }

    case "STATUS_UNITS":{
    mmUpdateA(value.charAt(0) == "T");
    mmUpdateB(value.charAt(1) == "T");
    }

    case "MOVE": {
    if (typeof isUIdisplayLoaded != 'undefined') {
        switch (value) {
        case "ERROR":
            typeReset();
            typePhrase("[ERROR]");
            typePhrase("No se pudo iniciar el movimiento");
        break;

        case "ACK":
            typeReset();
            typePhrase("[OK]");
            typePhrase("Movimiento cancelado correctamente");
            typePhrase("Listo para escanear");
        break;

        case "NOACK":
            typeReset();
            typePhrase("[ERROR]");
            typePhrase("No se pudo cancelar el movimiento");
        break;

        case "COMPLETE":
            typeReset();
            typePhrase("[OK]");
            typePhrase("Movimiento completado");
            typePhrase("Listo para escanear");
        break;

        case "BEGIN":
            typeReset();
            typePhrase("[OK]");
            typePhrase("Iniciando movimiento");
        break;
        }
    }
    break;
    }

    case "SCAN": {
    if (typeof isUIdisplayLoaded != 'undefined') {
        switch (value) {
        case "ERROR":
            typeReset();
            typePhrase("[ERROR]");
            typePhrase("No se pudo iniciar el escaneo");
        break;

        case "ACK":
            typeReset();
            typePhrase("[OK]");
            typePhrase("Escaneo cancelado correctamente");
            typePhrase("Esperando ordenes");
        break;

        case "NOACK":
            typeReset();
            typePhrase("[ERROR]");
            typePhrase("No se pudo cancelar el escaneo");
        break;

        case "COMPLETE":
            scanComplete();
        break;

        case "BEGIN":
            scanBegin();
        break;

        default: {
            let range = parseInt(value.substring(0, 8), 16);
            let step = parseInt(value.substring(8), 16);
            receiveScan(step - 1, range);
            break;
        }
        }
    }
    break;
    }

    case "SHOOT": {
    if (typeof isUIdisplayLoaded != 'undefined') {
        switch (value) {
        case "HIT":  
            typeReset();
            typeClearQueue();
            typePhrase("");

            setDefendMode(false);
            toggleDefendAlarms(false);

            if (isAttacking) {
                hitCount++;

                typePhrase("[OK]");
                typePhrase("Impacto detectado.");
                typePhrase("Impactos totales: " + Math.round(hitCount));
                typePhrase("Abandona el campo de vision del rival lo antes posible para evitar un contra-ataque.");
            } else {
                typePhrase("[ALERTA]");
                typePhrase("Impacto recibido.");
                typePhrase("Origen: desconocido");
            }
            shootComplete();
        break;

        case "MISS":
            shootComplete();
            typeReset();
            typeClearQueue();
            typePhrase("");

            setDefendMode(false);
            toggleDefendAlarms(false);

            if (isAttacking) {    
                typePhrase("[ERROR]");
                typePhrase("No se ha detectado el rival en la zona objetivo.");
                typePhrase("El rival detectado el ataque.");
            } else {
                typePhrase("[OK]");
                typePhrase("Analisis finalizado");
                typePhrase("Impacto: No");
                typePhrase("Origen: corta distancia");
                typePhrase("");
                typePhrase("Contra-ataque recomendado, localiza al rival");
            }

            shootComplete();
        break;

        case "ATTACK":
            shootConfirm();
            setDefendMode(true);
            toggleDefendAlarms(true);
            isAttacking = true;

            typeReset();
            typePhrase("[OK]");
            typePhrase("Iniciando ataque.");
            typePhrase("");
            typePhrase("Analizando objetivo...");
        break;

        case "DEFEND":
            shootConfirm();
            setDefendMode(true);
            toggleDefendAlarms(true);
            isAttacking = false;

            typeReset();
            typePhrase("[ALERTA]");
            typePhrase("Ataque detectado");
            typePhrase("Es posible que tu ubicacion haya sido comprometida.");
            typePhrase("Analizando daños...");
        break;

        case "END":
            setDefendMode(false);
            toggleDefendAlarms(false);
        break;
        }
    }
    break;
    }

    case "GAMESTATE": {
        let state = parseInt(value, 16);
        if (state == 2) {
            if (typeof isMatchMakerLoaded != 'undefined') {
                mmOnCountDownEnd();
            }
        }
        break;
    }

    case "COUNTDOWN": {
        if (typeof isMatchMakerLoaded != 'undefined') {
            if (value == "START") mmOnCountDownStart();
            else if (value == "CANCEL") mmOnCountDownCancel();
        }
       
        break;
    }

    // Muestra en que equipo esta registrado el jugador
    case "WHOAMI": {
        if (value == "UNKNOWN") wsAddLine("No estas registrado en ningun equipo.");
        else wsAddLine("Estas registrado como -> " + value);
        wsUpdateLines();
        break;
    }

    // Muestra la IP recibida del cliente
    case "GETCLIENT": {
        wsAddLine("Cliente encontrado -> " + value);
        wsUpdateLines();
        break;
    }

    // El servidor le envia la ID de websocket al cliente
    case "ID": {
        clientID = value;
        break;
    }

    // El servidor le envia la IP al cliente
    case "IP": {
        clientIP = value;
        break;
    }

    // En caso de pedirlo, el cliente le envia la URL actual al servidor
    case "URL":{
        websocket.send("URL:" + window.location.pathname);
        break;
    }

    // Permite al servidor enviar mensajes a la terminal
    case "DISPLAY":{
        wsAddLine(value);
        wsUpdateLines();
        break;
    }
    }
}