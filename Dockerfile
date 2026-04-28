# Stage 1: Dependencies & Build
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 1. መጀመሪያ package ፋይሎችን ብቻ በመቅዳት ካሽ (Cache) እንጠቀማለን
COPY package.json package-lock.json ./

# 2. ኢንስታላሽን (ያለ postinstall ስክሪፕት) - ስህተትን ለመከላከል
RUN npm install --ignore-scripts

# 3. አሁን ሁሉንም የፕሮጀክት ፋይሎች መቅዳት
COPY . .

# 4. ENVIRONMENT VARIABLES (ለቢልድ ሰዓት ወሳኝ ናቸው)
ENV DATABASE_URL="postgresql://postgres:bruhtech123@db:5432/hms_db"
ENV BACKUP_ENCRYPTION_PASSWORD="DrBirkuBeleteClinicBackup2026!SecureKeyX7z9vK2mPq"
ENV NEXT_PUBLIC_API_URL="http://192.168.137.1/api"

# 5. Prisma Client ማመንጨት (Generate)
RUN npx prisma generate

# 6. አፑን ለፕሮዳክሽን ቢልድ ማድረግ
RUN npm run build

# Stage 2: Runner (ቀላል እና ፈጣን Image ለመስራት)
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 7. ከ builder ስቴጅ ላይ አስፈላጊ የሆኑ ፋይሎችን መቅዳት
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

# 8. ወሳኝ ማስተካከያ፡ የ Prisma ፎልደርን ለብቻው እንቀዳለን (migrate deploy እንዲሰራ)
COPY --from=builder /app/prisma ./prisma

# 9. ፖርት 3000ን መክፈት
EXPOSE 3000

# 10. አፑን ማስነሻ ትዕዛዝ
CMD ["node", "server.js"]