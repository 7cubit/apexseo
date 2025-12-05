FROM node:18-alpine AS base

FROM base AS builder
WORKDIR /app
RUN npm install -g turbo
COPY . .
RUN turbo prune --scope=@apexseo/app --docker

FROM base AS installer
WORKDIR /app
COPY --from=builder /app/out/json/ .
COPY --from=builder /app/out/package-lock.json ./package-lock.json
RUN npm install

COPY --from=builder /app/out/full/ .
COPY turbo.json turbo.json
RUN npm run build --filter=@apexseo/app...

FROM base AS runner
WORKDIR /app
ENV NODE_ENV production
COPY --from=installer /app/packages/app/.next/standalone ./
COPY --from=installer /app/packages/app/.next/static ./packages/app/.next/static
COPY --from=installer /app/packages/app/public ./packages/app/public

CMD ["node", "packages/app/server.js"]
