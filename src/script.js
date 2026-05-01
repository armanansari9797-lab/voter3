import { knowledgeService } from './knowledgeService.js';
import { UIController } from './uiController.js';

/**
 * Main application entry point for CivicGuide Election Assistant.
 * Coordinates between UI events and background services.
 */
document.addEventListener('DOMContentLoaded', async () => {
    let kb = null;
    let ui = null;

    /**
     * Debounce utility to prevent rapid-fire API calls.
     */
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    /**
     * Processes user text input and determines the best response.
     */
    const processUserInput = debounce(async (text) => {
        ui.showTypingIndicator();
        
        // Track interaction
        knowledgeService.logInteraction(text.substring(0, 50), "text_input");

        const lowerText = text.toLowerCase();
        let response = null;

        // 1. Precise Keyword Matching
        const keywords = {
            registration: ['register', 'sign up', 'enrol'],
            timeline: ['time', 'date', 'when', 'timeline', 'schedule'],
            process: ['process', 'how to vote', 'booth', 'step'],
            documents: ['document', 'id', 'bring', 'proof'],
            greeting: ['hi', 'hello', 'start', 'hey'],
            faq: ['faq', 'question', 'help', 'common']
        };

        for (const [key, list] of Object.entries(keywords)) {
            if (list.some(word => lowerText.includes(word))) {
                response = kb[key];
                break;
            }
        }

        // 2. AI Fallback (Grounded in context)
        if (!response) {
            try {
                const { aiService } = await import('./aiService.js');
                response = await aiService.generateResponse(text, kb);
            } catch (error) {
                console.error("AI service error:", error);
            }
        }

        // 3. Ultimate Fallback
        if (!response) {
            response = kb.unknown;
        }

        ui.removeTypingIndicator();
        ui.addBotMessage(response);
    }, 300);

    /**
     * Handles predefined actions (button clicks, navigation).
     */
    function handleAction(actionId, source = "button_click") {
        const response = kb[actionId];
        if (response) {
            knowledgeService.logInteraction(actionId, source);
            ui.showTypingIndicator();
            
            // Artificial delay for natural feel
            setTimeout(() => {
                ui.removeTypingIndicator();
                ui.addBotMessage(response);
            }, 500);
        }
    }

    // Initialize the UI Controller with necessary callbacks
    ui = new UIController({
        onUserMessage: (text) => {
            ui.addUserMessage(text);
            processUserInput(text);
        },
        onAction: (actionId, source) => {
            handleAction(actionId, source);
        },
        onClear: () => {
            ui.clearChat();
            if (kb && kb.greeting) {
                ui.addBotMessage(kb.greeting);
            }
        }
    });

    // Initialize Chat Session
    async function init() {
        ui.showTypingIndicator();
        
        try {
            // Parallel initialization where possible
            await knowledgeService.signIn();
            kb = await knowledgeService.getKnowledgeBase();
        } catch (error) {
            console.error("Initialization failed:", error);
            // Fallback to local data is handled within knowledgeService
        }
        
        ui.removeTypingIndicator();
        if (kb && kb.greeting) {
            ui.addBotMessage(kb.greeting);
        }
    }

    await init();
});
