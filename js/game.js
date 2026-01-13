// --- CONFIGURACIÓN Y CONSTANTES ---
const CONFIG = {
    META_PARA_GANAR: 5,
    LIMITE_ERRORES: 5,
    TOPE_VISUAL_RACE: 90,
    VELOCIDAD_OPONENTE: 19,
    AVANCE_POR_ACIERTO: 18, // 90 / 5
    PATHS: {
        JUGADOR: "images/corredor_jugador.png",
        OPONENTE: "images/corredor_oponente.png",
        GANASTE: "images/ganaste-img.png",
        PERDISTE: "images/perdiste-img.png"
    }
};

const bancoPreguntas = [
    { p: "¿Cuál es el número que si le quitas la mitad vale cero?", r: ["8", "10", "4"] },
    { p: "Estás en una carrera. Adelantas al segundo. ¿En qué posición quedas?", r: ["Segundo lugar", "Primer lugar", "Tercer lugar"] },
    { p: "¿Cuanto es 2 y 2?", r: ["4", "22", "44"] },
    { p: "Miguel tiene 3.5 docenas de canicas, pierde 18 y le regalan 12. ¿Cuántas le quedan?", r: ["36", "24", "30"] },
    { p: "5 compañeros se saludan de mano. ¿Cuántos apretones hubo en total?", r: ["10", "15", "20"] },
    { p: "Algunos meses tienen 30 días, otros 31. ¿Cuántos tienen 28?", r: ["Todos", "5", "1"]},
    { p: "La mamá de Pedro tiene 5 hijos: Paula, Pablo, Paco, Pancho y...", r: ["Pedro", "Yo", "Luis"]},
    { p: "Pagas $50.00 por una cuenta de $29.85. ¿Cuánto es el cambio?", r:["$20.15","$31.15","$20.85"]},
    { p: "¿Qué pesa más, 1kg de plomo o 1kg de algodón?", r:["Pesan lo mismo","Plomo","Algodón"]},
    { p: "Dos amigos tienen 15 balones. Uno tiene 3 más que el otro. ¿Cuántos tienen?", r:["9 y 6","10 y 5","12 y 3"]},
];

// --- ESTADO DEL JUEGO ---
const GameState = {
    aciertos: 0, errores: 0, indice: 0,
    progresoJugador: 0, progresoOponente: 0, preguntas: [],

    reset(banco) {
        this.aciertos = 0; this.errores = 0; this.indice = 0;
        this.progresoJugador = 0; this.progresoOponente = 0;
        this.preguntas = [...banco].sort(() => Math.random() - 0.5);
    },

    procesarRespuesta(esCorrecta) {
        if (esCorrecta) {
            this.aciertos++;
            this.progresoJugador += CONFIG.AVANCE_POR_ACIERTO;
        } else {
            this.errores++;
            this.progresoOponente += CONFIG.VELOCIDAD_OPONENTE;
        }
        return { gano: this.aciertos >= CONFIG.META_PARA_GANAR, perdio: this.errores >= CONFIG.LIMITE_ERRORES };
    }
};

// --- MOTOR DE UI ---
const UI = {
    getContainer() { return document.getElementById("videogame"); },

    bloquear(on) {
        const c = this.getContainer();
        if(c) c.style.pointerEvents = on ? "none" : "auto";
    },

    createTopBar() {
        if (document.querySelector('.top-bar-ui')) return;
        const topBar = document.createElement('div');
        topBar.className = 'top-bar-ui';
        topBar.innerHTML = `<h1 class="top-bar-title">Amigos <br> <span class="texto-pequeno">en movimiento</span></h1>
                            <p class="top-bar-instruction">Contesta correctamente para ganar.</p>`;
        this.getContainer().appendChild(topBar);
    },

    createFooterYPersonajes() {
        if (document.getElementById('char-player')) return;
        const html = `
            <div id="char-opponent" class="character-racer opponent"><img src="${CONFIG.PATHS.OPONENTE}"></div>
            <div id="char-player" class="character-racer"><img src="${CONFIG.PATHS.JUGADOR}"></div>
            <div class="footer-ui"></div>`;
        this.getContainer().insertAdjacentHTML('beforeend', html);
    },

    updatePositions(pJugador, pOponente) {
        const player = document.getElementById('char-player');
        const opponent = document.getElementById('char-opponent');
        if(player) player.style.left = `${Math.min(pJugador, CONFIG.TOPE_VISUAL_RACE)}%`;
        if(opponent) opponent.style.left = `${Math.min(pOponente, CONFIG.TOPE_VISUAL_RACE)}%`;
    },

    renderPregunta(data, callback) {
        const anterior = document.querySelector('.game-container');
        if (anterior) anterior.remove();

        const opciones = [
            { t: data.r[0], c: true }, { t: data.r[1], c: false }, { t: data.r[2], c: false }
        ].sort(() => Math.random() - 0.5);

        const html = `
            <div class="game-container">
                <div class="question-card">
                    <div class="question-label"><span>Pregunta</span></div>
                    <h2 class="question-text">${data.p}</h2>
                    <div class="bracket-corner top-left"></div><div class="bracket-corner bottom-right"></div>
                </div>
                <div class="answers-grid">${opciones.map(o => `<button class="btn-answer">${o.t}</button>`).join('')}</div>
            </div>`;
        this.getContainer().insertAdjacentHTML('beforeend', html);

        document.querySelectorAll('.btn-answer').forEach((btn, i) => {
            btn.onclick = () => callback(opciones[i].c, btn);
        });
    },

renderFinal(gano) {
        // 1. Desbloqueamos la UI inmediatamente al terminar para permitir interacción
        this.bloquear(false); 

        const container = this.getContainer();
        // Limpiamos tarjetas de juego previas
        const anterior = document.querySelector('.game-container');
        if (anterior) anterior.remove();

        const overlay = document.createElement('div');
        overlay.className = 'overlay-final';
        overlay.innerHTML = `
            <section class="bloqueBlanco">
                <img src="${gano ? CONFIG.PATHS.GANASTE : CONFIG.PATHS.PERDISTE}" class="imagen-resultado">
                <h1>${gano ? "¡Felicidades!" : "No te desanimes..."}</h1>
                <h3>${gano ? "¡Ganaste la carrera!" : "Sigue intentándolo"}</h3>
                <button class="btn-restart" id="btn-jugar-nuevo">Juega de nuevo</button>
            </section>`;
            
        container.appendChild(overlay);

        // Evento de reinicio
        document.getElementById("btn-jugar-nuevo").onclick = (e) => {
            e.preventDefault();
            overlay.remove(); 
            iniciarJuego(); 
        };
    }
};

// --- CONTROLADOR ---
function verificarRespuesta(esCorrecta, btn) {
    // 1. Bloqueamos clics para evitar que el usuario pulse varias veces
    UI.bloquear(true); 
    btn.classList.add(esCorrecta ? 'correct' : 'wrong');

    // 2. Procesamos el estado (Aciertos/Errores/Progreso)
    const resultado = GameState.procesarRespuesta(esCorrecta);

    // 3. Activamos animación de los personajes
    const pImg = document.getElementById('char-player');
    const oImg = document.getElementById('char-opponent');
    if (pImg) pImg.classList.add('is-running');
    if (oImg) oImg.classList.add('is-running');

    UI.updatePositions(GameState.progresoJugador, GameState.progresoOponente);

    // 4. Pausa para ver la carrera antes de pasar a la siguiente pregunta
    setTimeout(() => {
        // Quitamos animación de correr
        if (pImg) pImg.classList.remove('is-running');
        if (oImg) oImg.classList.remove('is-running');

        // Comprobamos si el juego terminó
        if (resultado.gano) return UI.renderFinal(true);
        if (resultado.perdio) return UI.renderFinal(false);

        // --- AQUÍ ESTÁ LA CLAVE: AVANZAR E IMPRIMIR ---
        GameState.indice++; // Incrementamos el puntero
        
        // Verificamos que aún queden preguntas en el banco
        if (GameState.indice < GameState.preguntas.length) {
            UI.renderPregunta(GameState.preguntas[GameState.indice], verificarRespuesta);
            UI.bloquear(false); // Desbloqueamos el mouse para la nueva pregunta
        } else {
            // Si se acaban las preguntas y no llegó a la meta, termina según aciertos
            UI.renderFinal(GameState.aciertos >= CONFIG.META_PARA_GANAR);
        }
    }, 1500); 
}

function iniciarJuego() {
    GameState.reset(bancoPreguntas);
    UI.bloquear(false);
    UI.createTopBar();
    UI.createFooterYPersonajes();
    UI.updatePositions(0, 0);
    UI.renderPregunta(GameState.preguntas[0], verificarRespuesta);
}

// --- COMPATIBILIDAD ---
if (typeof document !== 'undefined') {
    window.onload = iniciarJuego;
}

// Esta parte es vital para Jest
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { GameState, CONFIG, bancoPreguntas };
}