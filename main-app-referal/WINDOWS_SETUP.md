# Running Referus.co Locally on Windows

What you need **before** cloning and running the app so you can open it in the browser.

---

## 1. Packages / software to install

| What | Why | Where to get it |
|------|-----|------------------|
| **Node.js** (v18 or higher; LTS recommended) | Runs both the React client and the Express server. npm is included. | https://nodejs.org — choose "LTS" and run the Windows installer. |
| **Git** | Clone the repo. | https://git-scm.com/download/win |
| **MongoDB** (local or cloud) | Backend stores users, leads, chat, etc. | **Option A:** Install [MongoDB Community](https://www.mongodb.com/try/download/community) on Windows. **Option B:** Use [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) (free tier) and use the connection string — no local install. |

**Optional (for AI chat fallback):**

| What | Why |
|------|-----|
| **Groq API key** | Free cloud LLM for the support chatbot when the knowledge base doesn’t match. Get one at https://console.groq.com and add `GROQ_API_KEY` to the server `.env`. |

---

## 2. After installing the above

### Clone the repo

```bash
git clone <your-repo-url>
cd ReferUsCo-Blitzy-Audit/main-app-referal
```

### Backend (server)

```bash
cd server
npm install
```

Create `server/.env` (copy from `server/env-example.txt`). Minimum:

```env
MONGODB_URI=mongodb://localhost:27017/referral-hub
# Or for Atlas: MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/referral-hub
JWT_SECRET=any-long-random-string-here
PORT=5000
CLIENT_URL=http://localhost:3000
```

If you use **MongoDB Atlas**, set `MONGODB_URI` to your Atlas connection string and you don’t need MongoDB installed locally.

Start the server:

```bash
npm run dev
```

Server runs at **http://localhost:5000**.

### Frontend (client)

Open a **second** terminal:

```bash
cd client
npm install
npm start
```

Client runs at **http://localhost:3000** and will open in your browser (or open that URL manually).

---

## 3. Summary checklist

- [ ] **Node.js** v18+ (and npm) installed  
- [ ] **Git** installed  
- [ ] **MongoDB** — local install **or** Atlas connection string in `server/.env`  
- [ ] Repo cloned, `server/.env` created  
- [ ] `cd server` → `npm install` → `npm run dev`  
- [ ] `cd client` → `npm install` → `npm start`  
- [ ] Browser: open **http://localhost:3000**

No other global packages (e.g. Python, Redis, Docker) are required to run and see the app in the browser. Optional: add `GROQ_API_KEY` to `server/.env` for the AI chat fallback.
