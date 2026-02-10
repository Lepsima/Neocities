const isTerminalLoaded = true;
let lines = "";

const helpText = `
help: muestra todos los comandos.
clear: borra la pantalla.

admin [contraseña]: inicia sesión como administrador.
admin logout: cierra la sesión de administrador.

send [mensaje]: envia un mensaje(sin espacios) al servidor.

*Las mayusculas no importan
`;

const espC3 = `
┌╔══════════╗┐      ┌╔══════════╗┐
╔╝          ╚╗      ╔╝          ╚╗
║* UNIDAD A *║      ║* UNIDAD B *║
║*          *║      ║*          *║
║*-INACTIVO-*║      ║*-INACTIVO-*║
║* -ACTIVO- *║      ║* -ACTIVO- *║
║* [######] *║      ║* [######] *║
║*   ____   *║      ║*   ____   *║
║*  /    \\  *║      ║*  /    \\  *║
╚╗  │____│  ╔╝      ╚╗  │____│  ╔╝
└╚══[____]══╝┘      └╚══[____]══╝┘
`;

// Nueva linea
function addLine(line) {
    lines += "<pre>" + line + "</pre>";
}

// Añade un espacio al texto
function addSpacing() {
    lines += "<br>";
}

function testLink() {
    window.location.replace("player.html");
}

// Actualiza el texto que se muestra en pantalla
function updateLines() {
    let displayElement = document.getElementById("terminal-display");
    displayElement.innerHTML = lines;
}

function onTerminalSubmit() {
    // Obten el comando introducido
    let inputElement = document.getElementById("terminal-input");

    // guarda el valor y elimina el texto del formulario
    let text = inputElement.value;
    inputElement.value = "";
    if (!text) return;

    // Muestra el comando ejecutado
    let prefix = isAdmin ? "admin> " : "#> ";
    addLine(prefix + text);

    // Separa el comando y el valor
    const params = text.split(" ");
    let exitCode = 1;
    let command = params[0];
    let value = (params.length > 1) ? params[1] : "";

    // Ejecuta el comando
    exitCode = handleTerminalInput(command, value);

    // Muestra el error correspondiente
    switch (exitCode) {
        case 1:
        addLine("Comando invalido. Escribe 'help' para ver la lista de comandos");
        addSpacing();
        break;
          
        case 2:
        addLine("Fallo al ejectuar el commando. Para mas informacion mira los logs de la consola.");
        addSpacing();
        break;

        case 3:   
        addLine("La conexion websocket no esta abierta, confirma tu conexion y recarga la pagina.");
        addSpacing();
        break;
    }

    // Refresca la pantalla
    updateLines();
}

// succes: 0, invalid: 1, fail: 2, websocket closed: 3
function handleTerminalInput(command, value) {
    if (!isWebSocketOpen) return 3;

    let commandl = command.toLowerCase();
    let valuel = value.toLowerCase();

    switch (commandl) {
        case "help":
            addLine(helpText);
            addSpacing();
        break;

        case "clear":
            lines = "";
        break;

        case "admin":
            if (valuel == "logout") {
                logoutAdmin();
                addLine("Cerrando sesión.\n Esperando confirmacion del servidor...");
            } else {
                loginAdmin(value);
                addLine("Esperando confirmacion del servidor...");        
            }
        break;

        case "send":
            websocket.send(value);
            addSpacing();
        break;

        case "info":
            addLine(espC3);
            addSpacing();
        break;

        case "getclients":
            websocket.send("GETCLIENTS");
            addLine("Pidiendo lista de clientes conectados...");
        break;

        case "getteam":
            websocket.send("PLAYER:WHOAMI");
            addLine("Preguntando al servidor en que equipo te encuentras...");
        break;

        case "jointeam":
            if (value == "TEAM_A") {
                websocket.send("PLAYER:LINK_UNIT_A");
                addLine("Uniendose al Equipo A, esperando confirmacion...");

            } else if (value == "TEAM_B") {
                websocket.send("PLAYER:LINK_UNIT_B");
                addLine("Uniendose al Equipo B, esperando confirmacion...");

            } else {
                addLine("Equipo invalido, por favor, usa TEAM_A o TEAM_B");
                return 2;
            }
        break;

        case "quitteam":
            websocket.send("PLAYER:QUIT");
            addLine("Abandonando el equipo...");
        break;

        default: return 1;
    }

    return 0;
}