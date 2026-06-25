const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key as an environment variable (see "Set up your API key" above)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "INSERT_API_KEY_HERE");

async function generateQuestions(topic, count = 3) {
  if (!process.env.GEMINI_API_KEY) {
      console.warn("WARN: GEMINI_API_KEY environment variable is missing.");
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
Act as an expert professor in "Scientific Research Methodology" for university students.
Generate a JSON array containing ${count} questions about the topic: "${topic}".
Each question MUST follow this EXACT data structure to be saved in a SQLite database representing a gamified branching lesson (like Duolingo):

[
  {
    "id": "A unique ID string, e.g. q_gen_1",
    "phase": "Fase AI: ${topic}",
    "type": "MAIN",
    "text": "The text of the main question.",
    "options": [
      { "id": "A", "text": "Option A text" },
      { "id": "B", "text": "Option B text" }
    ],
    "correct_answer": "A or B (must match one of the options id)",
    "image_filename": "Buhotech - Conocimiento Científico.png",
    "min_reading_time_ms": 3000,
    "expected_time_ms": 10000,
    "verification_text": "If they answer correctly, provide a follow-up 'verification' context or small question here.",
    "verification_options": [
       { "id": "A", "text": "Correct extension" },
       { "id": "B", "text": "Incorrect misconception" }
    ],
    "verification_answer": "A or B",
    "rescue_text": "If they answered the main question wrong, provide a 'rescue' simpler question here.",
    "rescue_options": [
       { "id": "A", "text": "A clearer hint choice" },
       { "id": "B", "text": "Obviously wrong choice" }
    ],
    "rescue_answer": "A or B"
  }
]

Make the questions engaging, using short, practical examples (e.g., investigating a crime, building a house, observing nature).
Return ONLY the raw JSON array string. No markdown formatting (\`\`\`json) or extra text.
`;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean markdown if the AI includes it despite instructions
    text = text.replace(/```json/gi, '').replace(/```/gi, '').trim();
    
    return JSON.parse(text);
  } catch (err) {
    console.error("AI Generation Error: ", err);
    throw err;
  }
}

module.exports = { generateQuestions };
