FROM node:22-alpine AS build

WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci

COPY server ./server
COPY scripts/build-server.mjs ./scripts/build-server.mjs
RUN node scripts/build-server.mjs

FROM node:22-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/dist-server ./dist-server

EXPOSE 3000
CMD ["node", "dist-server/server.mjs"]
