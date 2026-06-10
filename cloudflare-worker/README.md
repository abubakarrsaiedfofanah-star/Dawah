# UMMA Da'awah Groq AI Worker

This Cloudflare Worker handles Groq AI requests for the Firebase-hosted app without exposing the API key in frontend code.

## Deploy

1. Login to Cloudflare:

```powershell
npx wrangler login
```

2. Add the Groq key as a Worker secret:

```powershell
npx.cmd wrangler secret put GROQ_API_KEY
```

Paste the Groq key when Wrangler asks for it. Do not put the key in frontend code.

3. Optional, but recommended for current/latest research: add a Brave Search API key:

```powershell
npx.cmd wrangler secret put BRAVE_SEARCH_API_KEY
```

Without this key, the Worker can still answer with Groq, but it cannot fetch live/current web results.

## Limits

- Daily AI limit: controlled by `DAILY_AI_LIMIT`; use `0` for no Worker daily cap.
- Browser cooldown: 1.5 seconds between requests.
- Question length: 8000 characters.
- Voice upload: 25MB.
- Chat response budget: 1000 tokens for normal answers, 2200 tokens for long/deep/Islamic answers.
- Browser request timeout: 60 seconds.

4. Deploy:

```powershell
npx.cmd wrangler deploy
```

5. Copy the deployed Worker URL. It will look like:

```text
https://umma-dawaah-groq-ai.<your-subdomain>.workers.dev
```

6. Put that URL into the website config as `DAWAAH_AI_WORKER_URL`.
