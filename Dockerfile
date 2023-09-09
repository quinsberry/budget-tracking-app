FROM node:20-alpine as builder

WORKDIR /app

COPY package*.json /app/

RUN npm ci

COPY . .

ENV NODE_BUILD=true

RUN npm run build

FROM node:20-alpine as production

COPY --from=builder ./build .

ENV NODE_ENV=production

EXPOSE 3000

CMD node ./build