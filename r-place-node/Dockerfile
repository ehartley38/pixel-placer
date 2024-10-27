ARG NODE_VERSION=20-bookworm-slim
FROM node:${NODE_VERSION} as base

WORKDIR /app

ENV NODE_ENV="production"

FROM base as build

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install
RUN npm install pm2 -g

COPY . .

EXPOSE 8080
CMD ["npm", "run", "start"]