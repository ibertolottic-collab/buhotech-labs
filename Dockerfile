FROM node:20-alpine

WORKDIR /app

# Copiar configuración de dependencias de todos los niveles
COPY package*.json ./
COPY server/package*.json ./server/
COPY client/package*.json ./client/

# Instalar dependencias locales y subcarpetas
RUN npm run install:all

# Copiar el código fuente
COPY . .

# Compilar frontend para producción
RUN cd client && npm run build

# Exponer el puerto del servidor
EXPOSE 3001

# Comando para encender el servidor backend
CMD ["npm", "start"]
