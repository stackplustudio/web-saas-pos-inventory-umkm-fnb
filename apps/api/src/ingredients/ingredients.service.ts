import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class IngredientsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { nama: string; satuan: string; stok_minimum: number; harga_beli_terakhir: number }) {
    return this.prisma.ingredient.create({
      data: {
        ...data,
        stok_saat_ini: 0, // Stok awal selalu 0, harus ditambah via modul Stok Masuk/Opname nanti
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.ingredient.findMany({
      where: { tenantId },
      orderBy: { nama: 'asc' },
    });
  }

  async update(tenantId: string, id: string, data: { nama?: string; satuan?: string; stok_minimum?: number; harga_beli_terakhir?: number }) {
    const existing = await this.prisma.ingredient.findFirst({
      where: { id, tenantId },
    });

    if (!existing) throw new NotFoundException('Bahan baku tidak ditemukan atau akses ditolak.');

    return this.prisma.ingredient.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.ingredient.findFirst({
      where: { id, tenantId },
    });

    if (!existing) throw new NotFoundException('Bahan baku tidak ditemukan atau akses ditolak.');

    // Catatan: Jika bahan baku dihapus, Prisma (onDelete: Cascade) akan otomatis menghapus resep (BOM) yang terkait dengannya.
    return this.prisma.ingredient.delete({
      where: { id },
    });
  }
}