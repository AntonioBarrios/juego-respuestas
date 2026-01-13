// Importamos los objetos del archivo de juego
const { GameState, CONFIG, bancoPreguntas } = require('./game.js');

describe('Pruebas de Lógica de Carrera (GameState)', () => {
    
    beforeEach(() => {
        // Creamos el contenedor que el código espera encontrar en el DOM
        document.body.innerHTML = '<div id="videogame"></div>';
        
        // Reiniciamos el estado del juego con el banco de preguntas
        GameState.reset(bancoPreguntas);
    });

    test('El contenedor videogame debe existir en el entorno de test', () => {
        const container = document.getElementById("videogame");
        expect(container).not.toBeNull();
    });

    test('El juego debe iniciar con progreso en 0', () => {
        expect(GameState.progresoJugador).toBe(0);
        expect(GameState.aciertos).toBe(0);
    });

    test('Una respuesta correcta debe aumentar el progreso del jugador', () => {
        GameState.procesarRespuesta(true);
        expect(GameState.aciertos).toBe(1);
        expect(GameState.progresoJugador).toBe(CONFIG.AVANCE_POR_ACIERTO);
    });

    test('Una respuesta incorrecta debe avanzar al oponente', () => {
        GameState.procesarRespuesta(false);
        expect(GameState.errores).toBe(1);
        expect(GameState.progresoOponente).toBe(CONFIG.VELOCIDAD_OPONENTE);
    });

    test('Debe detectar la victoria al alcanzar la meta de aciertos', () => {
        // Simulamos llegar a la meta (CONFIG.META_PARA_GANAR = 5)
        GameState.procesarRespuesta(true);
        GameState.procesarRespuesta(true);
        GameState.procesarRespuesta(true);
        GameState.procesarRespuesta(true);
        const resultadoFinal = GameState.procesarRespuesta(true);
        
        expect(resultadoFinal.gano).toBe(true);
    });
});