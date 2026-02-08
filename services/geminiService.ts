
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterAnalysis, SupportedLanguage } from "../types.ts";

/**
 * Direct Client-Side Gemini Integration
 * This is much faster than serverless functions as it avoids cold starts and network hops.
 */

const getAI = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLetter = async (imageBase64s: string[], targetLanguage: SupportedLanguage = 'English'): Promise<LetterAnalysis> => {
  const ai = getAI();
  const imageToAnalyze = imageBase64s[0];
  
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
      systemInstruction: `You are an expert document analyst. Extract details into structured JSON.
      Language: All text content MUST be in ${targetLanguage}.
      Fields: title, category, confidence_score, summary_paragraph, summary_bullets, urgency (level/reasons), deadlines (date/description), actions (task/completed), consequences_if_ignored, questions_to_ask_office, extracted_fields (amounts/dates/reference_numbers/organizations), suggested_replies.`,
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

  if (!response.text) throw new Error("No response from AI");
  return JSON.parse(response.text);
};

export const refineDraft = async (currentDraft: string, instruction: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine this draft following the instruction: "${instruction}".\nDraft: ${currentDraft}\nReturn only the refined text.`
  });
  return response.text || currentDraft;
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Say clearly: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  const audioData = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!audioData) throw new Error("Audio generation failed");
  return audioData;
};

export const createLetterChat = (analysis: LetterAnalysis, language: SupportedLanguage = 'English') => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a helpful assistant for the letter "${analysis.title}". User language: ${language}. Base answers ONLY on this context: ${JSON.stringify(analysis)}`,
      temperature: 0.7,
    },
  });

  return {
    sendMessage: async ({ message }: { message: string }) => {
      const result = await chat.sendMessage({ message });
      return { text: result.text };
    }
  };
};
