FROM node:22-alpine AS base

FROM base AS deps
RUN corepack enable

WORKDIR /home/node/app
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile --prod

FROM base AS build
RUN corepack enable

RUN mkdir -p /home/node/app/node_modules && chown -R node:node /home/node/app
WORKDIR /home/node/app
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm fetch --frozen-lockfile
RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM base
USER node

WORKDIR /home/node/app
COPY --from=deps --chown=node:node /home/node/app/node_modules /home/node/app/node_modules
COPY --from=build --chown=node:node /home/node/app/dist /home/node/app/dist

ENV NODE_ENV=production
CMD ["node", "./dist/server/index.js"]

EXPOSE 8080