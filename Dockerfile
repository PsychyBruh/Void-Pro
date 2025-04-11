# FROM node:18-alpine
FROM node:20-alpine

# Install git & bash (still needed for npm + Git deps)
RUN apk add --no-cache git bash

WORKDIR /app

COPY package*.json ./

ENV NPM_CONFIG_CACHE=/tmp/.npm

RUN npm install --legacy-peer-deps

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["npm", "start"]
