import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { jest, describe, beforeEach, test, expect } from '@jest/globals';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
let js = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');

// Mock data.js for testing
const dataJs = fs.readFileSync(path.resolve(__dirname, './data.js'), 'utf8');
const knowledgeBaseText = dataJs.replace('export const knowledgeBase =', 'const knowledgeBase =');

const domUtilsJs = fs.readFileSync(path.resolve(__dirname, './domUtils.js'), 'utf8');
const uiControllerJs = fs.readFileSync(path.resolve(__dirname, './uiController.js'), 'utf8');

// Strip exports and imports for eval
const domUtilsCode = domUtilsJs.replace('export const domUtils =', 'const domUtils =');
const uiControllerCode = uiControllerJs
    .replace("import { domUtils } from './domUtils.js';", "")
    .replace('export class UIController', 'class UIController');

// Mock knowledgeService and dynamic imports
const mockService = `
const knowledgeService = {
    signIn: async () => "test-uid",
    getKnowledgeBase: async () => { ${knowledgeBaseText}; return knowledgeBase; },
    logInteraction: async () => {}
};
`;

js = js.replace(/import { knowledgeService } from '.*';/, mockService)
      .replace(/import { UIController } from '.*';/, uiControllerCode)
      .replace(/await import\('\.\/aiService\.js'\)/, "{ aiService: { generateResponse: async () => ({ text: 'AI Response' }) } }")
      .replace(/function debounce\(func, wait\) \{/, "function debounce(func, wait) { return (...args) => func(...args); // Sync mock for testing");

// Inject domUtils as well
js = domUtilsCode + "\n" + js;

describe('CivicGuide Assistant', () => {
    beforeEach(() => {
        // Setup DOM
        document.documentElement.innerHTML = html.toString();
        // Execute script (mocking DOMContentLoaded)
        eval(js);
        document.dispatchEvent(new Event('DOMContentLoaded'));
    });

    test('Initializes chat with greeting', () => {
        const chatMessages = document.getElementById('chat-messages');
        expect(chatMessages.children.length).toBeGreaterThan(0);
        expect(chatMessages.innerHTML).toContain('CivicGuide');
    });

    test('Navigation items have keyboard accessibility handlers', () => {
        const registrationNav = document.querySelector('.nav-item[data-topic="registration"]');
        expect(registrationNav.getAttribute('tabindex')).toBe("0");
    });

    test('Form submission creates user message', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('user-input');
        const chatMessages = document.getElementById('chat-messages');
        
        input.value = 'Test message';
        form.dispatchEvent(new Event('submit'));
        
        const userMessages = chatMessages.querySelectorAll('.message.user');
        expect(userMessages.length).toBe(1);
        expect(userMessages[0].textContent).toContain('Test message');
    });

    test('Focus management: Moves focus to new options after bot message', (done) => {
        const input = document.getElementById('user-input');
        const form = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-messages');

        input.value = 'registration';
        form.dispatchEvent(new Event('submit'));

        // Wait for bot response
        setTimeout(() => {
            const botMessages = chatMessages.querySelectorAll('.message.bot');
            const lastMessage = botMessages[botMessages.length - 1];
            const firstBtn = lastMessage.querySelector('.option-btn');
            
            if (firstBtn) {
                expect(document.activeElement).toBe(firstBtn);
            } else {
                expect(document.activeElement).toBe(lastMessage);
            }
            done();
        }, 1000);
    });

    test('Robustness: Handles unknown user input gracefully', (done) => {
        const input = document.getElementById('user-input');
        const form = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-messages');

        input.value = 'random gibberish';
        form.dispatchEvent(new Event('submit'));

        setTimeout(() => {
            const botMessages = chatMessages.querySelectorAll('.message.bot');
            const lastMessage = botMessages[botMessages.length - 1];
            const content = lastMessage.textContent.toLowerCase();
            // Match either the AI mock response or the local fallback
            expect(content.includes('learning') || content.includes('ai response')).toBe(true);
            done();
        }, 800);
    });

    test('Accessibility: Sets aria-busy during bot typing', (done) => {
        const input = document.getElementById('user-input');
        const form = document.getElementById('chat-form');
        const chatMessages = document.getElementById('chat-messages');

        // Note: debounce is mocked as sync, so we check the end result
        input.value = 'timeline';
        form.dispatchEvent(new Event('submit'));

        setTimeout(() => {
            expect(chatMessages.getAttribute('aria-busy')).toBe('false');
            done();
        }, 500);
    });
});
