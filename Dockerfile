# 1. Gunakan sistem operasi Linux dengan Node.js versi 20 (Alpine)
FROM node:20-alpine

# 2. 🔥 PERBAIKAN: Install OpenSSL yang diwajibkan oleh Prisma di sistem operasi Alpine
RUN apk add --no-cache openssl

# 3. Install pnpm secara global di dalam server
RUN npm install -g pnpm

# 4. Set direktori kerja
WORKDIR /app

# 5. Copy seluruh file proyek ke dalam server
COPY . .

# 6. Install semua dependencies
RUN pnpm install

# 7. Kunci Prisma di versi 5 dan jalankan generate
RUN npx prisma@5 generate --schema=packages/database/prisma/schema.prisma

# 8. Build HANYA module backend (api), abaikan frontend (web)
RUN pnpm run build --filter api

# 9. Buka port komunikasi
EXPOSE 3000

# 10. Perintah untuk menyalakan server saat aplikasi dijalankan
CMD ["pnpm", "--filter", "api", "run", "start:prod"]