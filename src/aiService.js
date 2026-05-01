import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: import.meta.env.VITE_GEMINI_API_KEY });
const responseCache = new Map();

/**
 * AI Service for CivicGuide.
 * Integrates Google Gemini to provide intelligent responses to election-related queries.
 */
export const aiService = {
    /**
     * Generates a response using the Gemini model.
     * @param {string} userPrompt - The user's query.
     * @param {Object} context - The knowledge base context for grounded responses.
     */
    async generateResponse(userPrompt, context) {
        const cacheKey = userPrompt.toLowerCase().trim();
        if (responseCache.has(cacheKey)) {
            console.log("Serving AI response from cache");
            return responseCache.get(cacheKey);
        }

        try {
            // Efficiency: Only send essential context to reduce token count
            const minimizedContext = {
                registration: context.registration?.text,
                timeline: context.timeline?.text,
                process: context.process?.text,
                documents: context.documents?.text
            };

            const systemContext = `
                You are CivicGuide, a helpful election assistant. 
                Context from our official guide: ${JSON.stringify(minimizedContext)}
                
                Answer based on the guide first. If the information isn't there, use your broad knowledge.
                Keep answers concise (max 3 sentences), friendly, and encourage voting.
            `;

            const result = await genAI.models.generateContent({
                model: "gemini-3-flash-preview",
                contents: systemContext + "\n\nUser Query: " + userPrompt
            });

            const responseData = {
                text: result.text || "I'm here to help with your election questions!",
                isAI: true
            };

            responseCache.set(cacheKey, responseData);
            return responseData;
        } catch (error) {
            console.error("Gemini AI failed:", error);
            return null;
        }
    }
};
