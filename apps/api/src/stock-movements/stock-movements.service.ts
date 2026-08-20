import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client'; // 🔥 TAMBAHKAN IMPORT INI

@Injectable()
export class StockMovementsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { ingredientId: string; tipe: string; jumlah: number; catatan?: string }) {
    // Pastikan bahan baku milik tenant yang login
    const ingredient = await this.prisma.ingredient.findFirst({
      where: { id: data.ingredientId, tenantId },
    });

    if (!ingredient) throw new NotFoundException('Bahan baku tidak ditemukan.');

    return this.prisma.$transaction(async (tx) => {
      // 1. Catat riwayat pergerakan
      const movement = await tx.stockMovement.create({
        data: {
          tenantId,
          ingredientId: data.ingredientId,
          tipe: data.tipe as MovementType, // 🔥 CASTING KE ENUM PRISMA
          jumlah: data.jumlah,
          catatan: data.catatan,
        },
      });

      // 2. Update stok saat ini di tabel Ingredient
      // Jika tipe 'IN' (Masuk), stok ditambah. Jika 'OUT' (Rusak/Buang), stok dikurangi.
      const qty = data.tipe === 'IN' ? data.jumlah : -data.jumlah;

      await tx.ingredient.update({
        where: { id: data.ingredientId },
        data: {
          stok_saat_ini: { increment: qty },
        },
      });

      return movement;
    });
  }

  async findAll(tenantId: string, ingredientId?: string) {
    return this.prisma.stockMovement.findMany({
      where: {
        tenantId,
        ...(ingredientId && { ingredientId }), // Filter by ingredient jika ada
      },
      include: {
        ingredient: { select: { nama: true, satuan: true } },
      },
      orderBy: { tanggal: 'desc' }, // 🔥 UBAH DARI createdAt MENJADI tanggal
    });
  }
}