FROM node:22-bookworm-slim AS builder

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

RUN apt-get update && apt-get install -y python3 make g++ && \
    npm run build && \
    apt-get purge -y python3 make g++ && \
    rm -rf /var/lib/apt/lists/*

FROM node:22-bookworm-slim

WORKDIR /app

RUN mkdir -p /app/data

COPY --from=builder /app/dist ./dist
COPY --from=builder /app/server ./server
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000
ENV DATA_DIR=/app/data
ARG GOOGLE_BOOKS_API_KEY
ENV GOOGLE_BOOKS_API_KEY=${GOOGLE_BOOKS_API_KEY:-}
ARG AUTH_USERNAME
ENV AUTH_USERNAME=${AUTH_USERNAME}
ARG AUTH_PASSWORD
ENV AUTH_PASSWORD=${AUTH_PASSWORD}

LABEL org.opencontainers.image.source="https://github.com/sergius02/tsundoku-manga"
LABEL org.opencontainers.image.description="Tsundoku manga collection manager"
LABEL org.opencontainers.image.licenses="AGPL-3.0"

VOLUME [ "/app/data" ]

CMD ["node", "server/index.js"]