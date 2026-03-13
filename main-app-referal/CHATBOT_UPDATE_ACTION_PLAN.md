# Chatbot Update Action Plan — main-app-referal

**Goal:** Replace current chat UX with a ReferusChatbot.jsx-style widget: **instant rule-based answers** for common questions + **100% free, cloud-based AI** fallback for edge cases.

---

## 1. Floating widget (replace current FloatingChatButton)

| # | Action | Details |
|---|--------|--------|
| 1.1 | **Port ReferusChatbot.jsx into client** | Add `ReferusChatbot.jsx` (or equivalent) under `client/src/components/Chat/` so the floating widget lives in main-app-referal. |
| 1.2 | **Swap in App.js** | In `App.js`, replace `<FloatingChatButton />` with the new chatbot widget component (e.g. `<ReferusChatbot />`). |
| 1.3 | **Match ReferusChatbot.jsx UI** | Preserve: launcher button (bottom-right), 370×560px window, green gradient header (#16a34a / #15803d), “Referus Support Chat” + “Online — typically replies instantly”, message bubbles (user right/green, bot left/white), typing indicator (3 bouncing dots), quick-reply chips (“What is Referus?”, “How does it work?”, “View pricing”, “See integrations”, “Reward types”, “Book a demo”), rounded input + send button, footer “Powered by Referus · AI-assisted support”. |
| 1.4 | **Reuse app styles** | Use existing `animations.css` (e.g. `animate-slide-in-up`, `animate-pulse`) and Tailwind where it fits; keep widget styling consistent with ReferusChatbot.jsx look. |

---

## 2. Instant responses (rule-based KB)

| # | Action | Details |
|---|--------|--------|
| 2.1 | **Copy REFERUS_KB into app** | Bring the full knowledge base from ReferusChatbot.jsx (all 11 categories: greetings, what_is, how_it_works, features, pricing, integrations, analytics, rewards, security, support, demo) into the new widget (or a shared `referusKb.js`). |
| 2.2 | **Copy QUICK_REPLIES** | Same 6 chips as ReferusChatbot.jsx, wired to KB entries. |
| 2.3 | **Implement matchKB()** | Pattern matcher: lowercase + trim user input, check each KB entry’s `patterns` for inclusion; return the matching `response` or `null`. Run this first on every user message so common inquiries get instant replies. |
| 2.4 | **Markdown-lite renderer** | Reuse the same logic as ReferusChatbot.jsx: **bold** (`**…**` → `<strong>`), bullet lines (• or -) with green bullet, line breaks. Use for both KB and AI replies. |

---

## 3. Free, cloud-based AI fallback

| # | Action | Details |
|---|--------|--------|
| 3.1 | **Remove Anthropic/paid dependency** | Do not call Anthropic Claude from the client. Replace with a 100% free, cloud-based option (e.g. Groq free tier, or another free LLM API that fits “like Ollama cloud models”). |
| 3.2 | **Add server-side AI proxy** | Create a small server route (e.g. `POST /api/chat/ai` or under existing `server/routes/chat.js`) that receives `{ messages }`, calls the chosen free cloud LLM, and returns `{ reply }`. This keeps API keys off the client and allows switching providers later. |
| 3.3 | **Wire widget to proxy** | When `matchKB()` returns `null`, send conversation history to the new `/api/chat/ai` endpoint; display returned reply. On proxy/API failure, show the same fallback as ReferusChatbot.jsx: “I’m not sure about that one! You can reach our team at **support@referus.co** or browse our docs at **docs.referus.co**.” |
| 3.4 | **System prompt** | Mirror ReferusChatbot.jsx: Referus support assistant, concise (<150 words), bullet points, Referus-focused (features, pricing, onboarding, integrations, referral best practices); politely redirect off-topic. |

**Suggested free cloud options (pick one for 3.1–3.2):**  
- **Groq** (free tier, fast inference)  
- **Ollama** (if you host or use an Ollama cloud endpoint and expose it via your server)  
- **Other free LLM APIs** (e.g. Hugging Face Inference API free tier, or provider of your choice) — ensure “cloud-based” and no client-side API keys.

---

## 4. Chat page and legacy chat

| # | Action | Details |
|---|--------|--------|
| 4.1 | **ChatPage.js** | Either (A) remove or redirect `/chat` to a simple “Support” page that only explains “Use the chat bubble in the corner” and links to the widget, or (B) keep a minimal ChatPage that shows the same widget inlined (optional). Prefer (A) to avoid maintaining two chat UIs. |
| 4.2 | **Legacy chat API** | Leave `server/routes/chat.js` and Socket.IO in place for now (no breaking changes). Optionally deprecate later once the widget is the only support entry point. |
| 4.3 | **Navigation** | Update any “Chat” nav links to point to the new support flow (e.g. open widget or support page) instead of the old conversation list. |

---

## 5. Testing and docs

| # | Action | Details |
|---|--------|--------|
| 5.1 | **Test KB coverage** | For each quick-reply and a set of natural phrasings per category, confirm instant KB response and correct formatting. |
| 5.2 | **Test AI fallback** | Ask a question that doesn’t match KB (e.g. “How do I set up a custom reward?”); confirm AI reply and failure fallback. |
| 5.3 | **Env vars** | Document any new env vars (e.g. `AI_PROVIDER`, `GROQ_API_KEY` or `OLLAMA_API_URL`) in `env-example.txt` / `env.example` and use them only on the server. |
| 5.4 | **Tech spec** | Update tech_spec.md to state that the in-app chat is the ReferusChatbot-style widget with rule-based KB + free cloud-based AI fallback (and remove or qualify Claude-specific references). |

---

## To-do checklist (summary)

- [x] Port ReferusChatbot.jsx (or equivalent) into `client/src/components/Chat/`.
- [x] Replace `FloatingChatButton` with new widget in `App.js`.
- [x] Match ReferusChatbot.jsx UI (green theme, chips, bubbles, typing indicator, footer).
- [x] Add REFERUS_KB + QUICK_REPLIES + matchKB() + markdown renderer.
- [x] Add server route for AI (e.g. `POST /api/chat/ai`) using a free cloud LLM (Groq).
- [x] Wire widget to call KB first, then AI proxy on no match; handle errors with static fallback.
- [x] Simplify or redirect ChatPage and nav so widget is the primary support chat.
- [ ] Test KB and AI paths; document env vars; update tech_spec.md (env vars documented in `server/env-example.txt`).

---

**Result:** One floating chat that looks and behaves like ReferusChatbot.jsx, gives instant answers for common inquiries from the KB, and uses a 100% free, cloud-based AI for everything else.
