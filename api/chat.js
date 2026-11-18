const { MODEL, SYSTEM_PROMPT, MODES, gemini, guard } = require("../lib/gemini");

module.exports = async (req, res) => {
  try {
    if (guard(req, res)) return;
    const { messages = [], mode = "chat", language = "English", attachments = [] } = req.body || {};
    if (!Array.isArray(messages) || !messages.length) return res.status(400).json({ error: "No messages" });

    const contents = messages.slice(-20).map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: String(m.content || "").slice(0, 12000) }],
    }));

    const last = contents[contents.length - 1];
    if (last.role === "user") {
      for (const a of (attachments || []).slice(0, 4)) {
        if (a && a.data && /^(image\/(png|jpeg|webp)|application\/pdf)$/.test(a.mimeType)) {
          last.parts.push({ inlineData: { mimeType: a.mimeType, data: a.data } });
        }
      }
    }

    const lang = ["English", "Hindi", "Hinglish"].includes(language) ? language : "English";
    const sys = [SYSTEM_PROMPT, MODES[mode] || "", `Respond in: ${lang}.`].join("\n\n");
    const data = await gemini(MODEL(), {
      systemInstruction: { parts: [{ text: sys }] },
      contents,
      generationConfig: { temperature: 0.4 },
    });
    const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || "").join("");
    res.status(200).json({ reply: text || "Sorry, I could not generate an answer. Please try again." });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message || "Server error" });
  }
};
