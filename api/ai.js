// api/ai.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  const prompt =
    req.method === "POST"
      ? req.body.prompt
      : req.query.prompt || "Hello world";

  if (!prompt) {
    return res.status(400).json({ error: "Missing prompt" });
  }

  try {
    const COHERE_KEY = process.env.COHERE_API_KEY;

    const resp = await fetch("https://api.cohere.ai/v1/generate", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        // ✅ change model to "command"
        model: "command",
        prompt: prompt,
        max_tokens: 150,
        temperature: 0.7, // optional but helps get text
      }),
    });

    const data = await resp.json();

    // ✅ log for debugging (remove later)
    console.log("Cohere response:", data);

    const text =
      data.generations && data.generations.length > 0
        ? data.generations[0].text.trim()
        : JSON.stringify(data, null, 2); // fallback to show raw response

    res.status(200).json({ ok: true, output: text });
  } catch (err) {
    console.error("API error:", err);
    res.status(500).json({ error: err.message });
  }
}
