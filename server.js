
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
    const text = typeof req.body?.text === "string"
      ? req.body.text.trim()
      : "";

    const recipient = ["myself", "someone"].includes(req.body?.recipient)
      ? req.body.recipient
      : "someone";

    const gender = ["male", "female", "neutral"].includes(req.body?.gender)
      ? req.body.gender
      : "neutral";

    if (!text) {
      return res.status(400).json({ error: "Please enter some text." });
    }

    if (text.length > 500) {
      return res.status(400).json({ error: "Please keep your text under 500 characters." });
    }

    if (!groq) {
      return res.status(503).json({ error: "Translation service is not configured." });
    }

    const recipientDescription =
      recipient === "myself"
        ? "The selected person is the user themselves."
        : "The selected person is someone receiving the message.";

    const genderDescription = {
      male: "The selected person's gender is male. Use masculine Hindi grammatical forms when referring to this person.",
      female: "The selected person's gender is female. Use feminine Hindi grammatical forms when referring to this person.",
      neutral: "Use natural gender-neutral wording wherever possible. Avoid unnecessary gender assumptions."
    }[gender];

    const completion = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "openai/gpt-oss-20b",
      temperature: 0.3,
      max_completion_tokens: 500,
      messages: [
        {
          role: "system",
          content: `You are Bol, an expert English-to-natural-Hinglish translator.

Translate English into fluent, everyday Indian Hinglish written in Roman letters.

RECIPIENT SETTINGS:
${recipientDescription}
${genderDescription}

IMPORTANT RULES:
1. Understand meaning and context. Never translate word by word.
2. Use natural Indian conversational Hindi-English.
3. Apply the selected gender to grammatical references to the selected person.
4. Do not assume the sender's gender from the recipient's gender.
5. If the sentence refers to the sender, do not change the sender's gender based on the recipient setting.
6. Preserve the original meaning, emotion, tone, names, numbers and emojis.
7. Use natural expressions and correct Hindi grammar.
8. Avoid awkward literal translations.
9. Use Roman letters, not Devanagari.
10. Return ONLY the translated text. Do not explain.

EXAMPLES:

English: What are you doing?
Male: Tum kya kar rahe ho?
Female: Tum kya kar rahi ho?
Neutral: Tum kya kar rahe/rahi ho?

English: I miss you, but I don't know how to tell you.
Hinglish: Mujhe tumhari yaad aa rahi hai, lekin mujhe nahi pata ki tumhe kaise bataun.

English: Are you coming tomorrow?
Male: Kya tum kal aa rahe ho?
Female: Kya tum kal aa rahi ho?

English: I love you so much.
Hinglish: Main tumse bahut pyaar karta/karti hoon.

Translate the user's text naturally using the selected recipient settings.`
        },
        {
          role: "user",
          content: text
        }
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

app.listen(PORT, () => {
  console.log(`Bol is running on port ${PORT}`);
});
