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
                return Boolean(user && (user.uid || user.email || user.studentId || window.SupabaseBackend?.hasAuthSession?.()));
            } catch (error) {
                return false;
            }
        };

        const hasAdminSession = () => {
            try {
                return Boolean(
                    JSON.parse(sessionStorage.getItem('currentAdminUser') || 'null') ||
                    sessionStorage.getItem('dawahSupabaseAccessToken') || // Supabase: Check for Supabase access token
                    sessionStorage.getItem('dawahSupabaseAccessToken')
                );
            } catch (error) {
                return Boolean(sessionStorage.getItem('dawahSupabaseAccessToken') || sessionStorage.getItem('dawahSupabaseAccessToken'));
            }
        };

        const workspaceSettings = () => {
            const keys = ['dawahAdminWorkspaceSettings', 'dawahWorkspaceSettings'];
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

        const safeJson = fallback => value => {
            try {
                const parsed = JSON.parse(value || '');
                return parsed == null ? fallback : parsed;
            } catch (error) {
                return fallback;
            }
        };

        const readList = key => {
            const value = safeJson([])(localStorage.getItem(key));
            return Array.isArray(value) ? value : [];
        };

        const readObject = key => {
            const value = safeJson({})(localStorage.getItem(key));
            return value && typeof value === 'object' && !Array.isArray(value) ? value : {};
        };

        const activeWorkspaceView = () => {
            const active = document.querySelector('.admin-content.active, .view-container.active, section.active, .tab-pane.active');
            return active?.id || '';
        };

        const workspaceDataSnapshot = () => {
            const resources = readList('adminResources');
            const members = readList('allMembers');
            const events = readList('allEvents');
            const registrations = readList('registeredEvents');
            const welfare = readList('welfareRequests');
            const donations = readList('donations');
            const payments = readList('payments');
            const researchHistory = readList('researchHistory');
            const currentUser = readObject('currentUser');
            const currentAdmin = safeJson({})(sessionStorage.getItem('currentAdminUser'));
            const pendingWelfare = welfare.filter(item => /pending|review/i.test(String(item?.status || ''))).length;
            const activeMembers = members.filter(member => /active|approved/i.test(String(member?.status || ''))).length;
            const students = members.filter(member => String(member?.role || 'student').toLowerCase() === 'student' || member?.studentId || member?.student_id);
            const pendingStudents = students.filter(member => /pending/i.test(String(member?.status || member?.accountStatus || member?.membershipStatus || ''))).length;
            const pendingRoleRequests = members.filter(member => {
                const role = String(member?.role || 'student').toLowerCase();
                const status = String(member?.status || member?.accountStatus || '').toLowerCase();
                return role && role !== 'student' && !['active', 'approved', 'rejected', 'suspended'].includes(status);
            });
            const recentRegistrations = members
                .slice()
                .sort((a, b) => new Date(b?.registeredAt || b?.created_at || b?.createdAt || 0) - new Date(a?.registeredAt || a?.created_at || a?.createdAt || 0))
                .slice(0, 5)
                .map(member => {
                    const name = member?.fullName || member?.name || [member?.first_name, member?.last_name].filter(Boolean).join(' ') || member?.studentId || member?.email || 'Unknown';
                    const role = member?.role || 'student';
                    const status = member?.status || member?.accountStatus || 'Active';
                    return `${name} (${role}, ${status})`;
                });
            const resourceTitles = resources
                .map(item => item?.title || item?.name || item?.resource_title || '')
                .filter(Boolean)
                .slice(0, 5);

            return [
                'Current app data snapshot from this browser/workspace:',
                `Active view: ${activeWorkspaceView() || 'unknown'}.`,
                `Current user role: ${currentAdmin?.isMainAdmin ? 'main admin' : currentAdmin?.role || currentUser?.role || 'unknown'}.`,
                `Resources: ${resources.length}.`,
                resourceTitles.length ? `Recent resource titles: ${resourceTitles.join('; ')}.` : 'Recent resource titles: none available.',
                `Members: ${members.length}. Active/approved members: ${activeMembers}.`,
                `Registered students: ${students.length}. Pending student statuses: ${pendingStudents}.`,
                `Pending officer role requests: ${pendingRoleRequests.length}.`,
                recentRegistrations.length ? `Recent registrations: ${recentRegistrations.join('; ')}.` : 'Recent registrations: none available.',
                `Events: ${events.length}. Event registrations: ${registrations.length}.`,
                `Welfare requests: ${welfare.length}. Pending welfare requests: ${pendingWelfare}.`,
                `Donations: ${donations.length}. Payments: ${payments.length}.`,
                `Saved research history items: ${researchHistory.length}.`,
                'Use these counts and recent records directly when the user asks how many records/resources/items are in this workspace or whether a registration/request is present. Do not give navigation steps for workspace data questions.'
            ].join('\n');
        };

        const workspaceContext = () => {
            const pageTitle = document.title || '';
            let label = 'public website';
            if (document.body?.dataset?.aiContext) label = document.body.dataset.aiContext;
            else if (/admin/i.test(pageTitle)) label = 'admin workspace';
            else if (/officer/i.test(pageTitle)) label = 'officer workspace';
            else if (document.getElementById('dashboardPage')?.classList.contains('active')) label = 'student workspace';
            return `${label}\n\n${workspaceDataSnapshot()}`;
        };

        const aiEndpoint = () => {
            const workerUrl = String(window.DAWAH_AI_WORKER_URL || '').trim();
            return workerUrl ? `${workerUrl.replace(/\/$/, '')}/chat` : '';
        };

        const aiHealthEndpoint = () => {
            const workerUrl = String(window.DAWAH_AI_WORKER_URL || '').trim();
            return workerUrl ? `${workerUrl.replace(/\/$/, '')}/health` : '';
        };

        const payloadQuestion = payload => {
            if (payload instanceof FormData) {
                return String(payload.get('message') || payload.get('question') || '').trim();
            }
            return String(payload?.message || payload?.question || '').trim();
        };

        const aiCooldownRemaining = () => {
            const lastAt = Number(localStorage.getItem('dawahAiLastRequestAt') || 0);
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
            localStorage.setItem('dawahAiLastRequestAt', String(Date.now()));
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
                    body: JSON.stringify({
                        ...payload,
                        system_instruction: `You are the UMMA University Dawah Team Assistant. 
                        You are currently helping a user in the ${workspaceContext()}.
                        1. For religious questions: Provide evidence from Quran/Sunnah.
                        2. For general questions: Be a helpful, professional polymath assistant.
                        3. If asked about the organization: Use your knowledge of Dawah Team goals (spiritual growth, welfare, education).
                        4. Pending officer role requests are reviewed by the main admin in the Admin Panel at admin.html under Role Requests, Pending Role Requests, or Members & Roles. Officers cannot approve pending roles from the Officer Portal.
                        5. For live external questions such as today's World Cup games, fixtures, scores, news, prices, or schedules, answer as a general live-information request. Do not send users to UMMA website pages unless they specifically ask where something is on the UMMA website.`
                    }),
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
                    ? 'Research AI could not connect from this link. Refresh this deployed link and try again; if it continues, redeploy the Cloudflare Worker allowlist.'
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
        window.addEventListener('dawah:workspace-settings-changed', syncWorkspaceAccess);
    }

    document.addEventListener('DOMContentLoaded', initializeAiChatWidget);
})();
