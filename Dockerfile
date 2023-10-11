FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json /app/

RUN npm install

COPY . .

ENV NODE_BUILD=true

RUN npm run build

FROM node:20-alpine as production

COPY --from=builder ./dist .

ENV NODE_ENV=production

EXPOSE 4000

CMD [ "node", "dist/main.js" ]