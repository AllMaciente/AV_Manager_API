# ---------- build ----------
FROM node:22-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

# ---------- runtime ----------
FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Apenas dependências de produção: drizzle-kit (devDependency) fica fora da imagem.
COPY package*.json ./
RUN npm ci --omit=dev

# O dist já inclui a pasta drizzle/ (copiada no postbuild).
COPY --from=builder /app/dist ./dist

# o .env vai junto com a imagem (veja o aviso abaixo)
COPY .env ./.env

EXPOSE 3001
USER node

# as migrations são aplicadas no bootstrap da aplicação (src/main.ts)
CMD ["node", "dist/src/main.js"]
