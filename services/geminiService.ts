
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterAnalysis, SupportedLanguage } from "../types.ts";

/**
 * Direct Client-Side Gemini Integration
 * Optimized for maximum speed by bypassing serverless function cold starts.
 */

// Use the recommended model for complex reasoning and analysis
const ANALYSIS_MODEL = 'gemini-3-pro-preview';
const SPEECH_MODEL = 'gemini-2.5-flash-preview-tts';

export const analyzeLetter = async (imageBase64s: string[], targetLanguage: SupportedLanguage = 'English'): Promise<LetterAnalysis> => {
  try {
    // Initializing Gemini with process.env.API_KEY directly as per guidelines
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const imageToAnalyze = imageBase64s[0];
    
    // Ensure base64 is clean
    const base64Data = imageToAnalyze.includes('base64,') 
      ? imageToAnalyze.split(',')[1] 
      : imageToAnalyze;

    const response = await ai.models.generateContent({
      model: ANALYSIS_MODEL,
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          { text: `Analyze this document. The user speaks ${targetLanguage}. Return a detailed analysis in ${targetLanguage}.` }
        ]
      },
      config: {
        systemInstruction: `You are an expert document analyst. Extract all details accurately into JSON.
        CRITICAL: All text content MUST be in ${targetLanguage}.
        Schema:
        - title: Short descriptive name.
        - category: One of (Tax, Insurance, Banking, Government, Health, Other).
        - summary_paragraph: Clear 2-3 sentence overview.
        - summary_bullets: List of 3-5 key points.
        - urgency: {level: High/Medium/Low, reasons: string[]}.
        - deadlines: {date, description}[].
        - actions: {task, completed: boolean}[].
        - extracted_fields: {amounts: string[], organizations: string[], reference_numbers: string[], dates: string[]}.
        - suggested_replies: {label, subject, body}[].`,
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

    if (!response.text) throw new Error("EMPTY_AI_RESPONSE");
    return JSON.parse(response.text);
  } catch (error: any) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};

export const createLetterChat = (analysis: LetterAnalysis, language: SupportedLanguage = 'English') => {
  // Creating a new Gemini instance for the chat session right before usage
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const chat = ai.chats.create({
    model: ANALYSIS_MODEL,
    config: {
      systemInstruction: `Assistant for letter "${analysis.title}". Language: ${language}. Context: ${JSON.stringify(analysis)}`,
      temperature: 0.7,
    },
  });

  return {
    sendMessage: async ({ message }: { message: string }) => {
      const result = await chat.sendMessage({ message });
      // Accessing text as a property on the response
      return { text: result.text };
    }
  };
};

export const refineDraft = async (currentDraft: string, instruction: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: ANALYSIS_MODEL,
    contents: `Refine this letter draft. Instruction: ${instruction}. Draft: ${currentDraft}. Return only refined text.`,
  });
  return response.text || currentDraft;
};

export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: SPEECH_MODEL,
    contents: [{ parts: [{ text: `Read clearly: ${text}` }] }],
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
  if (!audioData) throw new Error("TTS_FAILED");
  return audioData;
};
