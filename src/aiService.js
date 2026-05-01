import { GoogleGenerativeAI } from "@google/generai";

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

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
        try {
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
            
            const systemContext = `
                You are CivicGuide, a helpful election assistant. 
                Use the following knowledge base if relevant, but answer based on your broad knowledge of election processes if the specific question isn't there.
                
                Knowledge Base Summary: ${JSON.stringify(context)}
                
                Keep your answer concise (max 3 sentences), friendly, and encouraging of civic participation.
            `;

            const result = await model.generateContent([systemContext, userPrompt]);
            const response = await result.response;
            return {
                text: response.text(),
                isAI: true
            };
        } catch (error) {
            console.error("Gemini AI failed:", error);
            // Fallback to a helpful message if AI fails
            return null;
        }
    }
};
