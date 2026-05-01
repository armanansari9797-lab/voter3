import { knowledgeService } from './knowledgeService.js';
import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

// Mock Firebase
jest.mock('firebase/app', () => ({
    initializeApp: jest.fn()
}));
jest.mock('firebase/firestore', () => ({
    getFirestore: jest.fn(),
    collection: jest.fn(),
    getDocs: jest.fn(),
    doc: jest.fn(),
    setDoc: jest.fn(),
    query: jest.fn(),
    orderBy: jest.fn()
}));
jest.mock('firebase/auth', () => ({
    getAuth: jest.fn(() => ({ currentUser: { uid: 'test-user' } })),
    signInAnonymously: jest.fn(() => Promise.resolve({ user: { uid: 'test-user' } }))
}));
jest.mock('firebase/analytics', () => ({
    getAnalytics: jest.fn(),
    logEvent: jest.fn()
}));

describe('KnowledgeService', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('signIn returns a UID', async () => {
        const uid = await knowledgeService.signIn();
        expect(uid).toBe('test-user');
    });

    test('getKnowledgeBase returns fallback data if Firestore is empty', async () => {
        getDocs.mockResolvedValueOnce({ empty: true });
        const kb = await knowledgeService.getKnowledgeBase();
        expect(kb).toHaveProperty('greeting');
        expect(kb.greeting.text).toContain('Hello');
    });

    test('getKnowledgeBase returns remote data if Firestore has documents', async () => {
        const mockDocs = [
            { id: 'greeting', data: () => ({ text: 'Remote Hello' }) }
        ];
        getDocs.mockResolvedValueOnce({
            empty: false,
            forEach: (cb) => mockDocs.forEach(cb)
        });

        const kb = await knowledgeService.getKnowledgeBase();
        expect(kb.greeting.text).toBe('Remote Hello');
    });

    test('logInteraction handles errors gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        // Trigger a failure by making setDoc throw
        const { setDoc } = require('firebase/firestore');
        setDoc.mockRejectedValueOnce(new Error('Firestore error'));

        await knowledgeService.logInteraction('test-topic');
        
        expect(consoleSpy).toHaveBeenCalledWith('Logging failed:', expect.any(Error));
        consoleSpy.mockRestore();
    });
});
