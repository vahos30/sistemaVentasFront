FROM node:20-alpine 

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de tu aplicación al contenedor
COPY package.json package-lock.json ./
COPY .env.production .env.production
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación
RUN npm run build

# Expone el puerto 3002
EXPOSE 3002

# Inicia la aplicación en modo producción
CMD ["npm", "start"]