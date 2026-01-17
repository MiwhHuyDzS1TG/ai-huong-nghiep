export default async function handler(req, res) {
  console.log("=== GEMINI FUNCTION HIT ===");

  if (req.method !== "POST") {
    console.log("❌ Method:", req.method);
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = typeof req.body === "string" ? JSON.parse(req.body) : req.body;
  } catch (e) {
    console.log("❌ BODY PARSE FAIL:", e);
    return res.status(400).json({ error: "Body parse failed" });
  }

  console.log("📥 BODY:", body);

  const prompt = body?.prompt;
  if (!prompt) {
    console.log("❌ PROMPT MISSING");
    return res.status(400).json({ error: "Prompt missing" });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  console.log("🔑 API KEY EXISTS:", !!apiKey);

  if (!apiKey) {
    return res.status(500).json({ error: "GEMINI_API_KEY not set" });
  }

  let response, text, data;

  try {
    response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt.slice(0, 4000) }] }]
        })
      }
    );
  } catch (e) {
    console.log("❌ FETCH TO GEMINI FAILED:", e);
    return res.status(500).json({ error: "Fetch to Gemini failed" });
  }

  console.log("🌐 Gemini HTTP status:", response.status);

  try {
    data = await response.json();
  } catch (e) {
    console.log("❌ JSON PARSE FAIL:", e);
    return res.status(500).json({ error: "Gemini JSON parse failed" });
  }

  console.log("📦 GEMINI RAW:", JSON.stringify(data));

  text =
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .filter(Boolean)
      .join("\n");

  console.log("📝 FINAL TEXT LENGTH:", text?.length);

  return res.status(200).json({
    text: text || null,
    raw: data
  });
}
