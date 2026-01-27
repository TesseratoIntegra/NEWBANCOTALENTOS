FROM node:22-alpine

WORKDIR /app

# Copia arquivos de dependências
COPY package.json package-lock.json ./

# Instala dependências
RUN npm ci

# Copia o resto do código
COPY . .

EXPOSE 3000

# Modo desenvolvimento com hot-reload
CMD ["npm", "run", "dev"]
