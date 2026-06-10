// Runtime slice from daawah.js: initializeAiChatWidget.
function initializeAiChatWidget() {
    if (window.__aiChatWidgetSharedLoaded) {
        return;
    }
    const widget = document.getElementById('aiChatWidget');
    const toggle = document.getElementById('aiChatToggle');
    const close = document.getElementById('aiChatClose');
    const form = document.getElementById('aiChatForm');
    const input = document.getElementById('aiChatInput');
    const messages = document.getElementById('aiChatMessages');
    const sendButton = document.getElementById('aiChatSend');

    if (!widget || !toggle || !close || !form || !input || !messages || !sendButton) {
        return;
    }

    const setOpen = isOpen => {
        widget.classList.toggle('is-open', isOpen);
        toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
        if (isOpen) {
            setTimeout(() => input.focus(), 60);
        }
    };

    const addMessage = (text, type = 'bot') => {
        const message = document.createElement('div');
        message.className = `ai-chat-message ai-chat-message--${type}`;
        message.textContent = text;
        messages.appendChild(message);
        messages.scrollTop = messages.scrollHeight;
        return message;
    };

    toggle.addEventListener('click', () => setOpen(true));
    close.addEventListener('click', () => setOpen(false));

    form.addEventListener('submit', event => {
        event.preventDefault();
        const question = input.value.trim();
        if (!question) {
            return;
        }

        addMessage(question, 'user');
        input.value = '';
        input.style.height = '';
        sendButton.disabled = true;
        const waitingMessage = addMessage('Thinking...', 'bot');

        const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
        const endpoint = workerUrl ? `${workerUrl.replace(/\/$/, '')}/chat` : 'chat_firestore-disabled-endpoint';
        fetch(endpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ message: question, mode: 'groq_chat', context: 'student dashboard' })
        })
        .then(response => response.json().catch(() => {
            throw new Error('The server returned an unreadable response.');
        }))
        .then(result => {
            if (!result.success) {
                throw new Error(result.message || 'The research AI could not answer right now.');
            }
            waitingMessage.textContent = result.data?.answer || 'No answer was returned.';
        })
        .catch(error => {
            waitingMessage.textContent = error.message || 'The research AI could not answer right now.';
            waitingMessage.classList.add('ai-chat-message--error');
        })
        .finally(() => {
            sendButton.disabled = false;
            input.focus();
        });
    });

    input.addEventListener('input', () => {
        input.style.height = 'auto';
        input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
    });

    input.addEventListener('keydown', event => {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            form.requestSubmit();
        }
    });
}

// The shared ai_assistant_widget.js owns the Research AI widget.

clearStoredAccountsOnce();

window.fetch = function(resource, options = {}) {
    const method = String(options.method || 'GET').toUpperCase();
    const isLocalPhpApi = typeof resource === 'string' && /^(api|admin_api|daawah|dawaah|mpesa_api)\.php/.test(resource);
    const isUnsafePhpRequest = isLocalPhpApi && ['POST', 'PUT', 'DELETE'].includes(method);
    if (isUnsafePhpRequest) options = attachUserCsrfHeader(options);
    if (isLocalPhpApi && !options.credentials) {
        options = { ...options, credentials: 'same-origin' };
    }
    const requestUrl = useLegacyPhpApi && isLocalPhpApi ? LEGACY_PHP_BASE_URL + resource : resource;

    const runRequest = requestOptions => realAppFetch(requestUrl, requestOptions);
    if (isUnsafePhpRequest) {
        return runRequest(options).then(response => {
            const copy = response.clone();
            return copy.text()
                .then(text => {
                    let result = null;
                    try {
                        result = JSON.parse(text);
                    } catch (error) {
                        return response;
                    }
                    if (!result || result.success !== false || !/security token expired/i.test(result.message || '')) {
                        return response;
                    }
                    return refreshUserSessionToken()
                        .then(() => runRequest(attachUserCsrfHeader(options)))
                        .catch(() => response);
                })
                .catch(() => response);
        });
    }
    if (useLegacyPhpApi && isLocalPhpApi) {
        return realAppFetch(requestUrl, options);
    }
    return realAppFetch(requestUrl, options);
};
