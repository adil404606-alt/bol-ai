
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

    if (!text) return res.status(400).json({ error: "Please enter some text." });
    if (text.length > 500) return res.status(400).json({ error: "Please keep your text under 500 characters." });
    if (!groq) return res.status(503).json({ error: "Translation service is not configured." });

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0.3,
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are Bol, a highly skilled English-to-Hinglish translator.

YOUR JOB:
Translate English into natural, fluent, everyday Indian Hinglish.

IMPORTANT RULES:
1. Understand the meaning and context, never translate word by word.
2. Write Hinglish using Roman letters, not Devanagari script.
3. Use natural Indian conversational expressions.
4. Preserve the original meaning, emotion, tone and intention.
5. Use correct Hindi grammar and sentence structure.
6. Handle phrases, idioms, slang and romantic expressions naturally.
7. Never produce awkward literal translations.
8. Do not add information that is not in the original sentence.
9. Preserve names, numbers and emojis.
10. If the speaker's gender is unknown, prefer natural gender-neutral wording wherever possible. Do not guess gender unnecessarily.
11. Keep questions as questions and statements as statements.
12. Return ONLY the translated Hinglish sentence. Never explain your translation.

EXAMPLES:

English: I miss you, but I don't know how to tell you.
Hinglish: Mujhe tumhari yaad aa rahi hai, lekin mujhe nahi pata ki tumhe kaise bataun.

English: What are you doing?
Hinglish: Tum kya kar rahe ho?

English: I am feeling very tired today.
Hinglish: Aaj main bahut thaka hua mehsoos kar raha hoon.

English: I love you so much.
Hinglish: Main tumse bahut pyaar karta hoon.

English: Don't worry, everything will be fine.
Hinglish: Pareshan mat ho, sab theek ho jayega.

Now translate the user's text naturally.`
        },
        { role: "user", content: text }
      ]
    });

    const translation = completion.choices?.[0]?.message?.content?.trim();

    if (!translation) {
      return res.status(502).json({ error: "Empty translation. Please try again." });
    }

    res.json({ translation });
  } catch (error) {
    console.error("Translation error:", error?.message || error);
    res.status(500).json({ error: "Translation failed. Please try again." });
  }
});

app.get("/health", (_req, res) => res.json({ ok: true }));

app.listen(PORT, () => console.log(`Bol is running on port ${PORT}`));
