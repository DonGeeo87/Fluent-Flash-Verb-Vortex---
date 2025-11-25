/**
 * DifficultyManager.js
 * Gestiona la dificultad adaptativa basada en errores del usuario
 */

export class DifficultyManager {
    constructor() {
        // Mapa de patrones gramaticales a contadores de errores
        this.errorCounts = new Map();
        
        // Mapa de patrones a tiempo promedio de completado
        this.completionTimes = new Map();
        
        // Historial de errores recientes (últimas 10 frases)
        this.recentErrors = [];
        this.maxRecentHistory = 10;
    }

    /**
     * Registra un error para un patrón gramatical específico
     * @param {string} patternName - Nombre del patrón gramatical
     */
    recordError(patternName) {
        const currentCount = this.errorCounts.get(patternName) || 0;
        this.errorCounts.set(patternName, currentCount + 1);
        
        // Agregar al historial reciente
        this.recentErrors.push({
            pattern: patternName,
            timestamp: Date.now()
        });
        
        // Limitar el historial
        if (this.recentErrors.length > this.maxRecentHistory) {
            this.recentErrors.shift();
        }
    }

    /**
     * Registra el tiempo de completado de una frase
     * @param {string} patternName - Nombre del patrón gramatical
     * @param {number} timeMs - Tiempo en milisegundos
     */
    recordCompletionTime(patternName, timeMs) {
        const times = this.completionTimes.get(patternName) || [];
        times.push(timeMs);
        
        // Mantener solo los últimos 5 tiempos
        if (times.length > 5) {
            times.shift();
        }
        
        this.completionTimes.set(patternName, times);
    }

    /**
     * Obtiene el contador de errores para un patrón
     * @param {string} patternName - Nombre del patrón gramatical
     * @returns {number} Número de errores registrados
     */
    getErrorCount(patternName) {
        return this.errorCounts.get(patternName) || 0;
    }

    /**
     * Obtiene el tiempo promedio de completado para un patrón
     * @param {string} patternName - Nombre del patrón gramatical
     * @returns {number} Tiempo promedio en milisegundos
     */
    getAverageCompletionTime(patternName) {
        const times = this.completionTimes.get(patternName);
        if (!times || times.length === 0) return null;
        
        const sum = times.reduce((acc, time) => acc + time, 0);
        return sum / times.length;
    }

    /**
     * Obtiene el mapa completo de errores (para PhraseGenerator)
     * @returns {Map} Mapa de patrones a contadores de errores
     */
    getErrorCountsMap() {
        return new Map(this.errorCounts);
    }

    /**
     * Calcula la dificultad general del usuario
     * @returns {number} Dificultad entre 1-10
     */
    calculateOverallDifficulty() {
        if (this.errorCounts.size === 0) return 1;
        
        const totalErrors = Array.from(this.errorCounts.values())
            .reduce((sum, count) => sum + count, 0);
        
        const uniquePatterns = this.errorCounts.size;
        const averageErrors = totalErrors / uniquePatterns;
        
        // Normalizar a escala 1-10
        return Math.min(10, Math.max(1, Math.floor(averageErrors / 2) + 1));
    }

    /**
     * Obtiene estadísticas de rendimiento
     * @returns {Object} Objeto con estadísticas
     */
    getStats() {
        const totalErrors = Array.from(this.errorCounts.values())
            .reduce((sum, count) => sum + count, 0);
        
        const patternsWithErrors = this.errorCounts.size;
        const recentErrorRate = this.recentErrors.length / this.maxRecentHistory;
        
        return {
            totalErrors,
            patternsWithErrors,
            recentErrorRate,
            overallDifficulty: this.calculateOverallDifficulty(),
            topProblemPatterns: this.getTopProblemPatterns(3)
        };
    }

    /**
     * Obtiene los patrones con más errores
     * @param {number} count - Número de patrones a retornar
     * @returns {Array} Array de objetos {pattern, errors}
     */
    getTopProblemPatterns(count = 3) {
        const entries = Array.from(this.errorCounts.entries())
            .map(([pattern, errors]) => ({ pattern, errors }))
            .sort((a, b) => b.errors - a.errors)
            .slice(0, count);
        
        return entries;
    }

    /**
     * Reinicia todas las estadísticas
     */
    reset() {
        this.errorCounts.clear();
        this.completionTimes.clear();
        this.recentErrors = [];
    }

    /**
     * Exporta los datos para persistencia (localStorage, etc.)
     * @returns {Object} Datos serializables
     */
    exportData() {
        return {
            errorCounts: Array.from(this.errorCounts.entries()),
            completionTimes: Array.from(this.completionTimes.entries()).map(([pattern, times]) => [
                pattern,
                times
            ]),
            recentErrors: this.recentErrors
        };
    }

    /**
     * Importa datos desde un objeto serializado
     * @param {Object} data - Datos a importar
     */
    importData(data) {
        if (data.errorCounts) {
            this.errorCounts = new Map(data.errorCounts);
        }
        if (data.completionTimes) {
            this.completionTimes = new Map(data.completionTimes);
        }
        if (data.recentErrors) {
            this.recentErrors = data.recentErrors;
        }
    }
}




