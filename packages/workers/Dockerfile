FROM node:20-alpine AS builder
WORKDIR /app
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev

COPY . .
RUN npm ci
RUN npm run build --workspace=@apexseo/workers

FROM node:20-alpine AS runner
WORKDIR /app
RUN apk add --no-cache libc6-compat

COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/workers/dist ./packages/workers/dist
COPY --from=builder /app/packages/workers/package.json ./packages/workers/package.json
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json

ENV NODE_ENV production

CMD ["node", "packages/workers/dist/worker.js"]
