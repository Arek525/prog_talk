# ProgTalk

ProgTalk is a web forum application for programming discussions. It lets users create topics and posts (including code snippets), tag content, moderate discussions, and receive real-time notifications via WebSockets.

## What's inside
- `frontend/` — Vue 3 SPA (Vite) with forum views, topic pages, and admin/moderator panels.
- `backend/` — REST API + Socket.IO, JWT auth, forum logic, notifications, tests.
- `nginx/` — HTTPS reverse proxy, SPA hosting, `/api` and `/socket.io` routing.
- `docker-compose.yml` — MongoDB, backend, and nginx setup.

## Tech stack
- Node.js, Express 5
- MongoDB + Mongoose
- Socket.IO (real-time)
- JWT + Passport
- Vue 3, Vite, Pinia, Vue Router
- Axios, Highlight.js
- Nginx
- Docker / Docker Compose

## Configuration (.env)
The backend uses `backend/.env` (loaded by `docker-compose.yml`). Required variables:
- `MONGO_URI`
- `JWT_SECRET`
- `JWT_EXPIRES_IN`

## HTTPS certificates (local development)

This project uses **mkcert** for local trusted HTTPS certificates.

### 1) Install mkcert (Linux)
```bash
sudo apt update
sudo apt install -y mkcert libnss3-tools
mkcert -install
```

### 2) Generate/update certs and reload nginx
From project root:
```bash
chmod +x nginx/refresh-cert.sh
./nginx/refresh-cert.sh
```

What this script does:
- detects current host LAN IP,
- generates certs for: `localhost`, `127.0.0.1`, `::1`, and current LAN IP,
- writes files to:
  - `nginx/certs/progtalk.crt`
  - `nginx/certs/progtalk.key`
- rebuilds/restarts nginx (`docker compose up -d --build nginx`).

### 3) Access
- local machine: `https://localhost`
- another device in same network: `https://<your_current_lan_ip>`

### 4) Important when changing network
If your LAN IP changes (new Wi-Fi, hotspot, etc.), run again:
```bash
./nginx/refresh-cert.sh
```

## Quick start (Docker)
1. Create `backend/.env`.
2. Prepare HTTPS certs:
```bash
chmod +x nginx/refresh-cert.sh
./nginx/refresh-cert.sh
```
3. Start stack:
```bash
docker compose up --build
```

App will be available at `https://localhost`.
