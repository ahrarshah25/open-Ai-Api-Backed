// api/ai.js
import fetch from "node-fetch";

export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  // Preflight
  if (req.method === "OPTIONS") return res.status(204).end();

  const prompt =
    req.method === "POST"
      ? req.body.prompt
      : req.query.prompt || "Hello world";

  if (!prompt) return res.status(400).json({ error: "Missing prompt" });

  try {
    // Call your existing PHP API directly
    const phpUrl = `https://zappymods.ct.ws/api/ai.php?prompt=${encodeURIComponent(
      prompt
    )}`;
    const resp = await fetch(phpUrl);

    // Parse PHP response safely
    let data;
    try {
      data = await resp.json();
    } catch (err) {
      // If PHP returns invalid JSON
      return res.status(500).json({
        ok: false,
        output: "⚠️ PHP backend did not return valid JSON",
        raw: await resp.text(),
      });
    }

    // Map PHP field "answer" to output
    const text = data.answer || JSON.stringify(data);

    res.status(200).json({ ok: true, output: text });
  } catch (err) {
    console.error("Proxy API error:", err);
    res.status(500).json({ error: err.message });
  }
}
