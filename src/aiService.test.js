import { aiService } from './aiService.js';

// Mock @google/genai
jest.mock('@google/genai', () => ({
    GoogleGenAI: jest.fn().mockImplementation(() => ({
        models: {
            generateContent: jest.fn().mockResolvedValue({
                text: "Mocked AI Response"
            })
        }
    }))
}));

describe('AIService', () => {
    const mockContext = {
        registration: { text: "Reg info" },
        timeline: { text: "Time info" }
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('generateResponse returns a valid object', async () => {
        const response = await aiService.generateResponse("How to register?", mockContext);
        expect(response).toEqual({
            text: "Mocked AI Response",
            isAI: true
        });
    });

    test('generateResponse uses cache for repeated queries', async () => {
        const firstCall = await aiService.generateResponse("Repeat query", mockContext);
        const secondCall = await aiService.generateResponse("Repeat query", mockContext);
        
        expect(firstCall).toBe(secondCall); // Should be the same object from cache
    });

    test('generateResponse handles failure gracefully', async () => {
        const { GoogleGenAI } = require('@google/genai');
        const mockGenAI = new GoogleGenAI();
        mockGenAI.models.generateContent.mockRejectedValueOnce(new Error("API Error"));

        const response = await aiService.generateResponse("Trigger error", mockContext);
        expect(response).toBeNull();
    });
});
