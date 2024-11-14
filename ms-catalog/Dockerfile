# Usar una imagen base de Node.js
FROM node:14

# Establecer el directorio de trabajo
WORKDIR /app

# Copiar los archivos de package.json y package-lock.json
COPY package*.json ./

# Instalar las dependencias
RUN npm install

# Copiar el resto de los archivos de la aplicación
COPY . .

# Compilar TypeScript a JavaScript
RUN npm run build

# Exponer el puerto en el que la aplicación se ejecutará
EXPOSE 4000

# Comando para ejecutar la aplicación
CMD ["npm", "start"]