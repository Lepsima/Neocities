const isMatchMakerLoaded = true;
let playerJoinedA = document.getElementById("join-player-a");
let playerJoinedB = document.getElementById("join-player-b");
let countdownBtn = document.getElementById("cd_start");

let aEmpty;
let bEmpty;

let countdown = 0;
let countdownValue = -1;
let countdownTimeout = null;
mmOnOpen();

function mmOnOpen() {
    if (isWebSocketOpen) {
        websocket.send("PLAYER:GETSTATES");
    } else {
        setTimeout(mmOnOpen, 100);
    }
}

function mmJoinA() {
    websocket.send("PLAYER:LINK_UNIT_A");
}

function mmJoinB() {
    websocket.send("PLAYER:LINK_UNIT_B");
}

function mmQuit() {
    websocket.send("PLAYER:QUIT");
}

function mmUpdateA(state) {
    aEmpty = state;
    playerJoinedA.innerHTML = "Jugador: " + (state ? "Vacio" : "Ocupado");
    mmUpdateShowCountDown();
}

function mmUpdateB(state) {
    bEmpty = state;
    playerJoinedB.innerHTML = "Jugador: " + (state ? "Vacio" : "Ocupado");
    mmUpdateShowCountDown();
}

function mmUpdateShowCountDown() {
    let show = !bEmpty || !aEmpty;

    if (show) {
        countdownBtn.classList.remove("cd-off");
    } else {
        countdownBtn.classList.add("cd-off");
    }
}

function mmStartCountDown() {
    if (countdown == 0) {
        websocket.send("COUNTDOWN:START");
    } else {
        websocket.send("COUNTDOWN:CANCEL");
    }
}

function mmOnCountDownStart() {
    countdown = 1;
    if (countdownValue == -1) countdownValue = 5;
    else countdownValue--;

    countdownBtn.value = "CANCELAR - INICIO EN " + countdownValue + "s";
    countdownTimeout = setTimeout(mmOnCountDownStart, 1000);
}

function mmOnCountDownCancel() {
    countdownBtn.value = "EMPEZAR";
    countdown = 0;
    countdownValue = -1;

    if (countdownTimeout != null) {
        clearTimeout(countdownTimeout);
    }
}

function mmOnCountDownEnd() {
    countdown = 2;
    countdownValue = 0;
    countdownBtn.value = "CANCELAR - INICIO EN 0s";
    window.location.replace("player.html");
    if (countdownTimeout != null) {
        clearTimeout(countdownTimeout);
    }
}