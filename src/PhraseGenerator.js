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
                regular: ['walked', 'played', 'studied', 'worked', 'helped', 'cooked', 'cleaned', 'watched', 'listened', 'talked'],
                irregular: ['went', 'came', 'saw', 'took', 'gave', 'made', 'did', 'had', 'said', 'got', 'knew', 'thought', 'bought', 'brought']
            },
            presentPerfect: {
                regular: ['walked', 'played', 'studied', 'worked', 'helped', 'cooked', 'cleaned', 'watched'],
                irregular: ['gone', 'come', 'seen', 'taken', 'given', 'made', 'done', 'had', 'said', 'got', 'known', 'thought']
            },
            pastContinuous: {
                regular: ['walking', 'playing', 'studying', 'working', 'helping', 'cooking', 'cleaning', 'watching'],
                irregular: ['going', 'coming', 'seeing', 'taking', 'giving', 'making', 'doing']
            },
            thirdConditional: {
                regular: ['walked', 'played', 'studied', 'worked'],
                irregular: ['gone', 'come', 'seen', 'taken', 'given', 'made']
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

        this.curatedPhrases = {
            'Past Simple Regular': [
                'She walked along the riverside at sunrise yesterday.',
                'We studied the entire handbook before the big test.',
                'They cleaned the workshop carefully after the event.',
                'My friend cooked a comforting soup for the whole family.',
                'The teacher helped every student during the lab session.',
                'I worked on the presentation until midnight.'
            ],
            'Past Simple Irregular': [
                'He went to the music festival last weekend.',
                'They took the last train home before the storm.',
                'She saw the northern lights during her trip.',
                'We made a detailed plan for the expedition.',
                'My friend brought fresh flowers to the meeting.',
                'The team came prepared despite the delay.'
            ],
            'Present Perfect': [
                'They have completed the robotics project successfully.',
                'She has written three songs about the same city.',
                'We have visited the new art gallery twice this month.',
                'I have kept every ticket from our travels.',
                'He has repaired the vintage radio with patience.',
                'Our team has achieved all the quarterly goals.'
            ],
            'Past Continuous': [
                'Her brother was playing the piano this morning.',
                'We were studying for the chemistry exam at midnight.',
                'I was working on the launch checklist all afternoon.',
                'The students were practicing their speeches backstage.',
                'They were cooking a giant paella for the neighbors.',
                'She was reading the mystery novel by the fireplace.'
            ],
            'Third Conditional': [
                'If I had known about the storm, I would have taken an earlier train.',
                'If she had saved the file, she would have avoided the lost work.',
                'If they had checked the map, they would have found the shortcut.',
                'If we had booked the tickets sooner, we would have sat together.',
                'If he had trained harder, he would have won the championship.',
                'If the team had shared the update, everyone would have stayed calm.'
            ]
        };

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
                template: null, // Se maneja de forma especial en generatePhrase
                verbType: 'thirdConditional',
                verbSubtype: 'irregular'
            }
        ];
    }

    /**
     * Determina el auxiliar correcto según el sujeto
     */
    getAuxiliary(subject, tense) {
        const subjectLower = subject.toLowerCase();
        
        // Sujetos en tercera persona singular (usa has/was)
        const thirdPersonSingular = [
            'he', 'she', 'it',
            'the cat', 'the dog', 'the teacher', 'the student',
            'her brother', 'my friend'
        ];
        
        const isThirdPersonSingular = thirdPersonSingular.some(s => 
            subjectLower === s.toLowerCase() || subjectLower.startsWith(s.toLowerCase() + ' ')
        );
        
        if (tense === 'presentPerfect') {
            return isThirdPersonSingular ? 'has' : 'have';
        } else if (tense === 'pastContinuous') {
            return isThirdPersonSingular ? 'was' : 'were';
        }
        return '';
    }

    /**
     * Genera una frase aleatoria basada en los patrones disponibles
     * @param {Map} errorCounts - Mapa de patrones a contadores de errores
     * @returns {Object} Objeto con la frase y metadatos
     */
    generatePhrase(errorCounts = new Map()) {
        // Seleccionar patrón basado en dificultad adaptativa
        const pattern = this.selectPatternByDifficulty(errorCounts);
        
        // Usar frases curadas si están disponibles para garantizar ortografía y gramática
        const curatedList = this.curatedPhrases[pattern.name];
        if (curatedList && curatedList.length > 0) {
            const curatedPhrase = this.getRandomElement(curatedList);
            return {
                phrase: curatedPhrase,
                pattern: pattern.name,
                difficulty: this.calculateDifficulty(pattern, errorCounts)
            };
        }

        // Seleccionar componentes aleatorios (fallback legacy)
        const subject = this.getRandomElement(this.subjects);
        const verbType = this.verbs[pattern.verbType];
        const verbSubtype = verbType[pattern.verbSubtype] || verbType.regular || verbType.irregular;
        const verbBase = this.getRandomElement(verbSubtype);
        const object = this.getRandomElement(this.objects);
        const complement = Math.random() > 0.5 ? this.getRandomElement(this.complements) : null;

        // Construir el verbo completo según el patrón
        let verb = verbBase;
        if (pattern.verbType === 'presentPerfect' || pattern.verbType === 'pastContinuous') {
            const auxiliary = this.getAuxiliary(subject, pattern.verbType);
            verb = `${auxiliary} ${verbBase}`;
        } else if (pattern.verbType === 'thirdConditional') {
            verb = `would have ${verbBase}`;
        }

        // Generar frase usando el template (o lógica especial para Third Conditional)
        let phrase;
        if (pattern.name === 'Third Conditional') {
            const secondSubject = this.getSecondSubjectPronoun(subject);
            phrase = `If ${subject} had known, ${secondSubject} ${verb} ${object}${complement ? ' ' + complement : ''}.`;
        } else {
            phrase = pattern.template(subject, verb, object, complement);
        }

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
     * Obtiene el pronombre apropiado para el segundo sujeto en Third Conditional
     */
    getSecondSubjectPronoun(subject) {
        const subjectLower = subject.toLowerCase();
        if (subjectLower === 'i') return 'I';
        if (subjectLower === 'you') return 'you';
        if (['he', 'the cat', 'the dog', 'the teacher', 'the student', 'her brother', 'my friend'].some(s => 
            subjectLower.includes(s.toLowerCase()))) {
            return 'he';
        }
        if (subjectLower === 'she') return 'she';
        if (['we', 'our team'].some(s => subjectLower.includes(s.toLowerCase()))) return 'we';
        if (['they', 'their family'].some(s => subjectLower.includes(s.toLowerCase()))) return 'they';
        return 'they';
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




