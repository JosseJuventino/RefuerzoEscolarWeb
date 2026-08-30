# Imagen de desarrollo.
FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# --force por conflictos de peer deps en el árbol de React 18.
COPY package.json package-lock.json ./
RUN npm ci --force

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
