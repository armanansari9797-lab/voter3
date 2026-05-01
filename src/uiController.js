/**
 * @typedef {Object} BotMessageData
 * @property {string} text - The main response text.
 * @property {boolean} [isAI] - Whether the response was AI-generated.
 * @property {string[]} [steps] - Optional step-by-step instructions.
 * @property {Object[]} [options] - Optional interactive action buttons.
 */

/**
 * UI Controller for CivicGuide.
 * Manages DOM interactions, message rendering, and accessibility.
 */
export class UIController {
    /**
     * @param {Object} callbacks
     * @param {Function} callbacks.onUserMessage
     * @param {Function} callbacks.onAction
     * @param {Function} callbacks.onClear
     */
    constructor(callbacks) {
        this.chatMessages = document.getElementById('chat-messages');
        this.chatForm = document.getElementById('chat-form');
        this.userInput = document.getElementById('user-input');
        this.quickRepliesContainer = document.getElementById('quick-replies');
        this.navItems = document.querySelectorAll('.nav-item');
        this.clearBtn = document.getElementById('clear-chat');
        
        this.callbacks = callbacks;
        this.initEventListeners();
    }

    initEventListeners() {
        this.chatForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const text = this.userInput.value.trim();
            if (text) {
                this.callbacks.onUserMessage(text);
                this.userInput.value = '';
            }
        });

        if (this.clearBtn) {
            this.clearBtn.addEventListener('click', () => {
                this.callbacks.onClear();
            });
        }

        this.navItems.forEach(item => {
            const handleNav = () => {
                this.navItems.forEach(i => i.removeAttribute('aria-current'));
                item.setAttribute('aria-current', 'page');
                this.callbacks.onAction(item.getAttribute('data-topic'), "nav_click");
            };

            item.addEventListener('click', handleNav);
            item.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleNav();
                }
            });
        });
    }

    addUserMessage(text) {
        const message = domUtils.el('div', { 
            className: 'message user', 
            role: 'article',
            'aria-label': 'User message'
        }, [
            domUtils.el('div', { className: 'message-avatar' }, [
                domUtils.el('i', { className: 'fas fa-user', 'aria-hidden': 'true' })
            ]),
            domUtils.el('div', { className: 'message-content' }, text)
        ]);

        this.chatMessages.appendChild(message);
        this.scrollToBottom();
        this.clearQuickReplies();
    }

    /**
     * @param {BotMessageData} data 
     */
    addBotMessage(data) {
        const children = [];
        
        if (data.isAI) {
            children.push(domUtils.el('div', { className: 'ai-badge' }, [
                domUtils.el('i', { className: 'fas fa-wand-magic-sparkles', 'aria-hidden': 'true' }),
                ' Powered by Gemini AI'
            ]));
        }

        children.push(domUtils.el('p', {}, data.text));

        if (data.steps?.length > 0) {
            const steps = data.steps.map((step, idx) => domUtils.el('div', { className: 'step-card' }, [
                domUtils.el('div', { className: 'step-number', 'aria-hidden': 'true' }, (idx + 1).toString()),
                domUtils.el('p', {}, step)
            ]));
            children.push(domUtils.el('div', { className: 'steps-container' }, steps));
        }

        if (data.options?.length > 0) {
            const options = data.options.map(opt => {
                const btn = domUtils.el('button', {
                    className: 'option-btn',
                    'data-action': opt.action,
                    'aria-label': `Learn more about ${opt.text}`
                }, [
                    opt.text,
                    domUtils.el('i', { className: 'fas fa-arrow-right', style: { fontSize: '10px' }, 'aria-hidden': 'true' })
                ]);
                
                btn.addEventListener('click', () => {
                    this.callbacks.onAction(opt.action);
                    btn.parentElement.style.opacity = '0.5';
                    btn.parentElement.style.pointerEvents = 'none';
                });
                
                return btn;
            });
            children.push(domUtils.el('div', { className: 'interactive-options' }, options));
        }

        const message = domUtils.el('div', { 
            className: 'message bot', 
            role: 'article', 
            tabindex: '-1',
            'aria-label': 'Assistant message'
        }, [
            domUtils.el('div', { className: 'message-avatar', 'aria-hidden': 'true' }, [
                domUtils.el('i', { className: 'fas fa-robot' })
            ]),
            domUtils.el('div', { className: 'message-content' }, children)
        ]);

        this.chatMessages.appendChild(message);
        this.updateQuickReplies(data.options);
        this.scrollToBottom();
        
        // Focus management for accessibility
        const firstBtn = message.querySelector('.option-btn');
        if (firstBtn) firstBtn.focus();
        else message.focus();
    }

    clearChat() {
        this.chatMessages.innerHTML = '';
        this.clearQuickReplies();
    }

    showTypingIndicator() {
        this.chatMessages.setAttribute('aria-busy', 'true');
        const indicator = domUtils.el('div', { className: 'message bot typing-message', id: 'typing-indicator' }, [
            domUtils.el('div', { className: 'message-avatar', 'aria-hidden': 'true' }, [
                domUtils.el('i', { className: 'fas fa-robot' })
            ]),
            domUtils.el('div', { className: 'message-content', style: { padding: '12px 16px' } }, [
                domUtils.el('div', { style: { display: 'flex', gap: '4px' }, 'aria-label': 'Assistant is typing' }, [
                    domUtils.el('div', { className: 'typing-dot' }),
                    domUtils.el('div', { className: 'typing-dot' }),
                    domUtils.el('div', { className: 'typing-dot' })
                ])
            ])
        ]);
        this.chatMessages.appendChild(indicator);
        this.scrollToBottom();
    }

    removeTypingIndicator() {
        this.chatMessages.setAttribute('aria-busy', 'false');
        const indicator = document.getElementById('typing-indicator');
        if (indicator) indicator.remove();
    }

    updateQuickReplies(options = []) {
        this.quickRepliesContainer.innerHTML = '';
        options.forEach(opt => {
            const btn = domUtils.el('button', {
                className: 'quick-reply-btn',
                'aria-label': `Quick response: ${opt.text}`
            }, opt.text);
            btn.addEventListener('click', () => this.callbacks.onAction(opt.action, "quick_reply"));
            this.quickRepliesContainer.appendChild(btn);
        });
    }

    clearQuickReplies() {
        this.quickRepliesContainer.innerHTML = '';
    }

    scrollToBottom() {
        requestAnimationFrame(() => {
            this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
        });
    }
}
