
import { GoogleGenAI } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") return { statusCode: 405, body: "Method Not Allowed" };

  try {
    const { message, history, context, language } = JSON.parse(event.body);
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || "" });
    
    const systemInstruction = `You are a helpful assistant specialized in explaining official letters.
      The user is looking at a letter titled "${context.title}" in the category "${context.category}".
      User's native language is ${language}. Respond in ${language}.
      Base your answers ONLY on the provided letter context: ${JSON.stringify(context)}.
      If asked something outside the context of the letter, politely bring it back to the letter's content.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        ...history,
        { role: 'user', parts: [{ text: message }] }
      ],
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: response.text })
    };
  } catch (error: any) {
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
