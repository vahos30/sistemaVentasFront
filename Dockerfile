FROM node:20-alpine 

# Establece el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de tu aplicación al contenedor
COPY package.json package-lock.json ./
RUN npm install

# Copia el resto de la aplicación
COPY . .

# Construye la aplicación
RUN npm run build

# Expone el puerto 3000
EXPOSE 3000

# Inicia la aplicación en modo producción
CMD ["npm", "start"]
