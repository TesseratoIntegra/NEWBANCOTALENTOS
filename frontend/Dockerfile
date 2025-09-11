FROM node:22-alpine

WORKDIR /app

# Instala dependências de produção
COPY package.json package-lock.json ./
RUN npm ci

# Copia o código e gera o build
COPY . .
RUN npm run build

EXPOSE 3000
ENV NODE_ENV=production

CMD ["npm", "run", "start"]
