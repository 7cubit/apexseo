FROM node:20-alpine AS builder
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev

# Copy entire monorepo
COPY . .
RUN npm ci

# Build the app
ENV NEXT_TELEMETRY_DISABLED 1
RUN npm run build --workspace=admin


# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
# Next.js standalone output preserves the directory structure.
# We copy it to the root of /app
COPY --from=builder --chown=nextjs:nodejs /app/packages/admin/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/admin/.next/static ./packages/admin/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/admin/public ./packages/admin/public

USER nextjs

EXPOSE 3001

ENV PORT 3001
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "packages/admin/server.js"]
