const db = require('./db');
const path = require('path');

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
    verification_text: "Un buen investigador sabe que estas ideas iniciales casi siempre son...",
    verification_options: JSON.stringify([
      { id: "A", text: "Vagas y requieren analizarse para transformarse en planteamientos precisos." },
      { id: "B", text: "Perfectas y listas para publicarse." }
    ]),
    verification_answer: "A",
    rescue_text: "Imagina que ves una película sobre tecnología y te surge la duda de cómo afecta a tus amigos. ¿Esa curiosidad diaria puede ser el inicio formal de una investigación científica?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Sí" },
      { id: "B", text: "No" }
    ]),
    rescue_answer: "A"
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
    verification_text: "Que la investigación sea 'empírica' significa que...",
    verification_options: JSON.stringify([
      { id: "A", text: "Se basa en recolectar y analizar datos de la realidad observable." },
      { id: "B", text: "Se basa únicamente en creencias teóricas de libros." }
    ]),
    verification_answer: "A",
    rescue_text: "Para resolver un crimen complejo, ¿un detective confía ciegamente en corazonadas o sigue un 'sistema de reglas' paso a paso para recolectar evidencia empírica?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Corazonadas" },
      { id: "B", text: "Sigue un sistema" }
    ]),
    rescue_answer: "B"
  },
  {
    id: "q_1_3",
    phase: "Fase 1: Los Archivos de la Humanidad",
    type: "MAIN",
    text: "En la ciencia, tú eres el 'Sujeto' investigador. La porción de la realidad abstracta que vas a estudiar metódicamente se llama...",
    options: JSON.stringify([
      { id: "A", text: "El Objeto de investigación." },
      { id: "B", text: "La Conclusión del estudio." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - OBSERVACIÓN.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Y si de ese 'Objeto' general eliges una parte específica y delimitada donde harás tu intervención práctica, a eso se le llama...",
    verification_options: JSON.stringify([
      { id: "A", text: "Campo de acción." },
      { id: "B", text: "Hipótesis." }
    ]),
    verification_answer: "A",
    rescue_text: "En un caso de robo, tú eres el detective (Sujeto). La escena del crimen que está siendo analizada es el...",
    rescue_options: JSON.stringify([
      { id: "A", text: "Objeto de análisis" },
      { id: "B", text: "Sujeto" }
    ]),
    rescue_answer: "A"
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
    verification_text: "Los objetivos indican 'qué' pretendes (tu meta), mientras que las preguntas de investigación sirven para...",
    verification_options: JSON.stringify([
      { id: "A", text: "Resumir las respuestas concretas que el estudio debe encontrar." },
      { id: "B", text: "Mostrar los datos estadísticos." }
    ]),
    verification_answer: "A",
    rescue_text: "Si vas a construir una casa, antes de ver los resultados (la casa terminada), ¿qué es lo primero que le pides al arquitecto?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Los planos (Objetivos y preguntas)" },
      { id: "B", text: "El techo (Conclusiones)" }
    ]),
    rescue_answer: "A"
  },
  {
    id: "q_2_2",
    phase: "Fase 2: El Mapa del Detective",
    type: "MAIN",
    text: "Tu pregunta de investigación ('tu mapa') debe ser...",
    options: JSON.stringify([
      { id: "A", text: "Concreta, acotada y posible de responder con datos empíricos." },
      { id: "B", text: "Muy general y puramente filosófica." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - OBJETIVOS.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 10000,
    verification_text: "Para acotar correctamente una pregunta (ej. ¿cuál es el nivel de estrés?), es indispensable delimitar...",
    verification_options: JSON.stringify([
      { id: "A", text: "La muestra, el lugar y el tiempo (contexto)." },
      { id: "B", text: "El tipo de formato de impresión del documento." }
    ]),
    verification_answer: "A",
    rescue_text: "Si quieres saber qué música gusta hoy, ¿es más real preguntar a 'toda la juventud del planeta' o acotarlo a 'los alumnos de 1er semestre de tu facultad'?",
    rescue_options: JSON.stringify([
      { id: "A", text: "A todo el planeta" },
      { id: "B", text: "A los de mi facultad" }
    ]),
    rescue_answer: "B",
    rescue_image_filename: "Buhotech - MUESTREO.png"
  },
  {
    id: "q_2_3",
    phase: "Fase 2: El Mapa del Detective",
    type: "MAIN",
    text: "Antes de ir a recolectar datos, debes examinar qué han indagado otros científicos antes que tú y construir la teoría que guiará el estudio. Esto es el...",
    options: JSON.stringify([
      { id: "A", text: "Análisis estadístico general." },
      { id: "B", text: "Marco Teórico (Revisión de la literatura)." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - MARCO TEÓRICO.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "Si en esta revisión encuentras una teoría muy sólida que ya responde tu duda inicial, tu deber es...",
    verification_options: JSON.stringify([
      { id: "A", text: "Darle un nuevo enfoque o aplicarla a tu contexto para aportar algo novedoso." },
      { id: "B", text: "Copiar la teoría y presentarla como un descubrimiento nuevo." }
    ]),
    verification_answer: "A",
    rescue_text: "¿Intentarías resolver un caso policial sin antes leer los expedientes que dejaron otros detectives sobre sospechosos habituales?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Sí, improviso" },
      { id: "B", text: "No, reviso los antecedentes" }
    ]),
    rescue_answer: "B"
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
    image_filename: "Buhotech -  JUSTIFICACIÓN.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Uno de los criterios para evaluar si tu justificación es fuerte es la 'relevancia social', que indica...",
    verification_options: JSON.stringify([
      { id: "A", text: "Cuántos 'likes' tendrá el estudio." },
      { id: "B", text: "Quiénes se beneficiarán directamente con los resultados de la investigación." }
    ]),
    verification_answer: "B",
    verification_image_filename: "Buhotech - Etnografía.png",
    rescue_text: "Imagina que pides dinero a tus padres para un equipo. Te preguntan: '¿Y esto de qué va a servir?'. Al responderles, estás...",
    rescue_options: JSON.stringify([
      { id: "A", text: "Justificando tu proyecto" },
      { id: "B", text: "Evaluando tu viabilidad" }
    ]),
    rescue_answer: "A"
  },
  {
    id: "q_3_1",
    phase: "Fase 3: Las Lentes del Investigador",
    type: "MAIN",
    text: "El enfoque CUANTITATIVO asume que la realidad es objetiva y externa. En contraste, el enfoque CUALITATIVO asume que la realidad es...",
    options: JSON.stringify([
      { id: "A", text: "Única y estandarizada." },
      { id: "B", text: "Subjetiva, múltiple y construida por los participantes." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech -  ENFOQUE CUALITATIVO.png",
    min_reading_time_ms: 4000,
    expected_time_ms: 12000,
    verification_text: "En la ruta cuantitativa la posición del investigador debe ser 'imparcial y neutral'. ¿Cómo debe ser en la ruta cualitativa?",
    verification_options: JSON.stringify([
      { id: "A", text: "Neutral y distante." },
      { id: "B", text: "Explícita, reconociendo que sus propios valores y creencias interactúan en el estudio." }
    ]),
    verification_answer: "B",
    rescue_text: "La temperatura del agua es un dato frío y objetivo (Cuantitativo). Pero el sentimiento que te provoca una canción triste depende de quién la escuche, por tanto es...",
    rescue_options: JSON.stringify([
      { id: "A", text: "Objetivo" },
      { id: "B", text: "Subjetivo (Cualitativo)" }
    ]),
    rescue_answer: "B"
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
    image_filename: "Buhotech  -   Narrativo.png",
    min_reading_time_ms: 4000,
    expected_time_ms: 12000,
    verification_text: "Al ser un proceso deductivo y secuencial que busca probar hipótesis, el diseño de investigación cuantitativo debe ser...",
    verification_options: JSON.stringify([
      { id: "A", text: "Abierto y construido sobre la marcha." },
      { id: "B", text: "Estructurado y predeterminado antes de recolectar datos." }
    ]),
    verification_answer: "B",
    rescue_text: "Tienes una gran receta de pastel (Teoría General) y la usas para hornear tu pastel en casa (Dato particular). ¿Fuiste de lo general a lo particular o al revés?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Deducción" },
      { id: "B", text: "Inducción" }
    ]),
    rescue_answer: "A"
  },
  {
    id: "q_3_3",
    phase: "Fase 3: Las Lentes del Investigador",
    type: "MAIN",
    text: "Estás en una comunidad analizando sus vivencias sin ideas preconcebidas para eventualmente armar una teoría explicativa. Este camino (Cualitativo) usa la lógica...",
    options: JSON.stringify([
      { id: "A", text: "Deductiva." },
      { id: "B", text: "Inductiva." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech -  ESTADO DEL ARTE.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "Debido a su lógica inductiva, el proceso cualitativo es 'circular'. Esto significa que la revisión de la literatura, la recolección y el análisis de los datos ocurren...",
    verification_options: JSON.stringify([
      { id: "A", text: "De forma estrictamente separada." },
      { id: "B", text: "De manera simultánea, dinámica e iterativa." }
    ]),
    verification_answer: "B",
    rescue_text: "Eres un explorador sin mapa. Observas árbol por árbol (datos particulares) y poco a poco dibujas un mapa nuevo completo (teoría general). ¿Construyes de abajo hacia arriba?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Arriba a abajo" },
      { id: "B", text: "Abajo hacia arriba (Inducción)" }
    ]),
    rescue_answer: "B"
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
    verification_text: "Al concluir este estudio mixto, integrarás los descubrimientos numéricos y narrativos para formar inferencias conjuntas. A estas conclusiones híbridas se les llama...",
    verification_options: JSON.stringify([
      { id: "A", text: "Hipótesis nulas." },
      { id: "B", text: "Metainferencias." }
    ]),
    verification_answer: "B",
    rescue_text: "Si en tu informe juntas gráficas matemáticas (Cuan) con entrevistas en video (Cual) para tener una fotografía más amplia, ¿estás mezclando métodos?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Sí, es Mixto" },
      { id: "B", text: "No, es experimental" }
    ]),
    rescue_answer: "A"
  },
  {
    id: "q_4_1",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Al afirmar tentativamente que 'El método gamificado incrementará las calificaciones', estás planteando una explicación provisional. A esto se le conoce como...",
    options: JSON.stringify([
      { id: "A", text: "Conclusión final." },
      { id: "B", text: "Hipótesis de investigación." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - Hipótesis.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Y a la proposición exacta que sirve para negar o refutar tu hipótesis de investigación (ej. 'El método NO incrementará las calificaciones') se le llama...",
    verification_options: JSON.stringify([
      { id: "A", text: "Hipótesis Nula." },
      { id: "B", text: "Hipótesis Descriptiva." }
    ]),
    verification_answer: "A",
    verification_image_filename: "Buhotech - PRUEBAS DE HIPÓTESIS.png",
    rescue_text: "Si antes de un partido dices: 'Creo que el equipo azul ganará 3-0', ¿es un hecho 100% comprobado (Conclusión) o una suposición educada que falta confirmar?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Hecho comprobado" },
      { id: "B", text: "Suposición/Hipótesis" }
    ]),
    rescue_answer: "B"
  },
  {
    id: "q_4_2",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Vas a probar tu hipótesis. Si decides aplicar 'intencionalmente' un tratamiento a un grupo para ver qué efecto tiene, estás usando un diseño...",
    options: JSON.stringify([
      { id: "A", text: "No experimental." },
      { id: "B", text: "Experimental puro." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech - EXPERIMENTACIÓN.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "Para que un experimento controle la 'validez interna', ¿qué requieres como mínimo además del grupo que recibe el tratamiento?",
    verification_options: JSON.stringify([
      { id: "A", text: "Un Grupo de Control o Testigo (que no recibe el estímulo)." },
      { id: "B", text: "Aplicar la prueba a todos los habitantes del país." }
    ]),
    verification_answer: "A",
    verification_image_filename: "Buhotech - INVESTIGACIÓN CUASIEXPERIMENTAL.png",
    rescue_text: "Si inyectas un químico en una planta para acelerar su crecimiento en lugar de solo mirarla, ¿estás observando pasivamente o interviniendo (experimentando)?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Observando" },
      { id: "B", text: "Experimentando" }
    ]),
    rescue_answer: "B"
  },
  {
    id: "q_4_3",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Por el contrario, si decides estudiar el comportamiento de los clientes recolectando encuestas sin alterar su entorno, tu diseño es...",
    options: JSON.stringify([
      { id: "A", text: "Experimental." },
      { id: "B", text: "No experimental (Observacional)." }
    ]),
    correct_answer: "B",
    image_filename: "Buhotech -  DISEÑO DE LA INVESTIGACIÓN.png",
    min_reading_time_ms: 3000,
    expected_time_ms: 9000,
    verification_text: "Si en este estudio no experimental vas y aplicas las encuestas en un único momento en el tiempo, a tu diseño se le clasifica como...",
    verification_options: JSON.stringify([
      { id: "A", text: "Transeccional (o Transversal)." },
      { id: "B", text: "Longitudinal." }
    ]),
    verification_answer: "A",
    verification_image_filename: "Buhotech - INVESTIGACIÓN TRANSVERSAL 2.png",
    rescue_text: "Mirar las estrellas con un telescopio sin poder tocarlas ni modificar cómo brillan, ¿es hacer un experimento con ellas o una simple observación sistemática?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Experimento" },
      { id: "B", text: "Observación" }
    ]),
    rescue_answer: "B"
  },
  {
    id: "q_4_4",
    phase: "Fase 4: La Sospecha y el Campo",
    type: "MAIN",
    text: "Ya en el campo Cuantitativo, debes encuestar a 500 personas y codificar las respuestas rápidamente para aplicar estadística. ¿Qué instrumento usarás?",
    options: JSON.stringify([
      { id: "A", text: "Cuestionario con preguntas cerradas precodificadas." },
      { id: "B", text: "Cuestionario de respuestas abiertas infinitas." }
    ]),
    correct_answer: "A",
    image_filename: "Buhotech - VACIADO DE DATOS.png",
    min_reading_time_ms: 3500,
    expected_time_ms: 10000,
    verification_text: "En cambio, si estuvieras en la ruta Cualitativa y quisieras profundidad narrativa y conocer las palabras textuales de 10 personas, utilizarías...",
    verification_options: JSON.stringify([
      { id: "A", text: "Escalas Likert estructuradas." },
      { id: "B", text: "Entrevistas con preguntas abiertas y no directivas." }
    ]),
    verification_answer: "B",
    verification_image_filename: "Buhotech - Etnografía.png",
    rescue_text: "Para un sistema que procesará 500 exámenes automáticamente, ¿qué es más rápido de capturar matemáticamente: ensayos libres o selección múltiple (A, B, C)?",
    rescue_options: JSON.stringify([
      { id: "A", text: "Ensayo" },
      { id: "B", text: "Selección Múltiple (Cerrada)" }
    ]),
    rescue_answer: "B"
  },
  {
    id: "q_5_1",
    phase: "Fase 5: El Jefe Final",
    type: "RAPID",
    text: "¿La investigación cuantitativa utiliza la lógica deductiva (de la teoría a los datos)?",
    options: JSON.stringify([
      { id: "A", text: "VERDADERO" },
      { id: "B", text: "FALSO" }
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

// Ensure the dynamic image columns exist
try {
  db.exec('ALTER TABLE questions ADD COLUMN verification_image_filename TEXT;');
  db.exec('ALTER TABLE questions ADD COLUMN rescue_image_filename TEXT;');
} catch (e) {
  // Ignore if columns already exist
}

const insert = db.prepare(`
  INSERT OR IGNORE INTO questions 
  (id, phase, type, text, options, correct_answer, image_filename, min_reading_time_ms, expected_time_ms, verification_text, verification_options, verification_answer, verification_image_filename, rescue_text, rescue_options, rescue_answer, rescue_image_filename)
  VALUES (@id, @phase, @type, @text, @options, @correct_answer, @image_filename, @min_reading_time_ms, @expected_time_ms, @verification_text, @verification_options, @verification_answer, @verification_image_filename, @rescue_text, @rescue_options, @rescue_answer, @rescue_image_filename)
`);

const insertMany = db.transaction((qs) => {
  for (const q of qs) {
    insert.run({
      ...q,
      verification_options: q.verification_options || null,
      verification_answer: q.verification_answer || null,
      rescue_options: q.rescue_options || null,
      rescue_answer: q.rescue_answer || null,
      verification_image_filename: q.verification_image_filename || null,
      rescue_image_filename: q.rescue_image_filename || null,
    });
  }
});

// Clear table before reseeding
db.exec("DELETE FROM user_responses");
db.exec("DELETE FROM questions");

insertMany(questions);
console.log("Database seeded with NEW detailed branching questions!");
