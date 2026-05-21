# Stage 1: Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci --ignore-scripts
COPY . .

ARG DATABASE_URL
ARG NEXT_PUBLIC_API_URL
ARG ALLOWED_ORIGINS
ARG BACKUP_ENCRYPTION_PASSWORD

# 🛑 ማስተካከያ፦ ፕሪስማ በBuild ሰዓት እንዳይበላሽ የይስሙላ (Dummy) URL ሰጥተነዋል
# እውነተኛው ዳታቤዝ ሲስተሙ ሲነሳ ከ .env.production ላይ በራስ-ሰር ይተካል!
ENV DATABASE_URL="postgresql://postgres:bruhtech123@db:5432/postgres?schema=public"
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV ALLOWED_ORIGINS=$ALLOWED_ORIGINS
ENV BACKUP_ENCRYPTION_PASSWORD=$BACKUP_ENCRYPTION_PASSWORD
ENV NEXT_TELEMETRY_DISABLED 1

RUN npx prisma generate
RUN npm run build

# Stage 2: Runner
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules ./node_modules 

# የ entrypoint ስክሪፕቱን ኮፒ ማድረግ
COPY entrypoint.sh ./
RUN chmod +x entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]