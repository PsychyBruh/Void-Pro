FROM node:22-alpine


RUN apk add --no-cache git bash

WORKDIR /app

COPY package*.json ./

ENV NPM_CONFIG_CACHE=/tmp/.npm

RUN npm install --legacy-peer-deps

COPY . .



EXPOSE 7070

CMD ["npm", "start"]
