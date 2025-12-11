FROM node:20-alpine AS builder
WORKDIR /app
# Check https://github.com/nodejs/docker-node/tree/b4117f9333da4138b03a546ec926ef50a31506c3#nodealpine to understand why libc6-compat might be needed.
RUN apk add --no-cache libc6-compat python3 make g++ vips-dev

# Copy entire monorepo
COPY . .
RUN npm ci

# Build the app
ENV NEXT_TELEMETRY_DISABLED 1
# Debug: Check if service file exists
RUN ls -la packages/app/src/lib/services || echo "Directory not found"
RUN npm run build --workspace=@apexseo/app


# Production image, copy all the files and run next
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy standalone build
# The standalone build is located at packages/app/.next/standalone
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/standalone ./packages/app/
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/.next/static ./packages/app/.next/static
COPY --from=builder --chown=nextjs:nodejs /app/packages/app/public ./packages/app/public
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules

RUN ls -R /app

USER nextjs

EXPOSE 3000

ENV PORT 3000
# set hostname to localhost
ENV HOSTNAME "0.0.0.0"

CMD ["node", "packages/app/server.js"]
