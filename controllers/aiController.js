const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });
const { TextServiceClient } = require("@google-ai/generativelanguage");

// Instantiate the client with your API key
const client = new TextServiceClient({
  apiKey: process.env.GEMINI_API_KEY
});

// Helper to call Gemini with a prompt
async function callGemini(prompt) {
  const res = await client.generateText({
    model: "models/chat-bison-001",
    prompt: { text: prompt }
  });

  // unwrap the candidate
  return res.data?.candidates?.[0]?.output || "";
}

exports.aiAssistant = async (req, res) => {
  const { question, productData } = req.body;
  if (!question || !productData) {
    return res.status(400).json({ error: "question and productData required" });
  }

  const prompt = `
You are a concise, friendly e-commerce assistant. Answer the user's question using only the information from the product below when possible. If the information is not present, say you don't know and suggest what the user can check.

Product JSON:
${JSON.stringify(productData, null, 2)}

User question:
${question}

Keep the answer short (1-3 sentences).
  `;

  try {
    const text = await callGemini(prompt);
    res.json({ answer: text.trim() });
  } catch (err) {
    console.error("Gemini ask error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
};

exports.suggestions = async (req, res) => {
  const { product } = req.body;
  if (!product) {
    return res.status(400).json({ error: "product required" });
  }

  const prompt = `
You are an e-commerce assistant. Given the product below, produce an array of 3 short, user-facing questions a shopper might ask about this item.
Return only a JSON array, e.g. ["Is this ...?", "Does it ...?", "How long ...?"].

Product:
${JSON.stringify(product, null, 2)}
  `;

  try {
    const raw = await callGemini(prompt);

    // Parse JSON array or fallback to line splitting
    let suggestions;
    try {
      suggestions = JSON.parse(raw);
      if (!Array.isArray(suggestions)) throw new Error("not array");
    } catch {
      suggestions = raw
        .split(/\r?\n/)
        .map(line => line.replace(/^[\-\d\.\)\s"]+/, "").trim())
        .filter(Boolean)
        .slice(0, 3);
    }

    res.json({ suggestions });
  } catch (err) {
    console.error("Gemini suggestions error:", err);
    res.status(500).json({ error: "AI request failed" });
  }
};
