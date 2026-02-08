
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  // Only allow POST requests
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { images, targetLanguage } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return { statusCode: 500, body: JSON.stringify({ error: "API Key not configured in Netlify" }) };
    }

    const ai = new GoogleGenAI({ apiKey });
    const needsTranslation = targetLanguage !== 'English';

    const prompt = `Analyze this official letter. Explain it in plain, simple language for a newcomer.
      Identify the category (Tax, Bank, Insurance, HR, School, Utilities, etc.).
      Extract all deadlines, actionable next steps, and specific details like amounts or reference numbers.
      Provide 2 context-aware response templates.
      Estimate your confidence in the text extraction (0-100).
      Generate 3 specific questions the user should ask the office or agency if they call them.
      ${needsTranslation ? `IMPORTANT: Also provide a translation of the summary_paragraph, summary_bullets, and actions into ${targetLanguage} in the 'translation' field.` : ''}
      Be factual. Return the response as a valid JSON object.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            ...images.map((base64: string) => ({
              inlineData: {
                mimeType: 'image/jpeg',
                data: base64.split(',')[1] || base64
              }
            })),
            { text: prompt }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json'
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text
    };
  } catch (error: any) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message })
    };
  }
};
