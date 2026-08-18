import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MenuItemsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { nama: string; harga_jual: number; categoryId: string }) {
    return this.prisma.menuItem.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.menuItem.findMany({
      where: { tenantId },
      include: { category: true }, // Join dengan tabel kategori untuk menampilkan nama kategorinya
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, data: { nama?: string; harga_jual?: number; status?: boolean }) {
    const existing = await this.prisma.menuItem.findFirst({
      where: { id, tenantId },
    });

    if (!existing) throw new NotFoundException('Menu tidak ditemukan atau akses ditolak.');

    return this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.menuItem.findFirst({
      where: { id, tenantId },
    });

    if (!existing) throw new NotFoundException('Menu tidak ditemukan atau akses ditolak.');

    return this.prisma.menuItem.delete({
      where: { id },
    });
  }
}