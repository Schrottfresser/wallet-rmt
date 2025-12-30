FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV CI=true

RUN corepack enable
RUN addgroup -g 10001 wallet-rmt
RUN adduser -u 10001 -G wallet-rmt -D wallet-rmt

COPY . /app
WORKDIR /app


FROM base AS deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --prod


FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm build


FROM base
RUN mkdir -p /var/lib/wallet-rmt /var/log/wallet-rmt
RUN chown 10001:10001 /var/lib/wallet-rmt /var/log/wallet-rmt

USER wallet-rmt
COPY --from=deps --chown=wallet-rmt:wallet-rmt /app/node_modules /app/node_modules
COPY --from=build --chown=wallet-rmt:wallet-rmt /app/dist /app/dist

ENV NODE_ENV=production
EXPOSE 8080

CMD ["pnpm", "serve"]
