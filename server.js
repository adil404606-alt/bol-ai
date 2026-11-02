import express from "express";
import Groq from "groq-sdk";

const app = express();
app.use(express.json({ limit: "10kb" }));
app.use(express.static("public"));

const PORT = process.env.PORT || 3000;
const groq = process.env.GROQ_API_KEY
  ? new Groq({ apiKey: process.env.GROQ_API_KEY })
  : null;

app.post("/api/translate", async (req, res) => {
  try {
    const text = typeof req.body?.text === "string" ? req.body.text.trim() : "";
    if (!text) return res.status(400).json({ error: "Please enter some English text." });
    if (text.length > 500) return res.status(400).json({ error: "Please keep your text under 500 characters." });
    if (!groq) return res.status(503).json({ error: "Server is not configured yet. Add GROQ_API_KEY in your hosting settings." });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0.2,
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content: "You are Bol, an accurate English-to-Hinglish translator. Translate the user's English text into natural, conversational Hinglish written in Latin/Roman letters. Preserve meaning, tone, names, numbers, and emojis. Do not explain the translation. Return only the translated text."
        },
        { role: "user", content: text }
      ]
    });

    const translation = completion.choices?.[0]?.message?.content?.trim();
    if (!translation) return res.status(502).json({ error: "The translation service returned an empty response. Please try again." });
    res.json({ translation });
  } catch (error) {
    console.error("Translation error:", error?.message || error);
    res.status(500).json({ error: "Translation failed. Please try again in a moment." });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));
app.listen(PORT, () => console.log(`Bol is running on port ${PORT}`));
