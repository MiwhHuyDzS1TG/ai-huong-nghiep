export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  let body;
  try {
    body = req.body;
  } catch {
    return res.status(400).json({ error: "Invalid body" });
  }

  const prompt = body?.prompt;
  if (!prompt) {
    return res.status(400).json({ error: "Prompt missing" });
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
          { parts: [{ text: prompt.slice(0, 4000) }] }
        ]
      })
    }
  );

  const data = await response.json();

  const text =
    data?.candidates?.[0]?.content?.parts
      ?.map(p => p.text)
      .filter(Boolean)
      .join("\n");

  return res.status(200).json({
    text: text || "⚠️ Gemini không trả nội dung"
  });
}
