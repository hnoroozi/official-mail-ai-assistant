
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { currentDraft, instruction } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });

    const prompt = `Refine this draft following the instruction: "${instruction}".
      Current Draft:
      ---
      ${currentDraft}
      ---
      Return only the refined text, no preamble.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refinedText: response.text })
    };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
