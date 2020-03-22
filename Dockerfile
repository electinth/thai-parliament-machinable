FROM node:13-alpine

RUN mkdir -p /home/node/app
WORKDIR /home/node/app

COPY package*.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src src
CMD ["npm",  "start"]
