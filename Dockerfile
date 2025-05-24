# Usar Node.js 22 (coincide con tu versión local v22.15.1)
FROM node:22-alpine

# Instalar dependencias del sistema para compilar módulos nativos (bcrypt)
RUN apk add --no-cache python3 make g++

# Crear directorio de trabajo
WORKDIR /app

# Copiar package.json y package-lock.json
COPY package*.json ./

# Instalar dependencias
RUN npm ci

# Copiar todo el código fuente PRIMERO
COPY . .

# Exponer puerto 3600 (tu puerto específico)
EXPOSE 3600

# Comando para ejecutar (basado en tu package.json)
CMD ["npm", "run", "dev"]