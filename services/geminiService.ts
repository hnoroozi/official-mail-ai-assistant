
import { LetterAnalysis, SupportedLanguage } from "../types.ts";

/**
 * All functions here call Netlify Serverless Functions to keep the API_KEY hidden.
 */

export const analyzeLetter = async (imageBase64s: string[], targetLanguage: SupportedLanguage = 'English'): Promise<LetterAnalysis> => {
  try {
    const response = await fetch('/.netlify/functions/analyze', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ images: imageBase64s, targetLanguage })
    });

    if (!response.ok) throw new Error(await response.text());
    return await response.json();
  } catch (error) {
    console.error("Secure Analysis failed:", error);
    throw error;
  }
};

export const refineDraft = async (currentDraft: string, instruction: string): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/refine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ currentDraft, instruction })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.refinedText;
  } catch (error) {
    console.error("Secure Refinement failed:", error);
    throw error;
  }
};

export const generateSpeech = async (text: string): Promise<string> => {
  try {
    const response = await fetch('/.netlify/functions/speech', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text })
    });

    if (!response.ok) throw new Error(await response.text());
    const data = await response.json();
    return data.audioData; // Base64 PCM
  } catch (error) {
    console.error("Secure TTS failed:", error);
    throw error;
  }
};

export const createLetterChat = (analysis: LetterAnalysis, language: SupportedLanguage = 'English') => {
  // Stateless chat session proxy
  const history: { role: 'user' | 'model'; parts: { text: string }[] }[] = [];

  return {
    sendMessage: async ({ message }: { message: string }) => {
      try {
        const response = await fetch('/.netlify/functions/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            history,
            context: analysis,
            language
          })
        });

        if (!response.ok) throw new Error(await response.text());
        const data = await response.json();
        
        // Update local history for the next turn
        history.push({ role: 'user', parts: [{ text: message }] });
        history.push({ role: 'model', parts: [{ text: data.text }] });
        
        return { text: data.text };
      } catch (error) {
        console.error("Secure Chat failed:", error);
        throw error;
      }
    }
  };
};
