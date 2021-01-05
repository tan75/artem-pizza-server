FROM node:fermium-alpine3.11

RUN mkdir -p /usr/src/app

WORKDIR /usr/src/app

COPY . .

RUN yarn install

EXPOSE 4000

CMD ["node", "server.js"]