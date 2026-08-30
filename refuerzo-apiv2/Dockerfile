# Imagen de desarrollo. bookworm y no alpine: sharp y bcrypt traen binarios
# precompilados para glibc.
FROM node:22-bookworm-slim

RUN apt-get update \
    && apt-get install -y --no-install-recommends python3 make g++ ca-certificates \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Este proyecto no tiene package-lock.json, por eso install y no ci.
COPY package.json ./
RUN npm install --no-package-lock

COPY . .

EXPOSE 3005

CMD ["npm", "run", "start:dev"]
