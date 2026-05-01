import { knowledgeService } from './knowledgeService.js';

/**
 * Main application logic for CivicGuide Election Assistant.
 * Handles UI interactions, chat management, and Firebase service integration.
 */
document.addEventListener('DOMContentLoaded', async () => {
    /** @type {HTMLElement} */
    const chatMessages = document.getElementById('chat-messages');
    /** @type {HTMLFormElement} */
    const chatForm = document.getElementById('chat-form');
    /** @type {HTMLInputElement} */
    const userInput = document.getElementById('user-input');
    /** @type {HTMLElement} */
    const quickRepliesContainer = document.getElementById('quick-replies');
    /** @type {NodeListOf<HTMLElement>} */
    const navItems = document.querySelectorAll('.nav-item');

    /** @type {Object|null} The fetched knowledge base */
    let kb = null;

    // Initialize Chat
    async function initChat() {
        chatMessages.innerHTML = '';
        showTypingIndicator();
        
        // Authenticate and fetch knowledge base from Firebase
        await knowledgeService.signIn();
        kb = await knowledgeService.getKnowledgeBase();
        
        removeTypingIndicator();
        addBotMessage(kb.greeting);
    }

    // Handle Form Submission
    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const text = userInput.value.trim();
        if (text) {
            addUserMessage(text);
            userInput.value = '';
            processUserInput(text);
        }
    });

    // Handle Navigation Clicks and Keyboard Events
    function handleNavInteraction(item) {
        // Remove active state from others
        navItems.forEach(i => i.removeAttribute('aria-current'));
        item.setAttribute('aria-current', 'page');
        
        const topic = item.getAttribute('data-topic');
        handleAction(topic, "nav_click");
    }

    navItems.forEach(item => {
        item.addEventListener('click', () => handleNavInteraction(item));
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                handleNavInteraction(item);
            }
        });
    });

    // Debounce utility for efficiency
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

    const processUserInput = debounce((text) => {
        showTypingIndicator();
        
        // Log user query to Firebase
        knowledgeService.logInteraction(text.substring(0, 50), "text_input");

        setTimeout(() => {
            removeTypingIndicator();
            const lowerText = text.toLowerCase();
            let response = kb.unknown;

            if (lowerText.includes('register') || lowerText.includes('sign up')) {
                response = kb.registration;
            } else if (lowerText.includes('time') || lowerText.includes('date') || lowerText.includes('when') || lowerText.includes('timeline')) {
                response = kb.timeline;
            } else if (lowerText.includes('process') || lowerText.includes('how to vote') || lowerText.includes('booth')) {
                response = kb.process;
            } else if (lowerText.includes('document') || lowerText.includes('id') || lowerText.includes('bring')) {
                response = kb.documents;
            } else if (lowerText.includes('hi') || lowerText.includes('hello') || lowerText.includes('start')) {
                response = kb.greeting;
            }

            addBotMessage(response);
        }, 600); 
    }, 300);

    function handleAction(actionId, source = "button_click") {
        const response = kb[actionId];
        if (response) {
            // Log interaction to Firebase
            knowledgeService.logInteraction(actionId, source);

            showTypingIndicator();
            setTimeout(() => {
                removeTypingIndicator();
                addBotMessage(response);
            }, 500);
        }
    }

    function addUserMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message user';
        messageDiv.setAttribute('role', 'article');
        
        messageDiv.innerHTML = `
            <div class="message-avatar">
                <i class="fas fa-user" aria-hidden="true"></i>
            </div>
            <div class="message-content">
                ${escapeHTML(text)}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        scrollToBottom();
        clearQuickReplies();
    }

    function addBotMessage(data) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'message bot';
        messageDiv.setAttribute('role', 'article');
        messageDiv.setAttribute('tabindex', '-1'); 
        
        let contentHtml = `<p>${data.text}</p>`;
        
        if (data.steps && data.steps.length > 0) {
            const stepsHtml = data.steps.map((step, index) => `
                <div class="step-card">
                    <div class="step-number" aria-hidden="true">${index + 1}</div>
                    <p>${step}</p>
                </div>
            `).join('');
            contentHtml += `<div class="steps-container">${stepsHtml}</div>`;
        }
        
        if (data.options && data.options.length > 0) {
            const optionsHtml = data.options.map(opt => `
                <button class="option-btn" data-action="${opt.action}" aria-label="Learn more about ${opt.text}">
                    ${opt.text} <i class="fas fa-arrow-right" style="font-size: 10px;" aria-hidden="true"></i>
                </button>
            `).join('');
            contentHtml += `<div class="interactive-options">${optionsHtml}</div>`;
        }

        messageDiv.innerHTML = `
            <div class="message-avatar" aria-hidden="true">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content">
                ${contentHtml}
            </div>
        `;
        
        chatMessages.appendChild(messageDiv);
        
        const newButtons = messageDiv.querySelectorAll('.option-btn');
        newButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const action = btn.getAttribute('data-action');
                handleAction(action);
                btn.parentElement.style.opacity = '0.5';
                btn.parentElement.style.pointerEvents = 'none';
            });
        });

        updateQuickReplies(data.options);
        scrollToBottom();
        
        const firstBtn = messageDiv.querySelector('.option-btn');
        if (firstBtn) {
            firstBtn.focus();
        } else {
            messageDiv.focus();
        }
    }

    function showTypingIndicator() {
        chatMessages.setAttribute('aria-busy', 'true');
        const indicator = document.createElement('div');
        indicator.className = 'message bot typing-message';
        indicator.id = 'typing-indicator';
        indicator.innerHTML = `
            <div class="message-avatar" aria-hidden="true">
                <i class="fas fa-robot"></i>
            </div>
            <div class="message-content" style="padding: 12px 16px;">
                <div style="display: flex; gap: 4px;" aria-label="Assistant is typing">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.appendChild(indicator);
        scrollToBottom();
    }

    function removeTypingIndicator() {
        chatMessages.setAttribute('aria-busy', 'false');
        const indicator = document.getElementById('typing-indicator');
        if (indicator) {
            indicator.remove();
        }
    }

    function updateQuickReplies(options) {
        quickRepliesContainer.innerHTML = '';
        if (options && options.length > 0) {
            options.forEach(opt => {
                const btn = document.createElement('button');
                btn.className = 'quick-reply-btn';
                btn.textContent = opt.text;
                btn.setAttribute('aria-label', `Quick response: ${opt.text}`);
                btn.addEventListener('click', () => {
                    handleAction(opt.action, "quick_reply");
                });
                quickRepliesContainer.appendChild(btn);
            });
        }
    }

    function clearQuickReplies() {
        quickRepliesContainer.innerHTML = '';
    }

    function scrollToBottom() {
        requestAnimationFrame(() => {
            chatMessages.scrollTop = chatMessages.scrollHeight;
        });
    }

    function escapeHTML(str) {
        if (!str) return "";
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    }

    await initChat();
});
