let isUIdisplayLoaded = true;

//let radarData = [136, 138, 136, 137, 139, 138, 138, 139, 140, 146, 152, 154, 162, 156, 157, 155, 157, 158, 160, 163, 169, 169, 163, 158, 156, 153, 152, 150, 152, 159, 180, 206, 223, 238, 252, 255, 259, 265, 270, 265, 265, 263, 257, 246, 238, 228, 220, 209, 205, 195, 186, 186, 178, 177, 177, 184, 184, 187, 187, 183, 166, 151, 135, 124, 118, 113, 103, 94, 92, 85, 82, 79, 78, 78, 78, 80, 84, 84, 81, 83, 84, 85, 84, 84, 83, 85, 87, 89, 89, 89, 90, 90, 88, 91, 92, 95, 97, 95, 95, 92, 95, 100, 103, 104, 116, 124, 141, 161, 179, 187, 192, 196, 197, 194, 187, 189, 183, 186, 180, 169, 166, 193, 223, 223, 237, 241, 241, 247, 244, 264, 267, 286, 300, 305, 291, 270, 228, 216, 198, 186, 183, 184, 186, 179, 167, 162, 165, 159, 152, 159, 171, 173, 182, 182, 222, 247, 264, 308, 306, 320, 345, 330, 311, 281, 258, 241, 228, 212, 207, 198, 199, 200, 202, 198, 203, 208, 220, 235, 251, 259, 262, 252, 224, 219, 226, 241, 275, 295, 316, 342, 352, 357];
//let data = [136, 138, 136, 137, 139, 138, 138, 139, 140, 146, 152, 154, 162, 156, 157, 155, 157, 158, 160, 163, 169, 169, 163, 158, 156, 153, 152, 150, 152, 159, 180, 206, 223, 238, 252, 255, 259, 265, 270, 265, 265, 263, 257, 246, 238, 228, 220, 209, 205, 195, 186, 186, 178, 177, 177, 184, 184, 187, 187, 183, 166, 151, 135, 124, 118, 113, 103, 94, 92, 85, 82, 79, 78, 78, 78, 80, 84, 84, 81, 83, 84, 85, 84, 84, 83, 85, 87, 89, 89, 89, 90, 90, 88, 91, 92, 95, 97, 95, 95, 92, 95, 100, 103, 104, 116, 124, 141, 161, 179, 187, 192, 196, 197, 194, 187, 189, 183, 186, 180, 169, 166, 193, 223, 223, 237, 241, 241, 247, 244, 264, 267, 286, 300, 305, 291, 270, 228, 216, 198, 186, 183, 184, 186, 179, 167, 162, 165, 159, 152, 159, 171, 173, 182, 182, 222, 247, 264, 308, 306, 320, 345, 330, 311, 281, 258, 241, 228, 212, 207, 198, 199, 200, 202, 198, 203, 208, 220, 235, 251, 259, 262, 252, 224, 219, 226, 241, 275, 295, 316, 342, 352, 357];
let dataBuffer = new Array();
let data = new Array();
let blue = "#0b052d";
let red = "#eb042b";

const canvas1 = document.getElementById("layer1");
const ctx1 = canvas1.getContext("2d");

const canvas2 = document.getElementById("layer2");
const ctx2 = canvas2.getContext("2d");

const canvas3 = document.getElementById("layer3");
const ctx3 = canvas3.getContext("2d");  

const canvas4 = document.getElementById("layer4");
const ctx4 = canvas4.getContext("2d");  

let dataMax = -1;
let pixelPerCM;
let radarSize;
let radarSizeFull;

let dotMaxSize = 5;
let dotDepth = 7;

let width;
let height;

let anim_anglesProgress = 1;
let anim_anglesStart = 0;

const circleCache = [];
let canDrawMouse;

let mouseX;
let mouseY;

let infoLayerTick = 0;
let updtLayerTick = 0;

let isComplete = false;

setup();

document.documentElement.addEventListener('mousemove', function(evt) { 
    var rect = canvas1.getBoundingClientRect();
    mouseX = evt.clientX - rect.left;
    mouseY = evt.clientY - rect.top;
}, false);

function setup() {
    document.documentElement.style.background = blue;
    canvas1.width = canvas2.width = canvas3.width = canvas4.width = width = Math.min(window.innerWidth, 1220);
    canvas1.height = canvas2.height = canvas3.height = canvas4.height = height = Math.min(window.innerHeight, 962);

    radarSizeFull = Math.min(width, height);
    radarSize = radarSizeFull * 0.975;

    drawStaticLayer();
    drawInfoLayer(1);
    drawUpdateLayer();
    
    for (let i = 1; i < dotDepth; i++) {
        let radius = dotMaxSize * (i / dotDepth);
        let color = addAlpha(red, (i / dotDepth));
        circleCache.push(preRenderCircle(radius, color));
    }
}

function getAimingValues() {
    let a = mouseX - width / 2;
    let b = mouseY - height / 2;

    let angle = Math.atan2(b, a);
    angle = angle / Math.PI * 180;

    let dist = Math.sqrt(a * a + b * b) / pixelPerCM;

    return [angle, dist];
}

function preRenderCircle(radius, color) {
    const size = radius * 2;
    const offscreen = document.createElement('canvas');
    offscreen.width = size;
    offscreen.height = size;
    const ctx = offscreen.getContext('2d');

    ctx.fillStyle = color;
    ctx.arc(radius, radius, radius, 0, Math.PI * 2);
    ctx.fill();

    return offscreen;
}

function drawPreRenderedCircle(ctx, x, y, radius, i) {
    const image = circleCache[i];
    ctx.drawImage(image, x - radius, y - radius);
}

function beginScan(size) {
    ctx3.clearRect(0, 0, width, height);
    drawStaticLayer();
    isComplete = false;

    data = new Array(size);
    dataMax = -1;
    for (let i = 0; i < size; i++) data[i] = 1;
    console.log("SIZE: " + data.length);

    if (dataBuffer.length > 0) {
        dataBuffer.forEach(pair => {
            receiveScan(pair[0], pair[1]);
        });
        dataBuffer = new Array();   
    }
}

function clearScan() {
    isComplete = false;
    ctx3.clearRect(0, 0, width, height);
    for (let i = 0; i < data.length; i++) data[i] = 0;
}

function completeScan() {
    isComplete = true;
}

function receiveScan(index, range) {
    if (isComplete || data == null) {
        let pair = [index, range];
        dataBuffer.push(pair);
        return;
    }

    range = Math.min(range, 1200);
    data[index] = range;

    if (range > dataMax) {
        dataMax = range;
        pixelPerCM = radarSize / (dataMax / 10) / 2;
        drawDataLayer(-1);
        drawInfoLayer(-1);
    } else {
        drawDataLayer(index);
    }  
}

function endScan() {
    animateAnglesHide();
}

function animateAnglesShow() {     
    const d = new Date();
    const millis = d.getTime();
    const time = 3000;

    if (anim_anglesStart == 0) anim_anglesStart = millis;
    let progress = (millis - anim_anglesStart) / time;

    if (progress > 1) progress = 1;
    drawInfoLayer(1 - smooth(progress));

    if (progress < 1) setTimeout(animateAnglesShow, 50);
    else anim_anglesStart = 0;
}

function animateAnglesHide() {
    canDrawMouse = false;
    const d = new Date();
    const millis = d.getTime();
    const time = 3000;

    if (anim_anglesStart == 0) anim_anglesStart = millis;
    let progress = (millis - anim_anglesStart) / time;

    if (progress > 1) progress = 1;
    drawInfoLayer(smooth(progress));

    if (progress < 1) setTimeout(animateAnglesHide, 50);
    else anim_anglesStart = 0;
}

function drawStaticLayer() {
    let canvas = canvas4;
    let ctx = ctx4;
    ctx.clearRect(0, 0, width, height);
    squarePattern(8, ctx);

    // Draw gradient circles
    gradCircl(8, 92, 1, 4, ctx);

    // Draw outline circle
    ctx.beginPath();
    ctx.fillStyle = addAlpha(red, 0.1);
    ctx.arc(width / 2, height / 2, radarSizeFull / 2, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function drawDataLayer(drawDots) {
    let canvas = canvas3;
    let ctx = ctx3;
    if (drawDots == -1) ctx.clearRect(0, 0, width, height);

    let xArr = [];
    let yArr = [];
    let j =0 ;
    // Draw outwards dots
    for (let i = 0; i < data.length; i++) {
        if (data[i] == 0) break;

        if ((drawDots == i || drawDots == -1) && data[i] != 1) rdrDot(indexToRadians(i), data[i] / 10, dotDepth, ctx);
        const [x, y] = getDot(indexToRadians(i), data[i] / 10);

        xArr.push(x);
        yArr.push(y);
    }

    ctx.beginPath();
    let isComplete = xArr.length == data.length;
    if (!isComplete) ctx.moveTo(width / 2, height / 2);

    for (let i = 0; i < xArr.length; i++) {
        let x = xArr[i], y = yArr[i];
        if (i == 0 && isComplete) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);

        if (i == (data.length - 1) && isComplete) ctx.lineTo(xArr[0], yArr[0]);
    }

    ctx.fillStyle = blue;
    ctx.lineWidth = dotMaxSize + 1;
    ctx.strokeStyle = red;
    ctx.stroke();
    ctx.fill();
    ctx.closePath();
}

function drawInfoLayer(p) {
    let canvas = canvas2;
    let ctx = ctx2;

    if (p == -1) p = anim_anglesProgress; 
    else anim_anglesProgress = p;

    ctx.clearRect(0, 0, width, height);
    distanceLines(ctx, 1 - p);
    displayAngles(ctx, p);
    displayHelperTicks(ctx, p);
}

function drawUpdateLayer() {
    let canvas = canvas1;
    let ctx = ctx1;
    ctx.clearRect(0, 0, width, height);
    let rangeMaxShoot = 35;

    let dm = dataMax / 10;
    if (isAimModeEnabled && dm > 20) {

        // Draw outline circle
        ctx.beginPath();
        ctx.lineWidth = 2;
        ctx.strokeStyle = "white";
        ctx.arc(width / 2, height / 2, pixelPerCM * rangeMaxShoot, 0, 2 * Math.PI);
        ctx.stroke();
        ctx.closePath();

        ctx.font = "24px VCR";
        ctx.fillStyle = addAlpha("#ffffff", 1);
        ctx.textAlign = "left";
        ctx.textBaseline = "bottom";
        ctx.fillText("Rango MAX.", pixelPerCM * rangeMaxShoot + width / 2, height / 2);
    }

    if (isMouseModeEnabled || isAimModeEnabled) {
        let a = mouseX - width / 2;
        let b = mouseY - height / 2;
        let angle = Math.atan2(b, a);

        let closestData = getDataClosestToAngle(angle);
        let dist = Math.sqrt(a * a + b * b) / pixelPerCM;

        if (isAimModeEnabled) {
            closestData = Math.min(closestData, rangeMaxShoot);
            dist = closestData;
        }

        const [mx, my] = getDot(angle, Math.min(closestData, dist));  
        const [x, y] = getDot(angle, closestData);

        ctx.lineWidth = 5;
        ctx.strokeStyle = "white";
        line(mx, my, width / 2, height / 2, ctx);

        if (!isAimModeEnabled) {
            ctx.lineWidth = 1;
            ctx.strokeStyle = "white";
            line(x, y, width / 2, height / 2, ctx);
        }

        ctx.font = "24px VCR";
        if (!isAimModeEnabled) {
            ctx.textAlign = (x < (width / 2)) ? "right" : "left";
            ctx.textBaseline = (y < (height / 2)) ? "top" : "bottom";
            ctx.fillStyle = addAlpha("#ffffff", 0.5);
            ctx.fillText(closestData, x, y);
        }
        
        ctx.textAlign = "right";
        ctx.textBaseline = "bottom";
        ctx.fillStyle = isAimModeEnabled ? "white" : red;
        ctx.fillText(Math.round(Math.min(dist, closestData) * 10) / 10, mx, my);
    }

    setTimeout(drawUpdateLayer, 35);
}

function getDataClosestToAngle(angle) {
    angle += Math.PI / 2;
    if (angle < 0) angle += Math.PI * 2;

    let anglePerData = Math.PI * 2 / data.length;
    let index = Math.round(angle / anglePerData);

    let dt = data[data.length - index];
    return (dt == 0 ? dataMax : dt) / 10;
}

function displayHelperTicks(ctx, p) {
    if (p == 0) return;
    let dist = p * 20;

    ctx.beginPath();
    for (let i = 0; i < 361; i += 15) {
        let angle = i * Math.PI / 180;
        let x = Math.cos(angle) * ((radarSizeFull / 2) - dist) + (width / 2);
        let y = Math.sin(angle) * ((radarSizeFull / 2) - dist) + (height / 2);

        let xs = Math.cos(angle) * (radarSizeFull / 2) + (width / 2);
        let ys = Math.sin(angle) * (radarSizeFull / 2) + (height / 2);

        ctx.moveTo(x, y);
        ctx.lineTo(xs, ys);
    }
    ctx.lineWidth = 10;
    ctx.strokeStyle = red;
    ctx.stroke();
    ctx.closePath();
}

function displayAngles(ctx, p) {
    if (p == 1) return;
    let lerpTo = 180;
    let mult = p;

    for (let i = 30; i < 151; i += 15) {
        let final = lerp(i, lerpTo, mult)
        radialText((final - 90) % 360, 35, Math.round(final) + "", ctx);
    }

    for (let i = 210; i < 331; i += 15) {
        let final = lerp(i, lerpTo, mult);
        radialText((final - 90) % 360, 35, Math.round(final) + "", ctx);
    }
}

function distanceLines(ctx, p) {
    if (p > 0) {
        let distance = radarSize / 2 * p;
        let dataMaxP = dataMax / 10 * p;

        // Draw distance reference lines
        ctx.strokeStyle = addAlpha("#ffffff", 0.5);
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(width / 2, height / 2 + distance);
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(width / 2 + distance, height / 2);
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(width / 2, height / 2 - distance);
        ctx.moveTo(width / 2, height / 2);
        ctx.lineTo(width / 2 - distance, height / 2);

        // Draw 5cm steps on the reference lines
        let stepSpacing = Math.round((dataMax / 50) / 5) * 5;
        let steps = Math.min(10, dataMaxP / stepSpacing);

        for (let i = 1; i < steps; i++) {
            let dist = i * stepSpacing * pixelPerCM;
            let dst = pixelPerCM;

            ctx.moveTo(width / 2 - dst, height / 2 + dist);
            ctx.lineTo(width / 2 + dst, height / 2 + dist);
            ctx.moveTo(width / 2 - dst, height / 2 - dist);
            ctx.lineTo(width / 2 + dst, height / 2 - dist);
            ctx.moveTo(width / 2 + dist, height / 2 - dst);
            ctx.lineTo(width / 2 + dist, height / 2 + dst);
            ctx.moveTo(width / 2 - dist, height / 2 - dst); 
            ctx.lineTo(width / 2 - dist, height / 2 + dst);
        }

        ctx.stroke();
        ctx.closePath();

        for (let i = 1; i < steps; i++) {
            let dist = i * stepSpacing * pixelPerCM;
            let dst = pixelPerCM;

            ctx.font = "24px VCR";
            ctx.fillStyle = addAlpha("#ffffff", 0.5);
            ctx.textAlign = "left";
            ctx.textBaseline = "top";
            ctx.fillText(i * stepSpacing + "", width / 2 + dist, height / 2 + dst);
        }
    }
    
    // Draw robot center dot
    ctx.beginPath();
    ctx.fillStyle = "white";
    ctx.arc(width / 2, height / 2, 25 / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.closePath();
}

function squarePattern(lines, ctx) {
    let angle = 45 * Math.PI / 180;
    let xArr = new Array(lines);
    let yArr = new Array(lines);

    for (let i = 0; i < lines; i++) {
        let p = (i + 0.5) / lines;
        let x = lerp(-radarSize, radarSize, p) / 2;
        let y = 0;

        let lAngle = Math.acos(x / radarSize * 2) + angle;

        x = Math.cos(lAngle) * radarSize / 2;
        y = Math.sin(lAngle) * radarSize / 2;

        xArr[i] = x;
        yArr[i] = y;
    }

    ctx.strokeStyle = addAlpha(red, 0.1);
    ctx.lineWidth = 4;
    let n1 = lines - 1;
    for (let i = 0; i < lines; i++) {
        let x = xArr[i];
        let y = yArr[i];
        let xOpp = xArr[n1 - i];
        let yOpp = yArr[n1 - i];

        line(width / 2 + x, height / 2 + y, width / 2 - xOpp, height / 2 - yOpp, ctx);
        line(width / 2 - x, height / 2 + y, width / 2 + xOpp, height / 2 - yOpp, ctx);
    }
}

function radialText(angle, dist, text, ctx) {
    angle *= Math.PI / 180;
    let x = Math.cos(angle) * ((radarSize / 2) + dist) + (width / 2);
    let y = Math.sin(angle) * ((radarSize / 2) + dist) + (height / 2);

    let ox = Math.cos(angle) * (radarSize / 2) + (width / 2);
    let oy = Math.sin(angle) * (radarSize / 2) + (height / 2);

    let alignX = "", alignY = "";
    let txtSize = 32;
    let xMult = 0.75;

    let sx = x, sy = y, ex = x, ey = y;
    let margin = 5;
    let xExt = x;
    let xExtMult = 1.5;

    if (Math.round(x) < Math.round(width / 2)) {
        alignX = "right";
        ex -= text.length * txtSize * xMult;
        xExt -= text.length * txtSize * xMult * xExtMult;
    } else if (Math.round(x) > Math.round(width / 2)) {
        alignX = "left";
        ex += text.length * txtSize * xMult;
        xExt += text.length * txtSize * xMult * xExtMult;
    } else {
        alignX = "center";
        sx -= text.length * txtSize / 2 * xMult;
        ex += text.length * txtSize / 2 * xMult;
    }

    if (Math.round(y) < Math.round(height / 2)) {
        alignY = "bottom";
        ey -= txtSize;
    } else if (Math.round(y) > Math.round(height / 2)) {
        alignY = "top";
        ey += txtSize;
    } else {
        alignY = "middle";
        sy -= txtSize / 2;
        ey += txtSize / 2;
    }

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(ox, oy);
    ctx.lineWidth = 10;
    ctx.strokeStyle = red;
    ctx.stroke();
    ctx.closePath();

    ctx.fillStyle = blue;
    ctx.fillRect(Math.min(sx, ex) - margin, Math.min(sy, ey) - margin, Math.abs(ex - sx) + (margin * 2), Math.abs(ey - sy) + (margin * 2));

    ctx.fillStyle = addAlpha(red, 0.5);
    ctx.fillRect(Math.min(sx, xExt) - margin, Math.min(sy, ey) - margin, Math.abs(xExt - sx) + margin * 2, Math.abs(ey - sy) + (margin * 2));

    ctx.fillStyle = addAlpha(red, 0.8);
    ctx.fillRect(Math.min(sx, ex) - margin, Math.min(sy, ey) - margin, Math.abs(ex - sx) + (margin * 2), Math.abs(ey - sy) + (margin * 2));
    
    ctx.font = "32px VCR";
    ctx.fillStyle = blue;
    ctx.textAlign = alignX;
    ctx.textBaseline = alignY;
    ctx.fillText(text, x, y);
}

function lerp(a, b, t) {
    return a + (b - a) * t;
}

function line(x, y, x2, y2, ctx) {
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x2, y2);
    ctx.stroke();
    ctx.closePath();
}

function gradCircl(steps, sizeMargin, weight, weightMargin, ctx) {
    let x = width / 2;
    let y = height / 2;

    for (let i = 0; i < steps; i++) {
        let p = i / steps;
        circl(x, y, weightMargin * p + weight, sizeMargin * (1 - p) + radarSizeFull / 2, 1 * p, ctx);
    }
}

function circl(x, y, w, s, op, ctx) {
    ctx.beginPath();
    ctx.arc(x, y, s, 0, 2 * Math.PI);
    ctx.lineWidth = w;
    ctx.strokeStyle = addAlpha(red, Math.max(op, 0.1));
    ctx.stroke();
    ctx.closePath();
}

function indexToRadians(i) {
    return (-360 / data.length * i - 90) * Math.PI / 180;
}

function getDot(rads, dist) {
    let x = Math.cos(rads) * dist * pixelPerCM + (width / 2);
    let y = Math.sin(rads) * dist * pixelPerCM + (height / 2);
    return [x, y];
}

function rdrDot(rads, dist, depth, ctx) {
    depth--;
    let dm = dataMax / 10;

    dist += dm / 30;
    if (dist >= dm) return;

    dist = Math.min(dist, dm);

    const [x, y] = getDot(rads, dist);
    drawPreRenderedCircle(ctx, x, y, dotMaxSize * (depth / dotDepth), depth - 1);

    if (depth > 2) {
        rdrDot(rads, dist , depth, ctx);
    }
}

function addAlpha(color, opacity) {
    var _opacity = Math.round(Math.min(Math.max(opacity ?? 1, 0), 1) * 255);
    return color + _opacity.toString(16).toUpperCase();
}

function smooth(x) {
    return (Math.cos((x - 1) * Math.PI) + 1) / 2;
}