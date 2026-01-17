// /api/gemini.js
import { GoogleGenAI } from "@google/genai";

export default async function handler(req, res) {
  // Chỉ cho POST
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }

    // 🔑 LẤY API KEY TỪ ENV
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({
        error: "GEMINI_API_KEY is not set in environment variables"
      });
    }

    // 🚀 INIT SDK
    const ai = new GoogleGenAI({ apiKey });

    // 🤖 GỌI MODEL
    const result = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt
    });

    // 📤 TRẢ KẾT QUẢ
    return res.status(200).json({
      text: result.text || ""
    });

  } catch (err) {
    console.error("Gemini API error:", err);

    return res.status(500).json({
      error: "Gemini API failed",
      detail: err.message || String(err)
    });
  }
}
