
import { GoogleGenAI, Type, Modality } from "@google/genai";
import { LetterAnalysis, SupportedLanguage } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const analyzeLetter = async (imageBase64s: string[], targetLanguage: SupportedLanguage = 'English'): Promise<LetterAnalysis> => {
  const needsTranslation = targetLanguage !== 'English';
  
  const prompt = `Analyze this official letter. Explain it in plain, simple language for a newcomer.
    Identify the category (Tax, Bank, Insurance, HR, School, Utilities, etc.).
    Extract all deadlines, actionable next steps, and specific details like amounts or reference numbers.
    Provide 2 context-aware response templates.
    Estimate your confidence in the text extraction (0-100).
    Generate 3 specific questions the user should ask the office or agency if they call them.
    ${needsTranslation ? `IMPORTANT: Also provide a translation of the summary_paragraph, summary_bullets, and actions into ${targetLanguage} in the 'translation' field.` : ''}
    Be factual. If text is unreadable, label it [UNCLEAR]. Do not invent information.
    Return the response as a valid JSON object matching the requested schema.`;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: [
        {
          parts: [
            ...imageBase64s.map(base64 => ({
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
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            category: { type: Type.STRING },
            confidence_score: { type: Type.NUMBER },
            summary_paragraph: { type: Type.STRING },
            summary_bullets: { 
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            urgency: {
              type: Type.OBJECT,
              properties: {
                level: { type: Type.STRING },
                reasons: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ['level', 'reasons']
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
                dates: { type: Type.ARRAY, items: { type: Type.STRING } },
                reference_numbers: { type: Type.ARRAY, items: { type: Type.STRING } },
                organizations: { type: Type.ARRAY, items: { type: Type.STRING } }
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
                },
                required: ['label', 'subject', 'body']
              }
            },
            translation: {
              type: Type.OBJECT,
              properties: {
                summary_paragraph: { type: Type.STRING },
                summary_bullets: { type: Type.ARRAY, items: { type: Type.STRING } },
                actions: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      task: { type: Type.STRING },
                      completed: { type: Type.BOOLEAN }
                    }
                  }
                }
              }
            }
          },
          required: [
            'title', 'category', 'confidence_score', 'summary_paragraph', 'summary_bullets', 
            'urgency', 'deadlines', 'actions', 'consequences_if_ignored', 'questions_to_ask_office', 'extracted_fields', 'suggested_replies'
          ]
        }
      }
    });

    let jsonStr = response.text || "";
    if (jsonStr.includes('```')) {
      jsonStr = jsonStr.replace(/```json\n?/, '').replace(/```\n?/, '').trim();
    }
    if (!jsonStr) throw new Error("Empty response from AI");
    return JSON.parse(jsonStr) as LetterAnalysis;
  } catch (error) {
    console.error("Analysis failed:", error);
    throw error;
  }
};

export const refineDraft = async (currentDraft: string, instruction: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Refine this letter draft. Instruction: ${instruction}\n\nCurrent Draft:\n${currentDraft}`,
    config: {
      systemInstruction: 'You are a helpful administrative assistant. Only return the refined text of the letter, no chatter.'
    }
  });
  return response.text || currentDraft;
};

export const generateSpeech = async (text: string): Promise<string> => {
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: `Read this summary clearly and professionally: ${text}` }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) throw new Error("Failed to generate speech");
  return base64Audio;
};

export const createLetterChat = (analysis: LetterAnalysis, language: SupportedLanguage = 'English') => {
  const context = `
    Letter Context:
    Title: ${analysis.title}
    Category: ${analysis.category}
    Summary: ${analysis.summary_paragraph}
    Actions: ${analysis.actions.map(a => a.task).join(', ')}
    Deadlines: ${analysis.deadlines.map(d => `${d.date}: ${d.description}`).join(', ')}
  `;

  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are an expert official letter assistant. You only answer questions about the specific letter provided in the context. 
      Context: ${context}
      
      IMPORTANT: The user's preferred language is ${language}. You MUST respond and converse in ${language}. 
      If the user asks in English but ${language} is selected, still respond in ${language} but acknowledge you understand.
      
      Guidelines:
      1. Be helpful, professional, and clear.
      2. If the user asks something NOT in the letter, say you can only discuss this document.
      3. Use simple language suitable for newcomers.
      4. Keep answers concise.`,
    },
  });
};
