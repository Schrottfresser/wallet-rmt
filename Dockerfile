FROM node:22-alpine AS base
ENV CI=true
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN corepack enable

COPY . /app
WORKDIR /app


FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod


FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build


FROM base
RUN mkdir -p /var/lib/wallet-rmt /var/log/wallet-rmt /run/wallet-rmt
RUN chown node:node /var/lib/wallet-rmt /var/log/wallet-rmt /run/wallet-rmt
RUN chmod 700 /var/lib/wallet-rmt /run/wallet-rmt && \
    chmod 755 /var/log/wallet-rmt

USER node
COPY --from=deps --chown=node:node /app/node_modules /app/node_modules
COPY --from=build --chown=node:node /app/dist /app/dist

ENV NODE_ENV=production
EXPOSE 8080

CMD ["pnpm", "serve"]
