export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const body = typeof req.body === "string"
      ? JSON.parse(req.body)
      : req.body;

    const prompt = body?.prompt;
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt missing or invalid" });
    }

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY not set" });
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }]
            }
          ]
        })
      }
    );

    const data = await response.json();

    // 🔥 ÉP TEXT AN TOÀN
    const text =
      data?.candidates?.[0]?.content?.parts
        ?.map(p => p.text)
        .filter(Boolean)
        .join("\n");

    return res.status(200).json({
      text: text || "⚠️ AI không thể trả lời với dữ liệu hiện tại."
    });

  } catch (err) {
    console.error("Gemini function error:", err);
    return res.status(500).json({
      error: "Internal server error",
      detail: err.message || String(err)
    });
  }
}
