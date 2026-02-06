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

## TLS/SSL certificates (required)
Nginx expects your own certificates. Place them in `nginx/certs/` with these names:
- `progtalk.crt`
- `progtalk.key`

Example self-signed cert for local dev:
```
mkdir -p nginx/certs
openssl req -x509 -newkey rsa:2048 -nodes \
  -keyout nginx/certs/progtalk.key \
  -out nginx/certs/progtalk.crt \
  -days 365 \
  -subj "/CN=localhost"
```

For production, use a trusted CA certificate.

## Quick start (Docker)
Create `backend/.env`.
Add TLS certs (see section above).
Run:
```
docker compose up --build
```
App will be available at `https://localhost`.
