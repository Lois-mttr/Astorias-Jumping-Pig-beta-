//****** GAME LOOP ********//

let time = new Date();
let deltaTime = 0;

if (document.readyState === "complete" || document.readyState === "interactive") {
    setTimeout(init, 1);
} else {
    document.addEventListener("DOMContentLoaded", init);
}

function init() {
    time = new Date();
    start();
    loop();
}

function loop() {
    deltaTime = (new Date() - time) / 1000;
    time = new Date();
    update();
    requestAnimationFrame(loop);
}

//****** GAME LOGIC ********//

//****** GAME LOGIC ********//

const sueloY = 22;
let velY = 0;
const impulso = 900;
const gravedad = 2800;

const dinoPosX = 42;
let dinoPosY = sueloY;

let sueloX = 0;
const velEscenario = 1280 / 3;
let gameVel = 1;
let score = 0;

let parado = false;
let saltando = false;
let agachado = false;

let tiempoHastaObstaculo = 2;
const tiempoObstaculoMin = 0.7;
const tiempoObstaculoMax = 1.8;
const obstaculoPosY = 16;
let obstaculos = [];

let tiempoHastaNube = 0.5;
const tiempoNubeMin = 0.7;
const tiempoNubeMax = 2.7;
const maxNubeY = 270;
const minNubeY = 100;
let nubes = [];
const velNube = 0.5;

let contenedor;
let dino;
let textoScore;
let suelo;
let gameOver;

const jumpSound = document.getElementById('jump');
const loseSound = document.getElementById('lose');
const scoreSound = document.getElementById('score');

function start() {
    gameOver = document.querySelector(".game-over");
    suelo = document.querySelector(".suelo");
    contenedor = document.querySelector(".contenedor");
    textoScore = document.querySelector(".score");
    dino = document.querySelector(".dino");

    // estado inicial
    textoScore.innerText = String(score);
    dino.classList.add("dino-corriendo");

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("keydown", handleRestartKey);
    document.addEventListener("keyup", handleKeyUp);
    document.addEventListener("touchstart", handleTouchStart);
    gameOver.addEventListener("click", restart);
    gameOver.addEventListener("keydown", (e) => { if (e.key.toLowerCase() === 'r') restart(); });
}

function update() {
    if (parado) return;

    moverDinosaurio();
    moverSuelo();
    decidirCrearObstaculos();
    decidirCrearNubes();
    moverObstaculos();
    moverNubes();
    detectarColision();

    velY -= gravedad * deltaTime;
}

function handleKeyDown(ev) {
    if (ev.code === 'Space' || ev.keyCode === 32 || ev.code === 'ArrowUp') {
        saltar();
    }
    // tecla para agacharse: ArrowDown o Control
    if (ev.code === 'ArrowDown' || ev.key === 'Control' || ev.key === 'ControlLeft' || ev.key === 'ControlRight') {
        agacharse();
    }
}

function handleKeyUp(ev) {
    if (ev.code === 'ArrowDown' || ev.key === 'Control' || ev.key === 'ControlLeft' || ev.key === 'ControlRight') {
        levantarse();
    }
}

function handleRestartKey(ev) {
    if (ev.key && ev.key.toLowerCase() === 'r') {
        restart();
    }
}

function handleTouchStart() {
    // Un toque = salto (si el juego está en marcha) o reinicio (si game over)
    if (parado) restart();
    else saltar();
}

function saltar() {
    if (dinoPosY === sueloY) {
        // si está agachado, levantarse antes de saltar
        if (agachado) levantarse();
        saltando = true;
        velY = impulso;
        dino.classList.remove("dino-corriendo");
        try { jumpSound.play(); } catch (e) {}
    }
}

function agacharse() {
    if (parado) return;
    if (dinoPosY !== sueloY) return; // solo en el suelo
    if (agachado) return;
    agachado = true;
    dino.classList.remove('dino-corriendo');
    dino.classList.add('dino-agachado');
}

function levantarse() {
    if (!agachado) return;
    agachado = false;
    dino.classList.remove('dino-agachado');
    dino.classList.add('dino-corriendo');
}

function moverDinosaurio() {
    dinoPosY += velY * deltaTime;
    if (dinoPosY <= sueloY) {
        tocarSuelo();
    }
    dino.style.bottom = dinoPosY + "px";
}

function tocarSuelo() {
    dinoPosY = sueloY;
    velY = 0;
    if (saltando) {
        dino.classList.add("dino-corriendo");
    }
    saltando = false;
}

function moverSuelo() {
    sueloX += calcularDesplazamiento();
    suelo.style.left = -(sueloX % contenedor.clientWidth) + "px";
}

function calcularDesplazamiento() {
    return velEscenario * deltaTime * gameVel;
}

function estrellarse() {
    dino.classList.remove("dino-corriendo");
    dino.classList.add("dino-estrellado");
    parado = true;
}

function decidirCrearObstaculos() {
    tiempoHastaObstaculo -= deltaTime;
    if (tiempoHastaObstaculo <= 0) {
        crearObstaculo();
    }
}

function decidirCrearNubes() {
    tiempoHastaNube -= deltaTime;
    if (tiempoHastaNube <= 0) {
        crearNube();
    }
}

function crearObstaculo() {
    const obstaculo = document.createElement("div");
    contenedor.appendChild(obstaculo);
    obstaculo.classList.add("cactus");
    const r = Math.random();
    if (r > 0.8) obstaculo.classList.add("cactus3");
    else if (r > 0.5) obstaculo.classList.add("cactus2");

    obstaculo.posX = contenedor.clientWidth;
    obstaculo.style.left = contenedor.clientWidth + "px";

    obstaculos.push(obstaculo);
    tiempoHastaObstaculo = (tiempoObstaculoMin + Math.random() * (tiempoObstaculoMax - tiempoObstaculoMin)) / gameVel;
}

function crearNube() {
    const nube = document.createElement("div");
    contenedor.appendChild(nube);
    nube.classList.add("nube");
    nube.posX = contenedor.clientWidth;
    nube.style.left = contenedor.clientWidth + "px";
    nube.style.bottom = minNubeY + Math.random() * (maxNubeY - minNubeY) + "px";

    nubes.push(nube);
    tiempoHastaNube = (tiempoNubeMin + Math.random() * (tiempoNubeMax - tiempoNubeMin)) / gameVel;
}

function moverObstaculos() {
    for (let i = obstaculos.length - 1; i >= 0; i--) {
        if (obstaculos[i].posX < -obstaculos[i].clientWidth) {
            obstaculos[i].parentNode.removeChild(obstaculos[i]);
            obstaculos.splice(i, 1);
            ganarPuntos();
        } else {
            obstaculos[i].posX -= calcularDesplazamiento();
            obstaculos[i].style.left = obstaculos[i].posX + "px";
        }
    }
}

function moverNubes() {
    for (let i = nubes.length - 1; i >= 0; i--) {
        if (nubes[i].posX < -nubes[i].clientWidth) {
            nubes[i].parentNode.removeChild(nubes[i]);
            nubes.splice(i, 1);
        } else {
            nubes[i].posX -= calcularDesplazamiento() * velNube;
            nubes[i].style.left = nubes[i].posX + "px";
        }
    }
}

function ganarPuntos() {
    score++;
    textoScore.innerText = String(score);
    if (score === 15) {
        gameVel = 1.2;
        contenedor.classList.add("mediodia");
        try { scoreSound.play(); } catch (e) {}
    } else if (score === 30) {
        gameVel = 1.5;
        contenedor.classList.add("tarde");
        try { scoreSound.play(); } catch (e) {}
    } else if (score === 50) {
        gameVel = 1.8;
        contenedor.classList.add("noche");
        try { scoreSound.play(); } catch (e) {}
    }
    suelo.style.animationDuration = (3 / gameVel) + "s";
}

function gameOverFunc() {
    estrellarse();
    gameOver.style.display = "block";
    try { loseSound.play(); } catch (e) {}
}

function restart() {
    // limpiar obstáculos y nubes
    obstaculos.forEach(o => o.parentNode && o.parentNode.removeChild(o));
    nubes.forEach(n => n.parentNode && n.parentNode.removeChild(n));
    obstaculos = [];
    nubes = [];

    // reset variables
    score = 0;
    textoScore.innerText = String(score);
    gameVel = 1;
    suelo.style.animationDuration = "3s";
    contenedor.classList.remove("mediodia", "tarde", "noche");

    dino.classList.remove("dino-estrellado");
    dino.classList.add("dino-corriendo");
    dinoPosY = sueloY;
    dino.style.bottom = dinoPosY + "px";

    tiempoHastaObstaculo = 2;
    tiempoHastaNube = 0.5;

    parado = false;
    gameOver.style.display = "none";
}

function detectarColision() {
    for (let i = 0; i < obstaculos.length; i++) {
        if (obstaculos[i].posX > dinoPosX + dino.clientWidth) {
            // adelante, no colisión posible aún
            break; // al estar en orden, no puede chocar con más
        } else {
            if (isCollision(dino, obstaculos[i], 10, 30, 15, 20)) {
                gameOverFunc();
            }
        }
    }
}

function isCollision(a, b, paddingTop, paddingRight, paddingBottom, paddingLeft) {
    const aRect = a.getBoundingClientRect();
    const bRect = b.getBoundingClientRect();

    return !(
        ((aRect.top + aRect.height - paddingBottom) < (bRect.top)) ||
        (aRect.top + paddingTop > (bRect.top + bRect.height)) ||
        ((aRect.left + aRect.width - paddingRight) < bRect.left) ||
        (aRect.left + paddingLeft > (bRect.left + bRect.width))
    );
}