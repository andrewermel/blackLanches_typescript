# 🟢 Node.js base image
FROM node:20-alpine

# 📁 Define pasta de trabalho
WORKDIR /app/frontend

# 📦 Copia package.json e instala dependências
COPY package*.json ./
RUN npm install

# 📦 Copia o código-fonte
COPY . .

# 🔨 Build da aplicação Vite
RUN npm run build

# 🚀 Usa imagem leve para servir
FROM node:20-alpine

# 📁 Pasta de trabalho
WORKDIR /app/frontend

# 📦 Instala servidor estático
RUN npm install -g serve

# 📋 Copia arquivos de build da etapa anterior
COPY --from=0 /app/frontend/dist ./dist

# 🏃 Comando para servir a aplicação
CMD ["serve", "-s", "dist", "-l", "5173"]

# 📍 Expõe porta do frontend
EXPOSE 5173
