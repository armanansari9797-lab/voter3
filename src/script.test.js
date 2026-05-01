const fs = require('fs');
const path = require('path');

const html = fs.readFileSync(path.resolve(__dirname, '../index.html'), 'utf8');
let js = fs.readFileSync(path.resolve(__dirname, './script.js'), 'utf8');

// Mock data.js for testing
const dataJs = fs.readFileSync(path.resolve(__dirname, './data.js'), 'utf8');
const knowledgeBaseText = dataJs.replace('export const knowledgeBase =', 'const knowledgeBase =');

// Mock knowledgeService
const mockService = `
const knowledgeService = {
    signIn: async () => "test-uid",
    getKnowledgeBase: async () => { ${knowledgeBaseText}; return knowledgeBase; },
    logInteraction: async () => {}
};
`;

js = js.replace("import { knowledgeService } from './knowledgeService.js';", mockService);

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
        expect(userMessages[0].innerHTML).toContain('Test message');
    });

    test('Edge Case: Empty input does not create message', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('user-input');
        const chatMessages = document.getElementById('chat-messages');
        
        const initialCount = chatMessages.children.length;
        input.value = '   ';
        form.dispatchEvent(new Event('submit'));
        
        expect(chatMessages.children.length).toBe(initialCount);
    });

    test('Integration Flow: Clicking a quick reply triggers bot response', (done) => {
        const chatMessages = document.getElementById('chat-messages');
        const initialCount = chatMessages.children.length;
        
        // Find a button in the greeting
        const firstBotMsg = chatMessages.querySelector('.message.bot');
        const btn = firstBotMsg.querySelector('.option-btn');
        
        btn.click();
        
        // Wait for typing indicator and response (using setTimeout to match script.js delay)
        setTimeout(() => {
            expect(chatMessages.children.length).toBeGreaterThan(initialCount);
            done();
        }, 1500); 
    });
    
    test('XSS protection works via escapeHTML', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('user-input');
        const chatMessages = document.getElementById('chat-messages');
        
        input.value = '<script>alert("xss")</script>';
        form.dispatchEvent(new Event('submit'));
        
        const userMessages = chatMessages.querySelectorAll('.message.user');
        expect(userMessages.length).toBe(1);
        expect(userMessages[0].innerHTML).not.toContain('<script>');
        expect(userMessages[0].innerHTML).toContain('&lt;script&gt;');
    });

    test('Keyboard Interaction: Space key on nav item triggers action', () => {
        const navItem = document.querySelector('.nav-item[data-topic="timeline"]');
        const chatMessages = document.getElementById('chat-messages');
        const initialCount = chatMessages.children.length;

        navItem.dispatchEvent(new KeyboardEvent('keydown', { key: ' ' }));
        
        // Wait for bot response
        return new Promise(resolve => {
            setTimeout(() => {
                expect(chatMessages.children.length).toBeGreaterThan(initialCount);
                expect(navItem.getAttribute('aria-current')).toBe('page');
                resolve();
            }, 600);
        });
    });

    test('Focus Management: Moves focus to new options after bot message', (done) => {
        const registrationNav = document.querySelector('.nav-item[data-topic="registration"]');
        registrationNav.click();

        setTimeout(() => {
            const lastBotMsg = document.querySelector('.message.bot:last-child');
            const firstOption = lastBotMsg.querySelector('.option-btn');
            if (firstOption) {
                expect(document.activeElement).toBe(firstOption);
            } else {
                expect(document.activeElement).toBe(lastBotMsg);
            }
            done();
        }, 1000);
    });

    test('Robustness: Handles unknown user input gracefully', (done) => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('user-input');
        const chatMessages = document.getElementById('chat-messages');
        
        input.value = 'How do I bake a cake?';
        form.dispatchEvent(new Event('submit'));

        setTimeout(() => {
            try {
                const botMessages = chatMessages.querySelectorAll('.message.bot');
                const lastMsg = botMessages[botMessages.length - 1];
                expect(lastMsg.innerHTML).toContain('not quite sure'); 
                done();
            } catch (error) {
                done(error);
            }
        }, 1000);
    });

    test('Accessibility: Sets aria-busy during bot typing', (done) => {
        const chatMessages = document.getElementById('chat-messages');
        const input = document.getElementById('user-input');
        const form = document.getElementById('chat-form');

        input.value = 'hello';
        form.dispatchEvent(new Event('submit'));

        // Should be busy while typing
        setTimeout(() => {
            try {
                expect(chatMessages.getAttribute('aria-busy')).toBe('true');
            } catch (error) {
                // If it fails here, we still need to wait for the next step or fail done
                done(error);
                return;
            }
        }, 400);

        // Should not be busy after response
        setTimeout(() => {
            try {
                expect(chatMessages.getAttribute('aria-busy')).toBe('false');
                done();
            } catch (error) {
                done(error);
            }
        }, 1200);
    });
});
