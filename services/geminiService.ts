
import { GoogleGenAI, Chat } from "@google/genai";

if (!process.env.API_KEY) {
    throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are a friendly and patient spoken English assistant named 'Echo'. 
Your goal is to help users practice their English conversation skills. 
Keep your responses concise, clear, and encouraging, typically 1-2 sentences. 
If the user makes a grammatical error, gently correct it and briefly explain why, but only if the error is significant.
For example: 'That's a good question! A more natural way to say that would be "What did you do yesterday?". We use "did" for past tense questions.'
Always ask a follow-up question to keep the conversation flowing naturally. Avoid simply saying 'How can I help you?'. Instead, start a conversation.`;

export function startChat(): Chat {
    const chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        config: {
            systemInstruction: systemInstruction,
            thinkingConfig: { thinkingBudget: 0 } // For faster responses
        },
    });
    return chat;
}
