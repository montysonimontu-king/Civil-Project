const { MODEL, IMAGE_MODEL, gemini, guard } = require("../lib/gemini");

module.exports = async (req, res) => {
  try {
    if (guard(req, res)) return;
    const prompt = String((req.body && req.body.prompt) || "").trim();
    if (!prompt) return res.status(400).json({ error: "Prompt required" });

    // Step 1: only Civil Engineering diagrams allowed
    const gate = await gemini(MODEL(), {
      contents: [{ role: "user", parts: [{ text: 'Is the following request asking for a diagram/illustration about Civil Engineering? Answer with exactly "YES" or "NO".\n\nRequest: ' + prompt.slice(0, 500) }] }],
      generationConfig: { temperature: 0 },
    });
    const verdict = (gate.candidates?.[0]?.content?.parts?.[0]?.text || "").trim().toUpperCase();
    if (!verdict.startsWith("YES"))
      return res.status(200).json({ reply: "Sorry, main sirf Civil Engineering se related diagrams bana sakta hoon. Koi civil topic batayein (jaise beam, retaining wall, foundation)." });

    // Step 2: generate
    const data = await gemini(IMAGE_MODEL(), {
      contents: [{ role: "user", parts: [{ text: `Create a clean, labelled educational Civil Engineering diagram on a white background: ${prompt.slice(0, 500)}` }] }],
    });
    const parts = data.candidates?.[0]?.content?.parts || [];
    const img = parts.find((p) => p.inlineData || p.inline_data);
    const d = img && (img.inlineData || img.inline_data);
    if (!d) return res.status(200).json({ reply: "Diagram generate nahi ho paya. Prompt thoda aur specific karke try karein." });
    res.status(200).json({ reply: "Yeh raha aapka diagram:", image: { mimeType: d.mimeType || d.mime_type, data: d.data } });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }
};
