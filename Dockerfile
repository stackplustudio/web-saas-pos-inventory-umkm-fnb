# 1. Gunakan OS Node 20 Full Version (Paling stabil, semua library C & OpenSSL sudah terinstall bawaan pabrik)
FROM node:20

# 2. Install pnpm
RUN npm install -g pnpm

# 3. Set direktori kerja
WORKDIR /app

# 4. Copy semua file proyek
COPY . .

# 5. 🔥 PENGHANCUR CACHE: Hapus semua sisa-sisa Alpine di folder monorepo!
RUN rm -rf node_modules apps/*/node_modules packages/*/node_modules

# 6. Install ulang dari nol dengan paksa (--force) agar Prisma mengunduh engine Debian yang benar
RUN pnpm install --force

# 7. Generate Prisma (Kunci di versi 5)
RUN npx prisma@5 generate --schema=packages/database/prisma/schema.prisma

# 8. Build module backend (api)
RUN pnpm run build --filter api

# 9. Buka port
EXPOSE 3000

# 10. Perintah menyalakan server
CMD ["pnpm", "--filter", "api", "run", "start:prod"]