/**
 * PhraseGenerator.js
 * Generación procedural de frases gramaticales en inglés
 * para practicar diferentes estructuras verbales
 */

export class PhraseGenerator {
    constructor() {
        this.subjects = [
            'I', 'You', 'He', 'She', 'We', 'They',
            'The cat', 'The dog', 'The teacher', 'The student',
            'My friend', 'Her brother', 'Our team', 'Their family'
        ];

        this.verbs = {
            pastSimple: {
                regular: ['walked', 'played', 'studied', 'worked', 'helped', 'cooked', 'cleaned', 'watched'],
                irregular: ['went', 'came', 'saw', 'took', 'gave', 'made', 'did', 'had', 'said', 'got', 'knew', 'thought']
            },
            presentPerfect: {
                regular: ['has walked', 'have played', 'has studied', 'have worked'],
                irregular: ['has gone', 'have come', 'has seen', 'have taken', 'has given', 'have made']
            },
            pastContinuous: {
                regular: ['was walking', 'were playing', 'was studying', 'were working'],
                irregular: ['was going', 'were coming', 'was seeing', 'were taking']
            },
            thirdConditional: {
                regular: ['would have walked', 'would have played', 'would have studied'],
                irregular: ['would have gone', 'would have come', 'would have seen', 'would have taken']
            }
        };

        this.objects = [
            'the book', 'the car', 'the house', 'the phone', 'the computer',
            'a letter', 'a message', 'a picture', 'a song', 'a movie',
            'homework', 'breakfast', 'lunch', 'dinner', 'coffee'
        ];

        this.complements = [
            'yesterday', 'last week', 'this morning', 'in the park',
            'at school', 'at home', 'with friends', 'very quickly',
            'carefully', 'quietly', 'suddenly', 'immediately'
        ];

        this.prepositions = [
            'to', 'from', 'with', 'for', 'about', 'at', 'in', 'on'
        ];

        // Patrones gramaticales disponibles
        this.grammarPatterns = [
            {
                name: 'Past Simple Regular',
                template: (s, v, o, c) => `${s} ${v} ${o}${c ? ' ' + c : ''}.`,
                verbType: 'pastSimple',
                verbSubtype: 'regular'
            },
            {
                name: 'Past Simple Irregular',
                template: (s, v, o, c) => `${s} ${v} ${o}${c ? ' ' + c : ''}.`,
                verbType: 'pastSimple',
                verbSubtype: 'irregular'
            },
            {
                name: 'Present Perfect',
                template: (s, v, o, c) => `${s} ${v} ${o}${c ? ' ' + c : ''}.`,
                verbType: 'presentPerfect',
                verbSubtype: 'regular'
            },
            {
                name: 'Past Continuous',
                template: (s, v, o, c) => `${s} ${v} ${o}${c ? ' ' + c : ''}.`,
                verbType: 'pastContinuous',
                verbSubtype: 'regular'
            },
            {
                name: 'Third Conditional',
                template: (s, v, o, c) => `If ${s} had known, ${s.toLowerCase()} ${v} ${o}${c ? ' ' + c : ''}.`,
                verbType: 'thirdConditional',
                verbSubtype: 'irregular'
            }
        ];
    }

    /**
     * Genera una frase aleatoria basada en los patrones disponibles
     * @param {Map} errorCounts - Mapa de patrones a contadores de errores
     * @returns {Object} Objeto con la frase y metadatos
     */
    generatePhrase(errorCounts = new Map()) {
        // Seleccionar patrón basado en dificultad adaptativa
        const pattern = this.selectPatternByDifficulty(errorCounts);
        
        // Seleccionar componentes aleatorios
        const subject = this.getRandomElement(this.subjects);
        const verbType = this.verbs[pattern.verbType];
        const verbSubtype = verbType[pattern.verbSubtype] || verbType.regular || verbType.irregular;
        const verb = this.getRandomElement(verbSubtype);
        const object = this.getRandomElement(this.objects);
        const complement = Math.random() > 0.5 ? this.getRandomElement(this.complements) : null;

        // Generar frase usando el template
        const phrase = pattern.template(subject, verb, object, complement);

        return {
            phrase,
            pattern: pattern.name,
            difficulty: this.calculateDifficulty(pattern, errorCounts)
        };
    }

    /**
     * Selecciona un patrón gramatical basado en la dificultad adaptativa
     * Los patrones con más errores tienen mayor probabilidad de ser seleccionados
     */
    selectPatternByDifficulty(errorCounts) {
        if (errorCounts.size === 0) {
            return this.getRandomElement(this.grammarPatterns);
        }

        // Calcular pesos basados en errores
        const weights = this.grammarPatterns.map(pattern => {
            const errorCount = errorCounts.get(pattern.name) || 0;
            // Mayor peso = más errores (más probabilidad de aparecer)
            return Math.max(1, errorCount + 1);
        });

        // Selección ponderada
        const totalWeight = weights.reduce((sum, w) => sum + w, 0);
        let random = Math.random() * totalWeight;

        for (let i = 0; i < this.grammarPatterns.length; i++) {
            random -= weights[i];
            if (random <= 0) {
                return this.grammarPatterns[i];
            }
        }

        return this.grammarPatterns[0];
    }

    /**
     * Calcula la dificultad de una frase basada en el patrón y errores previos
     */
    calculateDifficulty(pattern, errorCounts) {
        const baseDifficulty = this.getBaseDifficulty(pattern);
        const errorCount = errorCounts.get(pattern.name) || 0;
        
        // Dificultad aumenta con errores previos
        return Math.min(10, baseDifficulty + Math.floor(errorCount / 3));
    }

    /**
     * Obtiene la dificultad base de un patrón gramatical
     */
    getBaseDifficulty(pattern) {
        const difficultyMap = {
            'Past Simple Regular': 2,
            'Past Simple Irregular': 4,
            'Present Perfect': 5,
            'Past Continuous': 6,
            'Third Conditional': 8
        };
        return difficultyMap[pattern.name] || 5;
    }

    /**
     * Utilidad: obtiene un elemento aleatorio de un array
     */
    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    /**
     * Valida si una frase generada es válida (no vacía, tiene sentido)
     */
    validatePhrase(phrase) {
        return phrase && phrase.length > 10 && phrase.trim().length > 0;
    }
}




