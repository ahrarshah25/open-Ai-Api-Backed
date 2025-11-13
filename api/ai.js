import fetch from "node-fetch";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();

  // Get prompt
  let prompt =
    req.method === "POST" ? req.body.prompt : req.query.prompt;
  if (!prompt || !prompt.trim()) prompt = "Hello world"; // default

  try {
    const COHERE_KEY = process.env.COHERE_API_KEY;

    const resp = await fetch("https://api.cohere.ai/v1/chat", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${COHERE_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "command-r-plus-08-2024",
        messages: [{ role: "user", content: prompt.trim() }], // safe trim
        max_tokens: 150,
        temperature: 0.7,
      }),
    });

    const data = await resp.json();

    const text =
      data.choices?.[0]?.message?.content?.trim() ||
      JSON.stringify(data, null, 2);

    res.status(200).json({ ok: true, output: text });
  } catch (err) {
    console.error("Cohere API error:", err);
    res.status(500).json({ error: err.message });
  }
}
