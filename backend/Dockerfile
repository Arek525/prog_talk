# ---------- Stage 1: build frontend ----------
FROM node:22 AS frontend-build
WORKDIR /app/frontend

COPY frontend/package*.json ./
RUN npm ci

COPY frontend ./
RUN npm run build


# ---------- Stage 2: install backend deps ----------
FROM node:22 AS backend-deps
WORKDIR /app/backend

COPY backend/package*.json ./
RUN npm ci --omit=dev


# ---------- Stage 3: runtime (one server: Express) ----------
FROM node:22
WORKDIR /app

ENV NODE_ENV=production

# Backend code + production node_modules
COPY backend ./backend
COPY --from=backend-deps /app/backend/node_modules ./backend/node_modules

# Built frontend (served by Express static)
COPY --from=frontend-build /app/frontend/dist ./frontend/dist

EXPOSE 443

CMD ["node", "backend/src/server.js"]
