import { PrismaClient, Role, OrderType, OrderStatus } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import * as process from 'process';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database SaaS POS & Inventory...');

  // 1. ENKRIPSI PASSWORD
  const superAdminPass = await bcrypt.hash('stackplustudio06', 10);
  const ownerPass = await bcrypt.hash('stackplustudio3', 10);
  const kasirPass = await bcrypt.hash('kasir123', 10);

  // 2. SETUP SUPER ADMIN (Platform Level)
  const superAdmin = await prisma.user.upsert({
    where: { email: 'stackplustudio@gmail.com' },
    update: { password: superAdminPass, role: Role.SUPER_ADMIN },
    create: {
      email: 'stackplustudio@gmail.com',
      name: 'Super Admin NusaKasir',
      password: superAdminPass,
      role: Role.SUPER_ADMIN,
    },
  });
  console.log(`✅ Super Admin seeded: ${superAdmin.email}`);

  // 3. SETUP TENANT (Bisnis F&B)
  let tenant = await prisma.tenant.findFirst({
    where: { nama_bisnis: 'StackPlus Cafe' }
  });
  
  if (!tenant) {
    tenant = await prisma.tenant.create({
      data: {
        nama_bisnis: 'StackPlus Cafe',
        alamat: 'Kawasan Mampang Prapatan, Jakarta Selatan',
        status_langganan: 'ACTIVE',
      },
    });
    console.log(`✅ Tenant F&B dibuat: ${tenant.nama_bisnis}`);
  }

  // 4. SETUP OWNER & KASIR UNTUK TENANT
  const owner = await prisma.user.upsert({
    where: { email: 'budicahyono@gmail.com' },
    update: { password: ownerPass, role: Role.OWNER, tenantId: tenant.id },
    create: {
      email: 'budicahyono@gmail.com',
      name: 'Budi Cahyono',
      password: ownerPass,
      role: Role.OWNER,
      tenantId: tenant.id,
    },
  });
  console.log(`✅ Owner Tenant seeded: ${owner.email}`);

  const kasir = await prisma.user.upsert({
    where: { email: 'kasir@stackplustudio.com' },
    update: { password: kasirPass, role: Role.KASIR, tenantId: tenant.id, pin_kasir: '1234' },
    create: {
      email: 'kasir@stackplustudio.com',
      name: 'Kasir Shift Pagi',
      password: kasirPass,
      role: Role.KASIR,
      tenantId: tenant.id,
      pin_kasir: '1234',
    },
  });
  console.log(`✅ Kasir Tenant seeded: ${kasir.email}`);

  // 5. MASTER DATA TENANT (Bahan Baku & Menu)
  
  // A. Kategori
  const categoryKopi = await prisma.category.create({
    data: { nama_kategori: 'Kopi', tenantId: tenant.id }
  });

  // B. Bahan Baku (Inventory)
  const bijiKopi = await prisma.ingredient.create({
    data: { nama: 'Biji Kopi Arabica', satuan: 'gr', stok_saat_ini: 5000, stok_minimum: 1000, harga_beli_terakhir: 200, tenantId: tenant.id }
  });
  
  const susu = await prisma.ingredient.create({
    data: { nama: 'Susu Fresh Milk', satuan: 'ml', stok_saat_ini: 10000, stok_minimum: 2000, harga_beli_terakhir: 20, tenantId: tenant.id }
  });

  // C. Menu Item
  const esKopiSusu = await prisma.menuItem.create({
    data: { nama: 'Es Kopi Susu Gula Aren', harga_jual: 25000, tenantId: tenant.id, categoryId: categoryKopi.id }
  });

  // D. Recipe / BOM (1 Es Kopi Susu butuh 20gr Kopi + 150ml Susu)
  await prisma.recipe.createMany({
    data: [
      { menuItemId: esKopiSusu.id, ingredientId: bijiKopi.id, jumlah_takaran: 20 },
      { menuItemId: esKopiSusu.id, ingredientId: susu.id, jumlah_takaran: 150 },
    ]
  });
  console.log(`✅ Master Data Kategori, Menu, Inventory & BOM selesai disiapkan.`);

  // 6. SETUP MEJA DINE-IN
  await prisma.table.create({
    data: { nomor_meja: 'A1', area: 'Indoor', tenantId: tenant.id }
  });
  console.log(`✅ Meja Dine-in disiapkan.`);
}

main()
  .catch((e) => {
    console.error('❌ Terjadi kesalahan saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    console.log('🛑 Koneksi database ditutup.');
  });