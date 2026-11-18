// Shared Gemini helpers (CIVIL AI)
const API_KEY = () => process.env.GEMINI_API_KEY;
const MODEL = () => process.env.GEMINI_MODEL || "gemini-3.8-flash";
const IMAGE_MODEL = () => process.env.GEMINI_IMAGE_MODEL || "gemini-2.5-flash-image";

const SYSTEM_PROMPT = `You are "CIVIL AI", an AI-Based Civil Engineering Study Assistant for engineering students.

SCOPE (strict):
- Answer ONLY Civil Engineering topics: Structural Analysis, RCC/Steel Design, Concrete Technology, Soil Mechanics/Geotechnical, Foundation Engineering, Fluid Mechanics, Hydraulics, Hydrology, Irrigation, Environmental Engineering, Transportation/Highway Engineering, Surveying, Building Materials & Construction, Estimating & Costing, Construction Management, Engineering Mechanics, Strength of Materials, Earthquake Engineering, Remote Sensing/GIS (civil use), and civil projects.
- If the question is about another engineering branch (CSE, ECE, Mechanical, Electrical, etc.) or any unrelated subject (movies, politics, general coding, etc.), politely refuse in 1-2 lines, say you only help with Civil Engineering, and invite a civil question. Do not answer it even partially.
- If the user's photo/PDF is not about Civil Engineering, refuse the same way.
- Greetings and "what can you do" are fine.

STYLE:
- Accurate, structured, easy to understand. Use headings, bullet points, formulas, units.
- For numerical problems: Given -> Formula -> Step-by-step calculation -> Final answer with units.
- Mention the relevant IS code (e.g., IS 456, IS 800, IS 1893) when applicable, and say if you are unsure.
- Language: follow the requested language. "English" = simple English. "Hindi" = simple Hindi (Devanagari) keeping technical terms in English. "Hinglish" = Hindi written in Roman script.
- Never invent facts or PYQ questions with fake years. For Previous Year Questions, give typical/important exam questions by topic and say they are exam-pattern based, not exact copies.`;

const MODES = {
  chat: "",
  assignment: "MODE: Assignment Solver. Solve fully with detailed step-by-step explanation and final answers.",
  notes: "MODE: Notes Generator. Produce concise, well-organised exam-ready notes: definitions, key formulas, diagrams to draw (described), important points, common mistakes.",
  pyq: "MODE: Previous Year Questions. Give important/frequently asked exam-pattern questions for the topic with short model answers, marks distribution hints, and preparation tips.",
  project: "MODE: Project Assistant. Suggest civil engineering project ideas (with objective, methodology, materials/software, expected outcome) and guide step by step.",
  explain: "MODE: Smart Explanation. Explain the concept very simply with real-life analogies, first in simple English and then in simple Hindi.",
};

async function gemini(model, body) {
  // 3 tries: Google kabhi "high demand" (503/429) deta hai, thodi der baad chal jata hai
  let lastErr;
  for (let i = 0; i < 3; i++) {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json", "x-goog-api-key": API_KEY() },
        body: JSON.stringify(body),
      }
    );
    const data = await r.json();
    if (r.ok) return data;
    lastErr = new Error(data?.error?.message || "Gemini API error");
    if (r.status !== 503 && r.status !== 429) throw lastErr;
    await new Promise((ok) => setTimeout(ok, 1500 * (i + 1)));
  }
  throw lastErr;
}

// best-effort rate limit (per warm instance): 30 req/min per IP
const hits = new Map();
function limited(req) {
  const ip = String(req.headers["x-forwarded-for"] || "").split(",")[0].trim() || "unknown";
  const now = Date.now();
  const arr = (hits.get(ip) || []).filter((t) => now - t < 60000);
  arr.push(now);
  hits.set(ip, arr);
  return arr.length > 30;
}

// common guard for both endpoints; returns true if request was already answered
function guard(req, res) {
  if (req.method !== "POST") { res.status(405).json({ error: "Use POST" }); return true; }
  if (!API_KEY()) { res.status(500).json({ error: "GEMINI_API_KEY Vercel Environment Variables mein set nahi hai. README dekhein." }); return true; }
  if (limited(req)) { res.status(429).json({ error: "Too many requests. Ek minute ruk kar try karein." }); return true; }
  return false;
}

module.exports = { MODEL, IMAGE_MODEL, SYSTEM_PROMPT, MODES, gemini, guard };
