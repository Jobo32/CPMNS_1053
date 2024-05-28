#Utiliza una imagen base oficial de Node.js para la arquitectura amd64
FROM --platform=linux/amd64 node:18

#Establece el directorio de trabajo en el contenedor
WORKDIR /app

#Copia el package.json y package-lock.json (si existe)
COPY package*.json ./

#Instala las dependencias
RUN npm install

#Copia el resto de los archivos de tu aplicación
COPY . .

#Expone el puerto 8080
EXPOSE 8080

#Define el comando de inicio
CMD ["node", "server.js"]