FROM node:20-alpine As base
RUN npm install -g pnpm
WORKDIR /app
COPY --chown=node:node package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY --chown=node:node . .
RUN sed -i '11,14d' ./src/shared/prisma/schema.prisma
RUN pnpm prisma:generate

FROM base as builder
WORKDIR /app
COPY --chown=node:node package.json pnpm-lock.yaml ./
COPY --chown=node:node --from=base /app/node_modules ./node_modules
COPY --chown=node:node . .
RUN pnpm build

FROM base As production
WORKDIR /app
COPY --chown=node:node --from=builder /app/node_modules ./node_modules
COPY --chown=node:node dist ./dist
ENV NODE_ENV=production
EXPOSE 4000
CMD [ "node", "dist/main.js" ]
