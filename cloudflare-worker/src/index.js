const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'cache-control': 'no-store'
};

function corsHeaders(request, env) {
  const origin = request.headers.get('origin') || '';
  return isAllowedOrigin(origin, env) ? {
    'access-control-allow-origin': origin,
    'access-control-allow-methods': 'GET, POST, OPTIONS',
    'access-control-allow-headers': 'content-type, authorization, x-requested-with, x-csrf-token',
    'access-control-max-age': '86400',
    'vary': 'Origin'
  } : { 'vary': 'Origin' };
}

function allowedOrigins(env) {
  const defaults = [
    'https://66ghz.com',
    'https://www.66ghz.com',
    'http://localhost:8000',
    'http://127.0.0.1:8000'
  ];
  return `${defaults.join(',')},${String(env.ALLOWED_ORIGIN || '')}`
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .filter((item, index, list) => list.indexOf(item) === index);
}

function isAllowedOrigin(origin, env) {
  if (!origin) return false;
  if (allowedOrigins(env).includes(origin)) return true;
  try {
    const host = new URL(origin).hostname;
    return host === '66ghz.com'
      || host === 'www.66ghz.com'
      || host.endsWith('.vercel.app')
      || host === 'localhost'
      || host === '127.0.0.1';
  } catch (error) {
    return false;
  }
}

function jsonResponse(request, env, status, body) {
  return new Response(JSON.stringify({
    success: status >= 200 && status < 300,
    ...body,
    timestamp: new Date().toISOString()
  }), {
    status,
    headers: { ...JSON_HEADERS, ...corsHeaders(request, env) }
  });
}

function getClientIp(request) {
  return request.headers.get('cf-connecting-ip') || 'unknown';
}

async function enforceRateLimit(request, env) {
  if (!env.AI_RATE_LIMIT) return null;
  const today = new Date().toISOString().slice(0, 10);
  const key = `ai:${today}:${getClientIp(request)}`;
  const limit = Number(env.DAILY_AI_LIMIT || 60);
  if (limit <= 0) return null;
  const current = Number(await env.AI_RATE_LIMIT.get(key) || '0');
  if (current >= limit) {
    return `Daily AI limit reached (${limit}). Please try again tomorrow.`;
  }
  await env.AI_RATE_LIMIT.put(key, String(current + 1), { expirationTtl: 36 * 60 * 60 });
  return null;
}

async function parseRequest(request) {
  const contentType = request.headers.get('content-type') || '';
  if (contentType.includes('multipart/form-data')) {
    const form = await request.formData();
    return {
      message: String(form.get('message') || ''),
      context: String(form.get('context') || ''),
      mode: String(form.get('mode') || 'groq_chat'),
      audio: form.get('audio')
    };
  }
  const data = await request.json().catch(() => ({}));
  return {
    message: String(data.message || data.question || ''),
    context: String(data.context || ''),
    mode: String(data.mode || 'groq_chat'),
    audio: null
  };
}

async function transcribeAudio(audio, env) {
  if (!audio || typeof audio.arrayBuffer !== 'function') return { transcript: '', model: '' };
  if (audio.size > 25 * 1024 * 1024) {
    throw new Error('Audio must be 25MB or smaller.');
  }

  const form = new FormData();
  form.append('model', env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo');
  form.append('file', audio, audio.name || 'voice-question.webm');
  form.append('response_format', 'json');

  const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
    method: 'POST',
    headers: { authorization: `Bearer ${env.GROQ_API_KEY}` },
    body: form
  });
  const text = await response.text();
  const json = JSON.parse(text || '{}');
  if (!response.ok) {
    throw new Error(json?.error?.message || text.slice(0, 180) || 'Voice transcription failed.');
  }
  const transcript = String(json.text || '').trim();
  if (!transcript) throw new Error('No speech was detected in the voice message.');
  return { transcript, model: env.GROQ_TRANSCRIBE_MODEL || 'whisper-large-v3-turbo' };
}

function liveSearchEnabled(env) {
  return Boolean(String(env.BRAVE_SEARCH_API_KEY || '').trim());
}

function shouldUseLiveSearch(question, mode) {
  return mode === 'deep' || wantsFreshInformation(question);
}

function searchFreshnessWindow(question) {
  const text = String(question || '').toLowerCase();
  if (/\b(today|now|right now|live|real[-\s]?time|breaking|latest news|news|price|prices|score|scores)\b/.test(text)) return 'pd';
  if (/\b(this week|weekly|recent|deadline|schedule)\b/.test(text)) return 'pw';
  if (/\b(this month|monthly|current law|current laws|law|laws|legal|regulation|regulations|statistics|stats|data|2026)\b/.test(text)) return 'py';
  return '';
}

async function liveWebSearch(question, env) {
  const key = String(env.BRAVE_SEARCH_API_KEY || '').trim();
  if (!key) return { enabled: false, sources: [], note: 'BRAVE_SEARCH_API_KEY is not configured.' };

  const query = String(question || '').replace(/\s+/g, ' ').trim().slice(0, 300);
  if (!query) return { enabled: true, sources: [], note: 'No search query was provided.' };

  const url = new URL('https://api.search.brave.com/res/v1/web/search');
  url.searchParams.set('q', query);
  url.searchParams.set('count', '5');
  url.searchParams.set('safesearch', 'moderate');
  const freshness = searchFreshnessWindow(question);
  if (freshness) url.searchParams.set('freshness', freshness);

  const response = await fetch(url.toString(), {
    headers: {
      accept: 'application/json',
      'x-subscription-token': key
    }
  });
  const text = await response.text();
  const json = JSON.parse(text || '{}');
  if (!response.ok) {
    return {
      enabled: true,
      sources: [],
      note: json?.error?.message || text.slice(0, 180) || 'Live search failed.'
    };
  }

  const sources = (json?.web?.results || []).slice(0, 5).map(item => ({
    title: String(item.title || '').replace(/\s+/g, ' ').trim().slice(0, 140),
    url: String(item.url || '').trim(),
    description: String(item.description || (item.extra_snippets || []).join(' ') || '').replace(/\s+/g, ' ').trim().slice(0, 320),
    age: String(item.age || '').trim()
  })).filter(item => item.title && item.url);

  return {
    enabled: true,
    sources,
    note: sources.length ? '' : 'No live search results were returned.'
  };
}

function formatLiveSourcesForPrompt(sources) {
  if (!sources.length) return 'No live sources were returned.';
  return sources.map((source, index) => {
    const age = source.age ? `\nAge: ${source.age}` : '';
    return `[${index + 1}] ${source.title}\nURL: ${source.url}\nSnippet: ${source.description || 'No snippet provided.'}${age}`;
  }).join('\n\n');
}

async function answerQuestion(question, context, mode, env) {
  const wantsLong = wantsLongAnswer(question, mode);
  const wantsFresh = wantsFreshInformation(question);
  const instant = instantAnswer(question, mode);
  if (instant && !wantsLong) return { answer: instant, model: 'instant-cache' };

  const model = env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant';
  const currentDate = new Date().toISOString().slice(0, 10);
  const modeText = {
    quick: 'Give a useful answer with a short summary, key points, and practical next steps.',
    deep: 'Create a structured research brief with context, analysis, key points, examples, risks, and a practical conclusion.',
    islamic: 'Create a careful Islamic research note with evidence points, respectful wording, practical guidance, and a reminder to verify rulings with qualified scholars.',
    groq_chat: 'Give a strong, practical answer with headings, bullets, examples, and action steps.'
  }[mode] || 'Give a strong, practical answer with headings, bullets, examples, and action steps.';

  const liveSearch = shouldUseLiveSearch(question, mode)
    ? await liveWebSearch(question, env).catch(error => ({
      enabled: liveSearchEnabled(env),
      sources: [],
      note: error?.message || 'Live search failed.'
    }))
    : { enabled: false, sources: [], note: '' };
  const hasLiveSources = liveSearch.sources.length > 0;

  const freshnessNote = wantsFresh
    ? hasLiveSources
      ? `The user is asking for latest/current information. Use the live search sources below, cite them as [1], [2], etc., include source links where useful, and state that the answer is based on sources available as of ${currentDate}.`
      : liveSearch.enabled
        ? `The user is asking for latest/current information. Live search was attempted but no usable source was returned (${liveSearch.note || 'no details'}). Say this clearly, give the best stable guidance, and tell the user what official source to verify as of ${currentDate}.`
        : `The user is asking for latest/current information. Live search is not connected yet. Say clearly that live updates require the search API key, then give the best stable guidance and what to verify as of ${currentDate}.`
    : `Use stable knowledge and mention today's date (${currentDate}) only when it helps.`;

  const verificationNote = /\b(law|laws|legal|regulation|regulations|price|prices|statistics|stats|data)\b/i.test(question)
    ? `For law, legal, price, statistics, or data questions, prefer official or primary sources when available and warn the user to verify the current value or rule as of ${currentDate}.`
    : '';
  const websiteHelpNote = [
    "Website guidance: The UMMA University Dawah Team website has public sections for Home, About Us, What We Do, Activities, Our Leadership, Gallery, Contact Us, and Open Portals.",
    'The portals include Student Login/Register, Officer Access, and Admin Login.',
    'Student workspace tasks include profile and registration details, resources/research, welfare requests, activities, reports, settings, and the digital membership card.',
    'Officer/admin workspaces include managing members, activities, welfare, resources, gallery/media, hadith content, reports, settings, and system checks depending on role.',
    'When users ask how to use the website, give clear step-by-step navigation using the labels they can see on the page. Do not invent unavailable buttons or private permissions.'
  ].join(' ');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.GROQ_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: [
            "You are the UMMA University Dawah Team advanced research assistant.",
            'You are also a friendly website guide. Help visitors, students, officers, and admins understand how to use the website, find pages, open the correct portal, register or log in, submit requests, use workspace tools, and know who to contact.',
            'Help students, officers, and admins with research, reports, planning, announcements, welfare notes, event ideas, Islamic learning, administrative drafts, and practical website navigation.',
            'Prefer high-quality structured answers over very short replies.',
            'Use headings, bullet points, examples, and action steps when useful.',
            'Use provided live search results when present. If no live search results are provided, do not claim live browsing or real-time updates.',
            'If Islamic rulings are involved, be careful and remind the user to verify with qualified scholars.'
          ].join(' ')
        },
        {
          role: 'user',
          content: `${modeText}\n${freshnessNote}\n${verificationNote}\n${websiteHelpNote}\n\nLive search results:\n${formatLiveSourcesForPrompt(liveSearch.sources)}\n\nWorkspace context: ${context || 'general'}\n\nQuestion:\n${question}`
        }
      ],
      temperature: 0.4,
      max_completion_tokens: wantsLong || mode === 'deep' || mode === 'islamic' ? 2200 : 1000
    })
  });
  const text = await response.text();
  const json = JSON.parse(text || '{}');
  if (!response.ok) {
    throw new Error(json?.error?.message || text.slice(0, 180) || 'Groq request failed.');
  }
  const answer = String(json?.choices?.[0]?.message?.content || '').trim();
  if (!answer) throw new Error('No answer was returned by Groq.');
  return {
    answer,
    model,
    sources: liveSearch.sources,
    live_search: hasLiveSources,
    live_search_note: liveSearch.note
  };
}

async function suggestHadithArabic(english, reference, env) {
  const cleanEnglish = String(english || '').trim();
  const cleanReference = String(reference || '').trim();
  if (!cleanEnglish) throw new Error('English translation is required.');
  if (cleanEnglish.length > 4000) throw new Error('English text is too long for one suggestion.');

  const model = env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant';
  const prompt = [
    'Suggest a polished Arabic rendering of this English hadith translation for review by the Imam, Amir/Director, or admin.',
    '',
    'Important rules:',
    '- Return Arabic text only.',
    '- Do not claim this is the original hadith wording.',
    '- Preserve Islamic terms respectfully.',
    '- Prefer clear fusha Arabic, with correct diacritics only where helpful.',
    '- If the English is a known short hadith translation, give the most natural Arabic rendering but still do not claim verification.',
    '- If the reference is useful, use it only for context.',
    '',
    `Reference: ${cleanReference || 'Not provided'}`,
    '',
    `English translation:\n${cleanEnglish}`
  ].join('\n');

  const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      authorization: `Bearer ${env.GROQ_API_KEY}`,
      'content-type': 'application/json'
    },
    body: JSON.stringify({
      model,
      messages: [
        {
          role: 'system',
          content: 'You help Islamic content editors draft polished Arabic renderings for review. Return only Arabic text. Never present the output as the verified original hadith wording.'
        },
        { role: 'user', content: prompt }
      ],
      temperature: 0.2,
      max_completion_tokens: 220
    })
  });
  const text = await response.text();
  const json = JSON.parse(text || '{}');
  if (!response.ok) {
    throw new Error(json?.error?.message || text.slice(0, 180) || 'Arabic suggestion failed.');
  }
  const arabic = String(json?.choices?.[0]?.message?.content || '').trim();
  if (!arabic) throw new Error('No Arabic suggestion was returned.');
  return { arabic, model };
}

function instantAnswer(question, mode) {
  if (mode === 'deep' || mode === 'islamic') return '';
  const text = String(question || '').toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim();
  const answers = [
    {
      test: /^(what is |define |meaning of )?dawah$|what is dawah|meaning of dawah|define dawah/,
      answer: "Dawah is inviting people to understand Islam and its values with wisdom, good character, and kindness. It includes teaching, answering questions, and representing Islam through sincere conduct."
    },
    {
      test: /^(what is |define |meaning of )?salah$|what is salah|meaning of salah/,
      answer: "Salah is the prescribed Muslim prayer performed at set times each day. It connects a Muslim with Allah through worship, recitation, bowing, and prostration."
    },
    {
      test: /^(what is |define |meaning of )?zakat$|what is zakat|meaning of zakat/,
      answer: "Zakat is an obligatory charity in Islam given from eligible wealth to support the poor and other rightful recipients. It purifies wealth and strengthens community care."
    },
    {
      test: /^(what is |define |meaning of )?hadith$|what is hadith|meaning of hadith/,
      answer: "A hadith is a recorded statement, action, approval, or description of Prophet Muhammad, peace be upon him. Hadiths help Muslims understand and practice Islam alongside the Qur'an."
    }
  ];
  const found = answers.find(item => item.test.test(text));
  return found ? found.answer : '';
}

function wantsLongAnswer(question, mode) {
  if (mode === 'deep') return true;
  const text = String(question || '').toLowerCase();
  return /\b(long|detailed|detail|explain fully|full explanation|essay|report|research brief|write more|more explanation|comprehensive|in depth|in-depth|paragraphs|presentation)\b/.test(text);
}

function wantsFreshInformation(question) {
  const text = String(question || '').toLowerCase();
  return /\b(latest|current|currently|today|now|right now|this week|this month|this year|update|updates|news|recent|live|real[-\s]?time|price|prices|score|scores|schedule|deadline|law|laws|legal|regulation|regulations|source|sources|link|links|research|statistics|stats|data|dataset|datasets|2026)\b/.test(text);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders(request, env) });
    }
    if (request.method === 'GET' && url.pathname === '/health') {
      return jsonResponse(request, env, 200, {
        message: 'AI Worker online',
        data: {
          ok: true,
          model: env.GROQ_CHAT_MODEL || 'llama-3.1-8b-instant',
          rate_limit: Boolean(env.AI_RATE_LIMIT),
          live_search: liveSearchEnabled(env)
        }
      });
    }
    if (request.method !== 'POST') {
      return jsonResponse(request, env, 405, { message: 'Only POST requests are allowed.' });
    }

    const origin = request.headers.get('origin') || '';
    if (!isAllowedOrigin(origin, env)) {
      return jsonResponse(request, env, 403, { message: 'This AI endpoint is only allowed from the official website.' });
    }
    if (!env.GROQ_API_KEY) {
      return jsonResponse(request, env, 500, { message: 'GROQ_API_KEY is not configured in Cloudflare Worker secrets.' });
    }

    const limited = await enforceRateLimit(request, env);
    if (limited) return jsonResponse(request, env, 429, { message: limited });

    try {
      if (url.pathname === '/hadith-arabic') {
        const data = await request.json().catch(() => ({}));
        const result = await suggestHadithArabic(data.english, data.reference, env);
        return jsonResponse(request, env, 200, {
          message: 'Arabic suggestion generated',
          data: {
            arabic: result.arabic,
            model: result.model,
            warning: 'Suggested Arabic only. Please verify against the original hadith source before saving.'
          }
        });
      }

      const input = await parseRequest(request);
      const typedMessage = input.message.trim();
      const voice = await transcribeAudio(input.audio, env);
      const question = voice.transcript
        ? (typedMessage ? `${typedMessage}\n\nVoice transcript:\n${voice.transcript}` : voice.transcript)
        : typedMessage;
      if (!question) {
        return jsonResponse(request, env, 400, { message: 'Please type or record a question first.' });
      }
      if (question.length > 8000) {
        return jsonResponse(request, env, 400, { message: 'Please keep your question under 8000 characters.' });
      }

      const result = await answerQuestion(question, input.context, input.mode, env);
      return jsonResponse(request, env, 200, {
        message: 'Research completed',
        data: {
          answer: result.answer,
          model: result.model,
          transcript: voice.transcript,
          transcribe_model: voice.model,
          sources: result.sources || [],
          live_search: Boolean(result.live_search),
          live_search_note: result.live_search_note || '',
          mode: input.mode || 'groq_chat'
        }
      });
    } catch (error) {
      return jsonResponse(request, env, 502, {
        message: error?.message || 'The research AI could not answer right now.'
      });
    }
  }
};
