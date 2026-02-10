let isPrecisionModeEnabled;
let isMouseModeEnabled;
let isAimModeEnabled;

const State = Object.freeze({
    OFF: -1,
    PAIRING: 0,
    IDLING: 1,
    MOVING: 2,
    SCANNING: 3,
    SHOOTING: 4
});

let hitCount = 0;

let button_precision = document.getElementById("precisionToggle");
let button_mouse = document.getElementById("mouseToggle");
let button_aim = document.getElementById("aimToggle");
let button_scanFast = document.getElementById("scanFast");
let button_scanMedm = document.getElementById("scanMedm");
let button_scanSlow = document.getElementById("scanSlow");
let button_scanFrontFast = document.getElementById("scanFrontFast");
let button_scanFrontSlow = document.getElementById("scanFrontSlow");

let time = 300;
let defTime = 150;
let isAlertMode = false;
let isDefendMode = false;
let isAttacking = false;

let confirmAlarms = document.getElementsByClassName("confirm-alert");
let defendAlarms = document.getElementsByClassName("defend-alert");

let abortElement = document.getElementById("abort");
let textElement = document.getElementById("text-box");
let textToType = [];
let textIndex;
let isTyping;

let scanLengthArr = [ 5, 8, 12, 3, 6 ];
let scanLinesArr = [ 256, 320, 384, 112, 192 ];
let scanPrecArr = [ 1, 2, 3, 1, 2 ];
let scanIsFrontArr = [ false, false, false, true, true ];
let botState = State.IDLING;

let selectedScan = -1;
let timeoutActionTimer = null;

typeReset();

function timeoutAction() {
    timeoutActionTimer = null;
    selectedScan = -1;
    setBotState(State.IDLING);
}

function setBotState(state) {
    botState = Math.min(Math.max(state, -1), 4);
    let canCancel = botState == State.SCANNING || botState == State.MOVING;

    if (canCancel) abortElement.classList.remove("abort-off");
    else abortElement.classList.add("abort-off");
}

function scanPlaceholder() {
    typeReset();
    typePhrase("BEGIN SCAN");
}

function typeClearDisplay() {
    textElement.innerHTML = "";
}

function typeClearQueue() {
    textToType = [];
}

function typeReset() {
    typeClearQueue();
    typeClearDisplay();
}

function typePhrase(phrase) {
    if (textToType == null) textToType = [];
    let isEmpty = textToType.length == 0;
    textToType.push(phrase);

    if (isEmpty) {
        textIndex = 0;
        typeText();
    }
}

function typeText() {
    if (textToType == null || textToType.length == 0) {
        isTyping = false;
        textIndex = 0;
        return;
    }

    let phrase = textToType[0];

    if (textIndex >= phrase.length) {
        textToType.shift();
        textIndex = 0;
        textElement.innerHTML += "<br>";
        setTimeout(typeText, 500);
        return;
    }

    textElement.innerHTML += phrase.charAt(textIndex);
    textIndex++;

    isTyping = true;
    setTimeout(typeText, 50 * (0.5 - Math.random()) + 25);
}

function setAlertMode(mode) {
    let act = !isAlertMode && mode;
    isAlertMode = mode;
    if (act) on_alarms();
}

function toggleConfirmAlarms(toggle) {
    for (let i = 0; i < confirmAlarms.length; i++) {
        let elem = confirmAlarms[i];
        elem.style.display = toggle ? "inline-block" : "none";
    }
}

function on_alarms() {
    for (let i = 0; i < confirmAlarms.length; i++) {
        let elem = confirmAlarms[i];
        elem.classList.remove("alert-off");
        elem.classList.add("alert-on");
    }

    setTimeout(off_alarms, time);
}

function off_alarms() {
    for (let i = 0; i < confirmAlarms.length; i++) {
        let elem = confirmAlarms[i];
        elem.classList.remove("alert-on");
        elem.classList.add("alert-off");
    }

    if (isDefendMode) setTimeout(on_alarms, time);
}

function setDefendMode(mode) {
    let act = !isDefendMode && mode;
    isDefendMode = mode;
    if (act) on_defAlarms();
}

function toggleDefendAlarms(toggle) {
    for (let i = 0; i < defendAlarms.length; i++) {
        let elem = defendAlarms[i];
        elem.style.display = toggle ? "inline-block" : "none";
    }
}

function on_defAlarms() {
    for (let i = 0; i < defendAlarms.length; i++) {
        let elem = defendAlarms[i];
        elem.classList.remove("alert-off");
        elem.classList.add("alert-on");
    }

    setTimeout(off_defAlarms, defTime);
}

function off_defAlarms() {
    for (let i = 0; i < defendAlarms.length; i++) {
        let elem = defendAlarms[i];
        elem.classList.remove("alert-on");
        elem.classList.add("alert-off");
    }

    if (isDefendMode) setTimeout(on_defAlarms, defTime);
}

function togglePrecisionMode() {
    button_precision.blur();

    if (anim_anglesStart != 0) return false;
    isPrecisionModeEnabled = !isPrecisionModeEnabled;

    if (isPrecisionModeEnabled) animateAnglesShow();
    else animateAnglesHide();

    return true;
}

function toggleMouseMode() {
    button_mouse.blur();
    if (isAimModeEnabled) return false;

    setMouseMode(!isMouseModeEnabled);
    return true;
}

function setMouseMode(mode) {
    if (isMouseModeEnabled == mode) return;

    isMouseModeEnabled = mode;
    setAlertMode(isMouseModeEnabled);
    toggleConfirmAlarms(isMouseModeEnabled);
}

function toggleAimMode() {
    button_aim.blur();
    if (isMouseModeEnabled) return false;

    setAimMode(!isAimModeEnabled);
    return true;
}

function setAimMode(mode) {
    if (isAimModeEnabled == mode) return;

    isAimModeEnabled = mode;
    setAlertMode(isAimModeEnabled);
    toggleConfirmAlarms(isAimModeEnabled);
} 

function unToggleButtons() {
    button_precision.classList.remove("active");
    button_mouse.classList.remove("active");
    button_aim.classList.remove("active");
    button_scanFast.classList.remove("active");
    button_scanMedm.classList.remove("active");
    button_scanSlow.classList.remove("active");
    button_scanFrontFast.classList.remove("active");
    button_scanFrontSlow.classList.remove("active");
}

document.addEventListener("keypress", function(event) {
    if (event.key == '0') {
        togglePrecisionMode();
        button_precision.classList.add("active");

    } else if (event.key == '8') {
        toggleMouseMode();
        button_mouse.classList.add("active");

    } else if (event.key == '9') {
        toggleAimMode();
        button_aim.classList.add("active");

    } else if (event.key == " ") {
        if (isMouseModeEnabled) moveBegin();
        else if (isAimModeEnabled) shootBegin();

    } else if (timeoutActionTimer == null && botState != State.SCANNING) {
        if (event.key == '1') {
            scanAsk(0);
            button_scanFast.classList.add("active");

        } else if (event.key == '2') {
            scanAsk(1);
            button_scanMedm.classList.add("active");

        } else if (event.key == '3') {
            scanAsk(2);
            button_scanSlow.classList.add("active");

        } else if (event.key == '4') {
            scanAsk(3);
            button_scanFrontFast.classList.add("active");

        } else if (event.key == '5') {
            scanAsk(4);
            button_scanFrontSlow.classList.add("active");

        } 
    } else {
        return;
    }

    setTimeout(unToggleButtons, 75);
});

function abortButton() {
    if (botState == State.SCANNING || botState == State.MOVING) {
        typeReset();
        typePhrase("CANCELANDO ACCION...");
        setBotState(State.IDLING);
        websocket.send("CANCEL");
    }
}

function scanAsk(type) {
    if (botState != State.IDLING || timeoutActionTimer != null) return;
    timeoutActionTimer = setTimeout(timeoutAction, 5000);

    selectedScan = type;

    let hexCode = ('0000' + type.toString(16).toUpperCase()).slice(-4);
    websocket.send("SCAN:" + hexCode);
 
    typeReset();
    typePhrase("INICIANDO ESCANEO");
    typePhrase("PROPIEDADES");

    let scanLength = scanLengthArr[type];
    let scanLines = scanLinesArr[type];
    let scanPrec = scanPrecArr[type];
    let scanIsFront = scanIsFrontArr[type];

    typePhrase("Duracion: " + scanLength + "s");
    typePhrase("Resolucion: " + scanLines);
    typePhrase("Precision: " + (scanPrec == 1 ? "Baja" : (scanPrec == 2 ? "Media" : "Alta")));
    typePhrase("Alcance: " + (scanIsFront ? "Frontal" : "Completo"));
}

function scanBegin() {
    if (timeoutActionTimer != null) {
        clearTimeout(timeoutActionTimer);
        timeoutActionTimer = null;
    }

    beginScan(scanLinesArr[selectedScan]);
    setBotState(State.SCANNING);
}

function scanComplete() {
    completeScan();
    setBotState(State.IDLING);
    typeReset();
    typePhrase("[OK]");
    typePhrase("Escaneo completado");
    typePhrase("Esperando ordenes");
}

function moveBegin() {
    if (botState != State.IDLING || timeoutActionTimer != null) return;
    timeoutActionTimer = setTimeout(timeoutAction, 5000);

    typeReset();
    let [angle, dist] = getAimingValues();

    angle = Math.round(angle * 10) / 10;
    dist = Math.round(dist * 10);

    if (angle < 0) angle += 360;
    angle = (angle + 90) % 360;

    angle = -angle;
    if (angle < 0) angle += 360;

    angle = Math.round(angle);
    dist = Math.round(dist);
    let hexCodeA = ('00000000' + angle.toString(16).toUpperCase()).slice(-8);
    let hexCodeB = ('00000000' + dist.toString(16).toUpperCase()).slice(-8);

    setMouseMode(false);
    typePhrase("INICIANDO MOVIMIENTO");
    typePhrase("Angulo: " + angle + "g");
    typePhrase("Distancia: " + dist + "cm");
    websocket.send("MOVE:" + hexCodeA + hexCodeB);
} 

function moveConfirm() {
    if (timeoutActionTimer != null) {
        clearTimeout(timeoutActionTimer);
        timeoutActionTimer = null;
    }

    clearScan();
    setBotState(State.MOVING);
    typePhrase("[OK]");
}

function moveComplete() {
    if (timeoutActionTimer != null) {
        clearTimeout(timeoutActionTimer);
        timeoutActionTimer = null;
    }

    setBotState(State.IDLING);
    typePhrase("MOVIMIENTO COMPLETADO");
}

function shootBegin() {
    if (botState != State.IDLING || timeoutActionTimer != null) return;
    timeoutActionTimer = setTimeout(timeoutAction, 5000);

    typeReset();
    let [angle, dist] = getAimingValues();

    angle = Math.round(angle * 10) / 10;
    dist = Math.round(dist * 10) / 10;
   
    if (angle < 0) angle += 360;
    angle = (angle + 90) % 360;

    angle = -angle;
    if (angle < 0) angle += 360;

    typePhrase("INICIANDO APUNTADO");
    typePhrase("Angulo: " + (Math.round(angle * 10) / 10) + "g");
    let steps = Math.round((angle / 360 * 4096 + 4096) / 2) * 2;
    let hexCode = ('00000000' + steps.toString(16).toUpperCase()).slice(-8);

    console.log(steps);
    websocket.send("SHOOT:" + hexCode);
}

function shootConfirm() {
    if (timeoutActionTimer != null) {
        clearTimeout(timeoutActionTimer);
        timeoutActionTimer = null;
    }

    setBotState(State.SHOOTING);
    setAimMode(false);

    typePhrase("[OK]");
    typePhrase("");
    
    typePhrase("COMPLETANDO ROTACION");
    typePhrase(". . .");
    typePhrase("[OK]");
    typePhrase("");

    typePhrase("ANALIZANDO RESULTADOS");
    typePhrase(". . .");
}

function shootComplete() {
    if (timeoutActionTimer != null) {
        clearTimeout(timeoutActionTimer);
        timeoutActionTimer = null;
    }

    setBotState(State.IDLING);
}