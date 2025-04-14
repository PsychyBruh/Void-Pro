FROM node:20-alpine

# Install necessary packages
RUN apk add --no-cache git bash

WORKDIR /app

COPY package*.json ./

ENV NPM_CONFIG_CACHE=/tmp/.npm

RUN npm install --legacy-peer-deps

COPY . .

# Removed this line:
# RUN npm run build

EXPOSE 7070

CMD ["npm", "start"]
