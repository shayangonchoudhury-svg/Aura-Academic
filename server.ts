import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

// Safe client accessor to prevent crash if key is missing
let aiClient: GoogleGenAI | null = null;
function getGeminiClient() {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not defined in the environment. Please configure it in your Secrets.");
    }
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return aiClient;
}

// API Route for health-check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", time: new Date().toISOString() });
});

// API Route for AI note highlights
app.post("/api/ai-highlights", async (req, res) => {
  try {
    const { noteContent, noteTitle } = req.body;
    if (!noteContent) {
      return res.status(400).json({ error: "Note content is required" });
    }

    // Check if API key is configured
    if (!process.env.GEMINI_API_KEY) {
      return res.status(503).json({
        error: "GEMINI_API_KEY is missing. Please add it via Settings > Secrets.",
        isConfigError: true
      });
    }

    const client = getGeminiClient();
    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: `Analyze the following academic note titled "${noteTitle || 'Untitled'}" and extract structured highlights.
Return the output as a clean JSON object with the following schema:
{
  "summary": "A brief 2-3 sentence overview of the core topic",
  "keyTakeaways": ["Takeaway 1", "Takeaway 2", "Takeaway 3"],
  "coreConcepts": [{"name": "Concept name", "explanation": "Brief explanation"}, {"name": "Concept name 2", "explanation": "Brief explanation 2"}],
  "actionItems": ["Action item 1", "Action item 2"]
}

Note Content:
${noteContent}`,
      config: {
        responseMimeType: "application/json",
        systemInstruction: "You are an elite academic mentor and study assistant. Your goal is to analyze study notes and extract highly actionable takeaways, core concepts with explanations, and clear next-step action items."
      }
    });

    const text = response.text;
    if (!text) {
      throw new Error("Empty response from Gemini");
    }
    res.json(JSON.parse(text));
  } catch (error: any) {
    console.error("Error generating AI highlights:", error);
    res.status(500).json({ error: error.message || "Failed to generate AI highlights" });
  }
});

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
