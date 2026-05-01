import { UIController } from './uiController.js';
import { domUtils } from './domUtils.js';

// Setup DOM for testing
document.body.innerHTML = `
    <div id="chat-messages"></div>
    <form id="chat-form">
        <input type="text" id="user-input">
    </form>
    <div id="quick-replies"></div>
    <div class="nav-item" data-topic="test"></div>
    <button id="clear-chat"></button>
`;

describe('UIController', () => {
    let ui;
    let mockCallbacks;

    beforeEach(() => {
        mockCallbacks = {
            onUserMessage: jest.fn(),
            onAction: jest.fn(),
            onClear: jest.fn()
        };
        document.getElementById('chat-messages').innerHTML = '';
        ui = new UIController(mockCallbacks);
    });

    test('addUserMessage adds message and timestamp to DOM', () => {
        ui.addUserMessage('Hello world');
        const messages = document.querySelectorAll('.message.user');
        const timestamp = document.querySelector('.message-timestamp');
        expect(messages.length).toBe(1);
        expect(messages[0].textContent).toContain('Hello world');
        expect(timestamp).not.toBeNull();
    });

    test('addBotMessage adds message and options', () => {
        ui.addBotMessage({
            text: 'Bot response',
            options: [{ text: 'Option 1', action: 'action1' }]
        });
        const messages = document.querySelectorAll('.message.bot');
        const buttons = document.querySelectorAll('.option-btn');
        expect(messages.length).toBe(1);
        expect(buttons.length).toBe(1);
        expect(buttons[0].textContent).toContain('Option 1');
    });

    test('clearChat removes all messages', () => {
        ui.addUserMessage('Msg 1');
        ui.clearChat();
        expect(document.getElementById('chat-messages').children.length).toBe(0);
    });

    test('clicking clear button calls onClear callback', () => {
        const clearBtn = document.getElementById('clear-chat');
        clearBtn.click();
        expect(mockCallbacks.onClear).toHaveBeenCalled();
    });

    test('submitting form calls onUserMessage callback', () => {
        const form = document.getElementById('chat-form');
        const input = document.getElementById('user-input');
        input.value = 'New message';
        form.dispatchEvent(new Event('submit'));
        expect(mockCallbacks.onUserMessage).toHaveBeenCalledWith('New message');
    });
});
