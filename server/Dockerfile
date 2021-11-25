FROM node:16-alpine3.12

WORKDIR /usr/src/app

COPY ./package.json ./

COPY ./package-lock.json ./


RUN npm install

COPY . .

EXPOSE 5000

CMD ["npm","start"]