FROM node:22-slim AS base

ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

RUN apt-get update
RUN apt-get install -y openssl

COPY . /app
WORKDIR /app

RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm exec prisma generate
RUN pnpm run build

EXPOSE 3000

CMD [ "pnpm", "run", "start:migrate:prod" ]