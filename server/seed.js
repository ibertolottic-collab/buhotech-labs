const db = require('./db');

const questions = [
  {
    id: "q_1_1",
    phase: "Fase 1: Los Archivos de la Humanidad",
    type: "MAIN",
    text: "¿De dónde surgen los temas para iniciar una investigación en tu vida cotidiana como estudiante?",
    options: JSON.stringify([
      { id: "A", text: "De una inspiración mística exclusiva para genios." },
      { id: "B", text: "De experiencias individuales, observar el entorno, leer o charlar." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - HEURÍSTICA.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 10000,
    verification_text: "Un buen investigador sabe que estas ideas iniciales casi siempre son vagas y requieren analizarse para transformarse en planteamientos precisos.",
    rescue_text: "Imagina que ves una película sobre tecnología y te surge la duda de cómo afecta a tus amigos. Esa curiosidad diaria sí puede ser el inicio formal de una investigación."
  },
  {
    id: "q_1_2",
    phase: "Fase 1: Los Archivos de la Humanidad",
    type: "MAIN",
    text: "Para que tu idea cotidiana se transforme en conocimiento científico, el proceso de indagación debe ser...",
    options: JSON.stringify([
      { id: "A", text: "Rápido e intuitivo." },
      { id: "B", text: "Sistemático, empírico y crítico." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - Conocimiento Científico.png",
    min_reading_time_ms: 2500,
    expected_time_ms: 8000,
    verification_text: "Que la investigación sea 'empírica' significa que se basa en recolectar y analizar datos de la realidad observable.",
    rescue_text: "Para resolver un crimen complejo, un detective no confía ciegamente en corazonadas, sino que sigue un 'sistema de reglas' paso a paso para recolectar evidencia empírica."
  },
  {
    id: "q_2_1",
    phase: "Fase 2: El Mapa del Detective",
    type: "MAIN",
    text: "Para formalizar tu idea en un planteamiento del problema, debes formular los primeros dos elementos clave:",
    options: JSON.stringify([
      { id: "A", text: "Las Conclusiones y Resultados." },
      { id: "B", text: "Los Objetivos y las Preguntas de investigación." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - FORMULACIÓN DEL PROBLEMA.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "Los objetivos indican la meta a lograr, mientras que las preguntas organizan y delimitan estructuralmente el qué, por qué y cómo de tu estudio.",
    rescue_text: "Si vas a construir una casa, antes de ver los resultados (la casa terminada), ¿qué es lo primero que le pides al arquitecto? ¡Exacto! Los planos (Objetivos y preguntas)."
  },
  {
    id: "q_2_2",
    phase: "Fase 2: El Mapa del Detective",
    type: "MAIN",
    text: "Tu pregunta de investigación, la brújula de tu mapa, debe ser...",
    options: JSON.stringify([
      { id: "A", text: "Concreta, acotada y posible de responder con datos empíricos." },
      { id: "B", text: "Muy general y puramente filosófica." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - OBJETIVOS.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 10000,
    verification_text: "Toda pregunta debe estar delimitada en tiempo y espacio indicando de forma explícita el contexto y la muestra del estudio.",
    rescue_text: "Si quieres saber qué música gusta hoy, ¿es más real preguntar a 'toda la juventud del planeta' o acotarlo a 'los alumnos de 1er semestre'? ¡La segunda!"
  },
  {
    id: "q_2_3",
    phase: "Fase 2: El Mapa del Detective",
    type: "MAIN",
    text: "Antes de recolectar datos, debes examinar qué han indagado otros científicos antes que tú. Esto se conoce como...",
    options: JSON.stringify([
      { id: "A", text: "El Análisis estadístico general." },
      { id: "B", text: "El Marco Teórico o Revisión de la literatura." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - MARCO TEÓRICO.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "La ciencia busca construir sobre lo existente prestando atención a qué lagunas y discrepancias existen en tu objeto de estudio.",
    rescue_text: "¿Intentarías resolver un caso policial sin antes leer los expedientes que dejaron otros detectives sobre sospechosos habituales? ¡No, debes revisar el marco de antecedentes!"
  },
  {
    id: "q_3_1",
    phase: "Fase 3: Las Lentes del Investigador",
    type: "MAIN",
    text: "El enfoque CUANTITATIVO asume que la realidad es objetiva. En contraste, el enfoque CUALITATIVO asume que la realidad es...",
    options: JSON.stringify([
      { id: "A", text: "Única y estandarizada." },
      { id: "B", text: "Subjetiva, múltiple y construida por los participantes." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - Fenomenología.png",
    min_reading_time_ms: 4000,
    expected_time_ms: 12000,
    verification_text: "En la ruta cualitativa, la posición del investigador es explícita, reconociendo que sus propios valores interactúan en el estudio.",
    rescue_text: "La temperatura del agua es objetiva (Cuantitativo). Pero el sentimiento que te provoca una canción triste depende de quién la escuche, por tanto es Subjetivo (Cualitativo)."
  },
  {
    id: "q_3_2",
    phase: "Fase 3: Las Lentes del Investigador",
    type: "MAIN",
    text: "Si vas a probar una teoría previa midiendo datos estandarizados, tu proceso es Cuantitativo. ¿Qué lógica guía esta ruta?",
    options: JSON.stringify([
      { id: "A", text: "Deductiva (de lo general a lo particular)." },
      { id: "B", text: "Inductiva (de lo particular a lo general)." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech -  ENFOQUE CUANTITATIVO.png",
    min_reading_time_ms: 4000,
    expected_time_ms: 12000,
    verification_text: "Al ser un proceso deductivo que busca probar hipótesis, el diseño de investigación cuantitativo debe ser estructurado y predeterminado antes de recolectar datos.",
    rescue_text: "Tienes una gran receta de pastel (General) y la usas para hornear tu pastel en casa (Dato particular). Vas de lo general a lo particular (Deducción)."
  },
  {
    id: "q_4_1",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Al afirmar tentativamente que 'El método gamificado incrementará las calificaciones', estás planteando...",
    options: JSON.stringify([
      { id: "A", text: "La conclusión final de estudio empírico." },
      { id: "B", text: "Una Hipótesis de investigación." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - Hipótesis.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "A la proposición exacta que sirve para negar tu hipótesis (ej. 'La gamificación NO incrementará calificaciones') se le llama Hipótesis Nula.",
    rescue_text: "Si antes de un partido dices 'Creo que mi equipo ganará', estás usando una suposición o corazonada (Hipótesis) y no un hecho comprobado en piedra todavía."
  },
  {
    id: "q_4_2",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Vas a probar tu hipótesis. Si decides aplicar intencionalmente un tratamiento a un grupo para ver qué efecto tiene, estás usando un diseño...",
    options: JSON.stringify([
      { id: "A", text: "No experimental." },
      { id: "B", text: "Experimental puro." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - EXPERIMENTACIÓN.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "Para que un experimento controle la validez interna, requieres como mínimo un Grupo de Control (que NO recibe el estímulo) para contrastar.",
    rescue_text: "Si inyectas un químico en una planta para acelerar su crecimiento en lugar de solo mirarla, ¿estás observando pasivamente o interviniendo (experimentando)? ¡Experimentando!"
  },
  {
    id: "q_4_3",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Si decides estudiar el comportamiento de pacientes recolectando encuestas sin alterar su entorno, tu diseño es...",
    options: JSON.stringify([
      { id: "A", text: "Experimental." },
      { id: "B", text: "No experimental (Observacional)." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - OBSERVACIÓN.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Si en este estudio no experimental aplicas las encuestas en un único momento en el tiempo, a tu diseño se le clasifica como Transeccional.",
    rescue_text: "Mirar las estrellas con un telescopio sin poder tocarlas ni modificar cómo brillan, ¿es hacer un experimento con ellas o una simple observación sistemática? ¡Observación!"
  },
  {
    id: "q_4_4",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Ya en el campo Cuantitativo, debes encuestar a 500 personas y procesar las respuestas rápidamente para aplicar estadística. Úsaras un...",
    options: JSON.stringify([
      { id: "A", text: "Cuestionario con preguntas cerradas precodificadas." },
      { id: "B", text: "Cuestionario de respuestas abiertas infinitas." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - VACIADO DE DATOS.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "En cambio, si estuvieras en la ruta Cualitativa y quisieras profundidad narrativa de 10 personas, utilizarías entrevistas con preguntas abiertas.",
    rescue_text: "Para un sistema que procesará 500 exámenes automáticamente, es mucho más rápido capturar matemáticamente la selección múltiple (A, B, C) (Cerrada)."
  },
  {
    id: "q_1_3",
    phase: "Fase 1: Los Archivos de la Humanidad",
    type: "MAIN",
    text: "En la ciencia, tú eres el 'Sujeto' investigador. La porción de la realidad abstracta que vas a estudiar se llama...",
    options: JSON.stringify([
      { id: "A", text: "El Objeto de investigación." },
      { id: "B", text: "La Conclusión del estudio." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - OBSERVACIÓN.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Y si de ese 'Objeto' general eliges una parte específica y delimitada donde harás tu intervención práctica, se le llama Campo de Acción.",
    rescue_text: "En un caso de robo, tú eres el detective (Sujeto). La escena del crimen que está siendo analizada es el Objeto de análisis, no la conclusión."
  },
  {
    id: "q_2_4",
    phase: "Fase 2: El Mapa del Detective",
    type: "MAIN",
    text: "Para que te aprueben la investigación, debes exponer las razones del por qué y para qué es importante realizarla. A esto se le denomina...",
    options: JSON.stringify([
      { id: "A", text: "Justificación de la investigación." },
      { id: "B", text: "Viabilidad del estudio." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - JUSTIFICACIÓN.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Uno de los criterios para evaluar si tu justificación es fuerte es la relevancia social, que indica quiénes se beneficiarán directamente.",
    rescue_text: "Imagina que pides dinero a tus padres para un proyecto. Al responderles '¿Y esto de qué va a servir?', estás Justificando tu proyecto."
  },
  {
    id: "q_3_3",
    phase: "Fase 3: Las Lentes del Investigador",
    type: "MAIN",
    text: "Estás en una comunidad analizando sus vivencias sin ideas preconcebidas para eventualmente armar una teoría. Este camino Cualitativo usa la lógica...",
    options: JSON.stringify([
      { id: "A", text: "Deductiva." },
      { id: "B", text: "Inductiva." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - ENFOQUE CUALITATIVO.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "Debido a su lógica inductiva, el proceso cualitativo es circular: puedes recolectar y analizar datos de manera simultánea.",
    rescue_text: "Eres un explorador sin mapa. Observas árbol por árbol (particular) y poco a poco dibujas el mapa nuevo (general). Construyes de abajo hacia arriba (Inducción)."
  },
  {
    id: "q_3_4",
    phase: "Fase 3: Las Lentes del Investigador",
    type: "MAIN",
    text: "Cuentas daños económicos (números objetivos) y a la vez entrevistas a las familias para entender su duelo (narrativas subjetivas) en un solo estudio. Estás usando...",
    options: JSON.stringify([
      { id: "A", text: "La Ruta de los Métodos Mixtos." },
      { id: "B", text: "Un experimento." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - TRIANGULACIÓN.png",
    min_reading_time_ms: 4000,
    expected_time_ms: 12000,
    verification_text: "Al concluir este estudio mixto y unir descubrimientos numéricos y narrativos formas inferencias conjuntas llamadas Metainferencias.",
    rescue_text: "Si en tu informe juntas gráficas matemáticas (Cuan) con entrevistas (Cual) para tener una fotografía más amplia, ¡estás sumando o mezclando ambos métodos!"
  },
  {
    id: "q_5_1",
    phase: "Fase 5: El Jefe Final",
    type: "RAPID",
    text: "¿La investigación cuantitativa utiliza la lógica deductiva (de la teoría a los datos)?",
    options: JSON.stringify([
      { id: "A", text: "SÍ" },
      { id: "B", text: "NO" }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech -  ENFOQUE CUANTITATIVO.png",
    min_reading_time_ms: 1500,
    expected_time_ms: 5000,
    verification_text: "¡Correcto!",
    rescue_text: "¡Falso! Al ser secuencial, parte de la teoría general para recolectar datos."
  },
  {
    id: "q_5_2",
    phase: "Fase 5: El Jefe Final",
    type: "RAPID",
    text: "En la ruta Cualitativa, ¿las hipótesis se formulan estrictamente de forma inamovible antes de recolectar datos?",
    options: JSON.stringify([
      { id: "A", text: "VERDADERO" },
      { id: "B", text: "FALSO" }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - Hipótesis.png",
    min_reading_time_ms: 2000,
    expected_time_ms: 6000,
    verification_text: "¡Correcto!",
    rescue_text: "Son flexibles, surgen o se modifican durante el proceso."
  },
  {
    id: "q_5_3",
    phase: "Fase 5: El Jefe Final",
    type: "RAPID",
    text: "Que la ciencia sea 'empírica' denota que se recolectan y analizan datos reales.",
    options: JSON.stringify([
      { id: "A", text: "VERDADERO" },
      { id: "B", text: "FALSO" }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - Conocimiento Científico.png",
    min_reading_time_ms: 2000,
    expected_time_ms: 6000,
    verification_text: "¡Exacto! Requiere experimentación u observación de campo.",
    rescue_text: "Recuerda, la ciencia requiere basarse en la realidad observable."
  },
  {
    id: "q_5_4",
    phase: "Fase 5: El Jefe Final",
    type: "RAPID",
    text: "¿La ciencia nos asegura alcanzar una 'verdad absoluta' al finalizar las conclusiones?",
    options: JSON.stringify([
      { id: "A", text: "VERDADERO" },
      { id: "B", text: "FALSO" }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - CONCLUSIONES.png",
    min_reading_time_ms: 2000,
    expected_time_ms: 6000,
    verification_text: "¡Así es! Es siempre provisional y perfectible.",
    rescue_text: "La ciencia nunca es absoluta; el conocimiento está en constante construcción."
  },
  {
    id: "q_5_5",
    phase: "Fase 5: El Jefe Final",
    type: "RAPID",
    text: "La integración sistemática de datos numéricos y narrativos para comprender mejor un fenómeno se llama Ruta Mixta.",
    options: JSON.stringify([
      { id: "A", text: "VERDADERO" },
      { id: "B", text: "FALSO" }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - TRIANGULACIÓN.png",
    min_reading_time_ms: 2500,
    expected_time_ms: 7000,
    verification_text: "¡Perfecto! Combina lo mejor de CUAN y CUAL.",
    rescue_text: "Ruta Mixta = Cuantitativo + Cualitativo."
  }
];

const insert = db.prepare(`
  INSERT OR IGNORE INTO questions 
  (id, phase, type, text, options, correct_answer, image_filename, min_reading_time_ms, expected_time_ms, verification_text, rescue_text)
  VALUES (@id, @phase, @type, @text, @options, @correct_answer, @image_filename, @min_reading_time_ms, @expected_time_ms, @verification_text, @rescue_text)
`);

const insertMany = db.transaction((qs) => {
  for (const q of qs) insert.run(q);
});

insertMany(questions);
console.log("Database seeded with sample questions from the Docx analysis!");
