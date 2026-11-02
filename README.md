# Bol — Groq-powered English to Hinglish

## Deploy on Render (free web service tier, subject to Render's free-tier limits)

1. Upload these project files to a GitHub repository.
2. In Render, create a **New Web Service** and connect that repository.
3. Render detects Node. Use build command `npm install` and start command `npm start`.
4. In Render's Environment settings add:
   - `GROQ_API_KEY` = your private Groq API key
   - `GROQ_MODEL` = `openai/gpt-oss-20b`
5. Deploy. Open the `onrender.com` URL Render gives you.

Never put the API key in `public/index.html`, GitHub files, or a screenshot.
The Groq API free tier has usage limits; hosting free services may sleep when idle.
