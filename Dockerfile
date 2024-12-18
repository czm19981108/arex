FROM node:18.14.2-alpine3.17 AS pnpm-base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
ENV NODE_OPTIONS="--max-old-space-size=8192"

RUN npm config set registry https://registry.npmmirror.com
RUN npm i -g pnpm@8
# RUN pnpm config set electron_mirror "https://npm.taobao.org/mirrors/electron/"

FROM pnpm-base AS base
COPY . /app
WORKDIR /app

FROM base AS prod-deps
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install

FROM base AS build
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
RUN export NODE_OPTIONS="--max-old-space-size=8192" && pnpm run build

FROM pnpm-base AS arex
# runtime server
COPY --from=build /app/packages/arex-server/ /app/

# frontend build product
COPY --from=build /app/packages/arex/dist /app/dist

WORKDIR /app
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install
EXPOSE 8080
CMD [ "node", "./server.js",">","./logs/app.log","2>", "./logs/error.log"]
