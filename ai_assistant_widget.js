(function() {
    window.__aiChatWidgetSharedLoaded = true;

    function initializeAiChatWidget() {
        const widget = document.getElementById('aiChatWidget');
        const toggle = document.getElementById('aiChatToggle');
        const close = document.getElementById('aiChatClose');
        const form = document.getElementById('aiChatForm');
        const input = document.getElementById('aiChatInput');
        const messages = document.getElementById('aiChatMessages');
        const sendButton = document.getElementById('aiChatSend');
        const voiceButton = document.getElementById('aiChatVoice');
        const uploadInput = document.getElementById('aiChatAudioUpload');
        const voiceStatus = document.getElementById('aiChatVoiceStatus');
        let recorder = null;
        let stream = null;
        let chunks = [];

        if (!widget || !toggle || !close || !form || !input || !messages || !sendButton) {
            return;
        }

        const hasStoredUser = () => {
            try {
                const user = JSON.parse(localStorage.getItem('currentUser') || 'null');
                return Boolean(user && (
                    user.uid ||
                    user.email ||
                    user.studentId ||
                    window.DawaahCloud?.hasAuthSession?.() ||
                    window.DawaahSupabase?.hasAuthSession?.()
                ));
            } catch (error) {
                return false;
            }
        };

        const hasAdminSession = () => {
            try {
                return Boolean(
                    JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null') ||
                    sessionStorage.getItem('dawaahFirebaseIdToken')
                );
            } catch (error) {
                return Boolean(sessionStorage.getItem('dawaahFirebaseIdToken'));
            }
        };

        const workspaceSettings = () => {
            const keys = ['dawaahAdminWorkspaceSettings', 'dawaahWorkspaceSettings'];
            for (const key of keys) {
                try {
                    const settings = JSON.parse(localStorage.getItem(key) || 'null');
                    if (settings && typeof settings === 'object') return settings;
                } catch (error) {}
            }
            return {};
        };

        const aiChatPreferenceEnabled = () => workspaceSettings().aiChatEnabled !== false;
        const researchHistoryEnabled = () => workspaceSettings().researchHistory !== false;
        const preferredResearchMode = () => workspaceSettings().researchMode || 'groq_chat';

        const isWorkspaceUnlocked = () => {
            const adminLogin = document.getElementById('adminLoginScreen');
            const adminContainer = document.getElementById('adminContainer');
            if (adminLogin || adminContainer) {
                return hasAdminSession()
                    && adminLogin?.classList.contains('d-none')
                    && !adminContainer?.classList.contains('locked');
            }

            const dashboard = document.getElementById('dashboardPage');
            if (dashboard) {
                return dashboard.classList.contains('active') && hasStoredUser();
            }

            return false;
        };

        const syncWorkspaceAccess = () => {
            const allowed = isWorkspaceUnlocked() && aiChatPreferenceEnabled();
            widget.classList.toggle('ai-chat-widget--disabled', !allowed);
            widget.classList.toggle('ai-chat-widget--unlocked', allowed);
            widget.classList.toggle('ai-chat-widget--preference-hidden', !aiChatPreferenceEnabled());
            widget.setAttribute('aria-hidden', allowed ? 'false' : 'true');
            if (!allowed) setOpen(false);
            return allowed;
        };

        const setOpen = isOpen => {
            if (isOpen && !syncWorkspaceAccess()) return;
            widget.classList.toggle('is-open', isOpen);
            toggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            if (isOpen) setTimeout(() => input.focus(), 60);
        };

        const setVoiceStatus = text => {
            if (voiceStatus) voiceStatus.textContent = text || '';
        };

        const setRecording = isRecording => {
            if (!voiceButton) return;
            voiceButton.classList.toggle('is-recording', isRecording);
            voiceButton.setAttribute('aria-label', isRecording ? 'Stop recording' : 'Record voice question');
            voiceButton.innerHTML = isRecording
                ? '<i class="fas fa-stop" aria-hidden="true"></i>'
                : '<i class="fas fa-microphone" aria-hidden="true"></i>';
        };

        const addMessage = (text, type = 'bot') => {
            const message = document.createElement('div');
            message.className = `ai-chat-message ai-chat-message--${type}`;
            message.textContent = text;
            messages.appendChild(message);
            messages.scrollTop = messages.scrollHeight;
            return message;
        };

        const appendSourceLinks = (message, sources) => {
            const cleanSources = (Array.isArray(sources) ? sources : [])
                .filter(source => source && source.url)
                .slice(0, 5);
            if (!cleanSources.length) return;

            const list = document.createElement('div');
            list.className = 'ai-chat-sources';
            const label = document.createElement('strong');
            label.textContent = 'Sources';
            list.appendChild(label);

            cleanSources.forEach((source, index) => {
                const link = document.createElement('a');
                link.href = source.url;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = `[${index + 1}] ${source.title || source.url}`;
                list.appendChild(link);
            });

            message.appendChild(list);
            messages.scrollTop = messages.scrollHeight;
        };

        const workspaceContext = () => {
            const pageTitle = document.title || '';
            if (document.body?.dataset?.aiContext) return document.body.dataset.aiContext;
            if (/admin/i.test(pageTitle)) return 'admin workspace';
            if (/officer/i.test(pageTitle)) return 'officer workspace';
            if (document.getElementById('dashboardPage')?.classList.contains('active')) return 'student workspace';
            return 'public website assistant';
        };

        const aiEndpoint = () => {
            const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
            return workerUrl ? `${workerUrl.replace(/\/$/, '')}/chat` : '';
        };

        const aiHealthEndpoint = () => {
            const workerUrl = String(window.DAWAAH_AI_WORKER_URL || '').trim();
            return workerUrl ? `${workerUrl.replace(/\/$/, '')}/health` : '';
        };

        const payloadQuestion = payload => {
            if (payload instanceof FormData) {
                return String(payload.get('message') || payload.get('question') || '').trim();
            }
            return String(payload?.message || payload?.question || '').trim();
        };

        const aiCooldownRemaining = () => {
            const lastAt = Number(localStorage.getItem('dawaahAiLastRequestAt') || 0);
            const waitMs = 1500 - (Date.now() - lastAt);
            return Math.max(0, Math.ceil(waitMs / 1000));
        };

        const saveAiHistory = (question, result) => {
            const data = result?.data || {};
            if (!researchHistoryEnabled()) return;
            const transcript = String(data.transcript || '').trim();
            const savedQuestion = transcript
                ? (question ? `${question}\n\nVoice transcript:\n${transcript}` : transcript)
                : question;
            if (!savedQuestion || !data.answer) return;
            const history = JSON.parse(localStorage.getItem('researchHistory') || '[]');
            history.unshift({
                question: savedQuestion,
                answer: data.answer,
                mode: data.mode || 'groq_chat',
                model: data.model || '',
                transcript,
                sources: data.sources || [],
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('researchHistory', JSON.stringify(history.slice(0, 100)));
        };

        const sendToAssistant = (payload, waitingText = 'Thinking...') => {
            if (!syncWorkspaceAccess()) {
                return;
            }
            const cooldown = aiCooldownRemaining();
            if (cooldown > 0) {
                setVoiceStatus(`Please wait ${cooldown}s before sending another AI request.`);
                return;
            }
            localStorage.setItem('dawaahAiLastRequestAt', String(Date.now()));
            sendButton.disabled = true;
            if (voiceButton) voiceButton.disabled = true;
            const waitingMessage = addMessage(waitingText, 'bot');
            const originalQuestion = payloadQuestion(payload);
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), 60000);
            const endpoint = aiEndpoint();
            if (!endpoint) {
                waitingMessage.textContent = 'The AI worker URL is not configured.';
                waitingMessage.classList.add('ai-chat-message--error');
                clearTimeout(timeout);
                sendButton.disabled = false;
                if (voiceButton) voiceButton.disabled = false;
                return;
            }
            const requestFor = target => {
                if (payload instanceof FormData) {
                    const copy = new FormData();
                    payload.forEach((value, key) => copy.append(key, value));
                    return {
                        method: 'POST',
                        body: copy,
                        signal: controller.signal,
                        ...(String(target).startsWith('http') ? {} : { credentials: 'same-origin' })
                    };
                }
                return {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload),
                    signal: controller.signal,
                    ...(String(target).startsWith('http') ? {} : { credentials: 'same-origin' })
                };
            };

            const runAssistantFetch = () => fetch(endpoint, requestFor(endpoint));
            const parseAssistantResponse = response => response.text().then(text => {
                let result;
                try {
                    result = JSON.parse(text || '{}');
                } catch (error) {
                    const preview = text.trim().slice(0, 180);
                    throw new Error(preview || `The AI worker returned HTTP ${response.status}.`);
                }
                if (!response.ok) throw new Error(result.message || `The AI worker returned HTTP ${response.status}.`);
                return result;
            });

            runAssistantFetch()
            .catch(error => {
                if (!/failed to fetch|networkerror|load failed/i.test(error.message || '')) throw error;
                return fetch(aiHealthEndpoint(), { cache: 'no-store' })
                    .then(response => {
                        if (!response.ok) throw error;
                        return runAssistantFetch();
                    })
                    .catch(() => {
                        throw error;
                    });
            })
            .then(parseAssistantResponse)
            .then(result => {
                if (!result.success) throw new Error(result.message || 'The research AI could not answer right now.');
                if (result.data?.transcript) addMessage(`Voice transcript: ${result.data.transcript}`, 'user');
                waitingMessage.textContent = result.data?.answer || 'No answer was returned.';
                appendSourceLinks(waitingMessage, result.data?.sources);
                saveAiHistory(originalQuestion, result);
                setVoiceStatus('');
            })
            .catch(error => {
                const networkMessage = /failed to fetch|networkerror|load failed/i.test(error.message || '')
                    ? 'Research AI could not connect from this link. Refresh the main web.app link and try again; if it continues, redeploy the Cloudflare Worker allowlist.'
                    : '';
                waitingMessage.textContent = error.name === 'AbortError'
                    ? 'The research AI is taking too long. Please try a shorter question.'
                    : (networkMessage || error.message || 'The research AI could not answer right now.');
                waitingMessage.classList.add('ai-chat-message--error');
                setVoiceStatus(networkMessage || 'Voice or chat request failed.');
            })
            .finally(() => {
                clearTimeout(timeout);
                sendButton.disabled = false;
                if (voiceButton) voiceButton.disabled = false;
                input.focus();
            });
        };

        const checkAiHealth = () => {
            const endpoint = aiHealthEndpoint();
            if (!endpoint) {
                setVoiceStatus('Research AI is not configured.');
                return;
            }
            fetch(endpoint, { cache: 'no-store' })
                .then(response => response.json().then(result => ({ ok: response.ok && result.success })))
                .then(({ ok }) => setVoiceStatus(ok ? 'Research AI online.' : 'Research AI unavailable.'))
                .catch(() => setVoiceStatus('Research AI unavailable.'));
        };

        const sendAudio = (blob, filename) => {
            if (blob.size > 25 * 1024 * 1024) {
                setVoiceStatus('Audio must be 25MB or smaller.');
                return;
            }
            const typedMessage = input.value.trim();
            input.value = '';
            input.style.height = '';
            setVoiceStatus(`Uploading voice message (${Math.max(1, Math.round(blob.size / 1024))} KB)...`);
            const formData = new FormData();
            formData.append('audio', blob, filename || 'voice-question.webm');
            formData.append('message', typedMessage);
            formData.append('context', workspaceContext());
            formData.append('mode', preferredResearchMode());
            sendToAssistant(formData, 'Listening to your voice message...');
        };

        const startRecorder = () => {
            if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === 'undefined') {
                setVoiceStatus('Voice recording is not supported in this browser.');
                return;
            }
            navigator.mediaDevices.getUserMedia({ audio: true })
            .then(mediaStream => {
                stream = mediaStream;
                chunks = [];
                recorder = new MediaRecorder(mediaStream);
                recorder.ondataavailable = event => {
                    if (event.data && event.data.size > 0) chunks.push(event.data);
                };
                recorder.onstop = () => {
                    setRecording(false);
                    stream?.getTracks().forEach(track => track.stop());
                    sendAudio(new Blob(chunks, { type: recorder.mimeType || 'audio/webm' }), 'voice-question.webm');
                };
                recorder.start();
                setRecording(true);
                setVoiceStatus('Recording... tap stop when finished.');
            })
            .catch(() => setVoiceStatus('Microphone permission was not granted.'));
        };

        toggle.addEventListener('click', () => setOpen(true));
        close.addEventListener('click', () => setOpen(false));

        form.addEventListener('submit', event => {
            event.preventDefault();
            const question = input.value.trim();
            if (!question) return;
            addMessage(question, 'user');
            input.value = '';
            input.style.height = '';
            sendToAssistant({ message: question, context: workspaceContext(), mode: preferredResearchMode() });
        });

        voiceButton?.addEventListener('click', () => {
            setOpen(true);
            if (recorder && recorder.state === 'recording') recorder.stop();
            else startRecorder();
        });

        uploadInput?.addEventListener('change', () => {
            const file = uploadInput.files?.[0];
            if (!file) return;
            if (file.size > 25 * 1024 * 1024) {
                setVoiceStatus('Audio must be 25MB or smaller.');
                uploadInput.value = '';
                return;
            }
            sendAudio(file, file.name || 'voice-question.webm');
            uploadInput.value = '';
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

        syncWorkspaceAccess();
        if (isWorkspaceUnlocked()) checkAiHealth();
        setInterval(syncWorkspaceAccess, 800);
        window.addEventListener('storage', syncWorkspaceAccess);
        window.addEventListener('dawaah:workspace-settings-changed', syncWorkspaceAccess);
        window.addEventListener('dawaah:supabase-auth-changed', syncWorkspaceAccess);
    }

    document.addEventListener('DOMContentLoaded', initializeAiChatWidget);
})();
