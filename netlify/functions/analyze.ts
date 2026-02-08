
import { GoogleGenAI, Type } from "@google/genai";

export const handler = async (event: any) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: "Method Not Allowed" };
  }

  try {
    const { images, targetLanguage } = JSON.parse(event.body);
    const apiKey = process.env.API_KEY;

    if (!apiKey) {
      return { 
        statusCode: 500, 
        body: JSON.stringify({ error: "API_KEY is missing." }) 
      };
    }

    const ai = new GoogleGenAI({ apiKey });
    const imageToAnalyze = images[0];

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: imageToAnalyze.includes('base64,') ? imageToAnalyze.split(',')[1] : imageToAnalyze
            }
          },
          { text: `Analyze this document. Provide all explanations and content in ${targetLanguage}.` }
        ]
      },
      config: {
        systemInstruction: `You are an expert document analyst and legal-to-plain-language translator.
        Your task is to analyze the provided official letter and convert it into a structured JSON format that is easy for a non-expert to understand.
        
        Language Requirement: Every text field in the JSON (except for technical IDs or categories) MUST be in ${targetLanguage}.
        
        Extract the following:
        1. title: A clear, short descriptive title for the document.
        2. category: One of (Tax, Insurance, Banking, Government, Health, Other).
        3. confidence_score: An integer (0-100) reflecting your extraction certainty.
        4. summary_paragraph: A 2-3 sentence clear explanation of the letter's core purpose.
        5. summary_bullets: 3-5 key points the user needs to know.
        6. urgency: { level: (Low, Medium, High), reasons: Array of strings explaining why }.
        7. deadlines: Array of objects { date: string, description: string }.
        8. actions: Array of objects { task: string, completed: boolean (default false) }.
        9. consequences_if_ignored: A warning of what happens if the user does nothing.
        10. questions_to_ask_office: 3 helpful questions the user could ask if they call.
        11. extracted_fields: { amounts: string[], dates: string[], reference_numbers: string[], organizations: string[] }.
        12. suggested_replies: 2-3 templates for emails or formal replies based on this document.
        
        Be precise and empathetic. Focus on clarity over jargon.`,
        temperature: 0.1,
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            confidence_score: { type: Type.INTEGER },
            summary_paragraph: { type: Type.STRING },
            summary_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
            urgency: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING },
                reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["level"]
            },
            deadlines: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  date: { type: Type.STRING },
                  description: { type: Type.STRING }
                }
              }
            },
            actions: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  task: { type: Type.STRING },
                  completed: { type: Type.BOOLEAN }
                }
              }
            },
            consequences_if_ignored: { type: Type.STRING },
            questions_to_ask_office: { type: Type.ARRAY, items: { type: Type.STRING } },
            extracted_fields: {
              type: Type.OBJECT,
              properties: {
                amounts: { type: Type.ARRAY, items: { type: Type.STRING } },
                organizations: { type: Type.ARRAY, items: { type: Type.STRING } },
                reference_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
                dates: { type: Type.ARRAY, items: { type: Type.STRING } }
              }
            },
            suggested_replies: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  label: { type: Type.STRING },
                  subject: { type: Type.STRING },
                  body: { type: Type.STRING }
                }
              }
            }
          },
          required: ["title", "category", "summary_paragraph", "urgency", "actions"]
        }
      }
    });

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: response.text
    };
  } catch (error: any) {
    console.error("Analysis Error:", error);
    return {
      statusCode: 500,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ error: "Analysis failed. Please try again with a clearer image." })
    };
  }
};
