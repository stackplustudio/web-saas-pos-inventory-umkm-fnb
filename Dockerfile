# 1. Gunakan sistem operasi Linux dengan Node.js versi 20
FROM node:20-alpine

# 2. Install pnpm secara global di dalam server
RUN npm install -g pnpm

# 3. Set direktori kerja
WORKDIR /app

# 4. Copy seluruh file proyek ke dalam server
COPY . .

# 5. Install semua dependencies
RUN pnpm install

# 6. 🔥 PERBAIKAN: Kunci Prisma di versi 5 agar tidak error syntax
RUN npx prisma@5 generate --schema=packages/database/prisma/schema.prisma

# 7. Build HANYA module backend (api), abaikan frontend (web)
RUN pnpm run build --filter api

# 8. Buka port komunikasi
EXPOSE 3000

# # 9. Perintah untuk menyalakan server saat aplikasi dijalankan
# CMD ["pnpm", "run", "start:prod", "--filter", "api"]
# 9. Perintah untuk menyalakan server saat aplikasi dijalankan
CMD ["pnpm", "--filter", "api", "run", "start:prod"]