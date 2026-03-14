# Docker Compose Setup — main-app-referal

## Quick start

From this directory (`main-app-referal`):

```bash
docker compose up -d
```

No manual setup required. When all services are healthy:

- **App (React):** http://localhost:3000  
- **API (Express):** http://localhost:5000  
- **MongoDB:** localhost:27017 (for tools only; app uses it via the server)

---

## Files

| File | Purpose |
|------|--------|
| **docker-compose.yml** | Orchestrates MongoDB, Node server, React client (nginx) |
| **server/Dockerfile** | Node 20 Alpine, runs Express on port 5000 |
| **server/.dockerignore** | Keeps server build context small |
| **client/Dockerfile** | Multi-stage: Node build → nginx serves React + proxies `/api` and `/socket.io` |
| **client/nginx.conf** | Serves SPA on 3000, proxies to `server:5000` |
| **client/.dockerignore** | Keeps client build context small |
| **.env.example** | Optional env vars (e.g. `JWT_SECRET`, `GROQ_API_KEY`) |

---

## Service order

1. **mongo** — MongoDB 7, healthcheck then ready  
2. **server** — Depends on mongo healthy; healthcheck on `/api/health`  
3. **client** — Depends on server healthy; nginx serves build and proxies to server  

All use the `referus_network` bridge.

---

## Environment (optional)

Copy `.env.example` to `.env` and set:

```bash
JWT_SECRET=your-secret-here
# Optional: for AI chat fallback
# GROQ_API_KEY=your-groq-key
```

If `.env` is missing, defaults are used and the app still runs.

---

## Useful commands

```bash
# Status
docker compose ps

# Logs
docker compose logs -f
docker compose logs -f server

# Stop and remove containers + volumes
docker compose down -v
```

---

## Notes

- Server listens on `0.0.0.0:5000` so it’s reachable from the client container.  
- Client is built with `REACT_APP_API_URL=""` (relative `/api`) and `REACT_APP_SOCKET_URL=http://localhost:3000` so the browser talks to nginx, which proxies to the server.  
- MongoDB data is in named volumes `mongo_data` and `mongo_config` so it survives restarts.
