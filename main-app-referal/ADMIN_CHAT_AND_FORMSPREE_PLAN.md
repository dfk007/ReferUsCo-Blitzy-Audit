# Plan: Admin Chat UI + Formspree Replacement

Two workstreams: (1) Admin panel chat UI, (2) Replace Formspree with a free, open-source form solution using the existing backend.

---

## Part 1 — Admin Chat UI

### Current state
- **Backend:** Already has chat API: `GET /api/chat/admin/users`, `GET /api/chat/conversations`, `GET /api/chat/messages/:userId`, `POST /api/chat/send` (all `protect`; admin can call with JWT).
- **Admin panel:** No chat section. `AdminPage` has Summary, Leads, Users, Earnings, Queries, Settings. No "Chat" or "Support inbox".
- **Client (user) chat:** Users get the floating ReferusChatbot widget; the old ChatPage is a short "use the widget" page. Legacy 1:1 chat (ChatMessage model) still exists and is used by the API.

### Goal
Add an Admin Chat section where admins can see users, open conversations, view message history, and reply using the existing chat API.

### Tasks

| # | Task | Details |
|---|------|--------|
| 1.1 | Add "Chat" to admin sidebar | In `AdminPage.js`, add a menu item (e.g. `{ id: 'chat', label: 'Chat / Support', icon: MessageCircle }`) and a `case 'chat'` in `renderContent()` that renders the new admin chat component. |
| 1.2 | Create `AdminChatView` (or `AdminChatManagement`) | New component under `components/Admin/`. Two main areas: (A) List of users (from `GET /api/chat/admin/users`) or list of conversations; (B) Selected conversation: message thread (from `GET /api/chat/messages/:userId`) and input to send (POST `/api/chat/send` with `receiverId` = selected user). Reuse styling from existing admin sections (cards, tables, primary buttons). |
| 1.3 | Wire API with admin auth | Use existing `api.js` (or axios with auth header from AuthContext). Ensure admin token is sent; backend already restricts `admin/users` to `role === 'admin'`. For `conversations`/`messages`/`send`, the backend uses `protect` and identifies the sender as the logged-in user (admin), so use same endpoints with admin logged in. |
| 1.4 | Optional: Admin-specific conversation list | If backend only has "current user's conversations", add an admin route e.g. `GET /api/chat/admin/conversations` that returns all conversations (or all with admin), so admin sees a single inbox. If not, admin can pick a user from `admin/users` and load messages with that user. |
| 1.5 | Match client chat UI where it helps | Reuse patterns from the client ChatPage/MessageList (bubbles, scroll to bottom, loading states). Keep layout consistent with other admin sections (sidebar + main content). |

### Deliverables
- Admin sidebar entry "Chat" (or "Support inbox").
- New admin component: user list + conversation thread + send message.
- All chat actions go through existing backend; no Formspree in admin chat.

---

## Part 2 — Replace Formspree with free, open-source form solution

### Approach: Use existing backend (no new SaaS)
- **Contact / support forms** → Already have `POST /api/queries` (Query model: name, email, subject, message). Admin sees these in **Queries** and can update status. No Formspree needed for submission; only need to stop sending to Formspree and send only to our API.
- **Lead form notification** → Formspree is used in AddLeadForm to "notify by email" then save lead via API. Replace with: (1) save lead via API only, and (2) either show new leads in Admin (already there) or add a simple optional email (e.g. Nodemailer + SMTP or a free tier like Resend) from the backend when a lead is created.
- **Dashboard support message** → Same as contact: send to `POST /api/queries` with a fixed subject (e.g. "Support Request from Dashboard") instead of Formspree.
- **"Contact us" link that opens Formspree** → Point to in-app contact form (scroll to form or open ContactForm modal) instead of `window.open('https://formspree.io/...')`.

No new third-party form service; use Express + MongoDB as the "free, open-source, enterprise-tier" form backend.

### Formspree usage (all in `main-app-referal`)

| Location | Current behavior | New behavior |
|----------|------------------|--------------|
| `ContactForm.js` | `POST` to Formspree | `POST` to `/api/queries` (same fields: name, email, subject, message). Use existing `queriesAPI.createQuery()` or direct axios. |
| `ContactPage.js` | `handleContactUsClick()` opens Formspree in new tab | Remove Formspree; e.g. scroll to in-page form or open ContactForm in modal / navigate to contact section. |
| `AddLeadForm.js` | First `POST` to Formspree (notification), then `POST` to `/api/leads` | Remove Formspree. Only `POST` to `/api/leads`. Optional: add backend "on lead create" hook to send one email (Nodemailer/Resend free tier) if you want email alerts. |
| `DashboardPage.js` | Support message `POST` to Formspree | `POST` to `/api/queries` with subject "Support Request from Dashboard", body = support message, name/email from logged-in user. |
| `FloatingChatButton.js` | Still has Formspree for live/offline messages | App now uses ReferusChatbot; FloatingChatButton may be unused. If still referenced anywhere, remove Formspree and either remove the component or point to ReferusChatbot / in-app support flow. |

### Tasks

| # | Task | Details |
|---|------|--------|
| 2.1 | ContactForm.js | Replace Formspree `fetch` with `queriesAPI.createQuery(formData)` (or axios `POST /api/queries`). Keep validation and success/error UI. |
| 2.2 | ContactPage.js | Change `handleContactUsClick()` to show in-app form (e.g. scroll to form, or set state to open ContactForm modal) instead of `window.open(Formspree)`. |
| 2.3 | AddLeadForm.js | Remove Formspree step. Submit only to `POST /api/leads` (already implemented). Optionally add backend email on lead create later. |
| 2.4 | DashboardPage.js | Replace Formspree support-message submit with `POST /api/queries` (name, email from user, subject "Support Request from Dashboard", message = support text). Use auth header for request. |
| 2.5 | FloatingChatButton.js | If still in use: remove Formspree, or remove component and ensure no imports. Confirm App uses only ReferusChatbot. |
| 2.6 | Backend (optional) | If you want email on new lead/query: add a small Nodemailer (or Resend) send in the route that creates the lead/query (env-based; skip if no SMTP configured). |

### Deliverables
- All form submissions go to your API only; zero Formspree calls.
- Contact and support messages stored in Query model; admins manage them in existing Queries section.
- Leads stored only via `/api/leads`; optional backend email for new leads if you add it later.

---

## Order of work

1. **Admin Chat UI** (Part 1) — so admin has a finished chat experience.
2. **Formspree replacement** (Part 2) — then switch all forms to the backend in one pass and remove Formspree.

---

## Summary

| Part | Outcome |
|------|--------|
| **Admin Chat UI** | New "Chat" section in admin panel; list users/conversations, view thread, send messages via existing chat API; UI consistent with rest of admin. |
| **Formspree replacement** | ContactForm, ContactPage CTA, AddLeadForm, Dashboard support form (and FloatingChatButton if used) all use backend only; no new SaaS; optional backend email for leads. |
