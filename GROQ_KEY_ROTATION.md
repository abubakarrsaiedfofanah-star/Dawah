# Groq Key Rotation

The Groq key was previously pasted into chat, so it should be replaced.

## Rotate Safely

1. Open Groq Console:

```text
https://console.groq.com/keys
```

2. Create a new API key.
3. Copy it one time.
4. Update Cloudflare Worker secret:

```powershell
cd "C:\Users\gues\Desktop\Dawa'ah\cloudflare-worker"
npx.cmd wrangler secret put GROQ_API_KEY
```

Paste the new Groq key when Wrangler asks.

5. Deploy the Worker:

```powershell
npx.cmd wrangler deploy
```

6. Confirm `ai_worker_config.js` still points at the deployed Worker URL.
7. Delete/revoke the old Groq key in Groq Console.

Do not put the Groq key in any frontend file.
