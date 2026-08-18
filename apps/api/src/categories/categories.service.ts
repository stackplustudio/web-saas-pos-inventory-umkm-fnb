import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { nama_kategori: string }) {
    return this.prisma.category.create({
      data: {
        nama_kategori: data.nama_kategori,
        tenantId, // Paksa data terikat pada tenant yang sedang login
      },
    });
  }

  async findAll(tenantId: string) {
    // Hanya ambil kategori milik tenant yang bersangkutan
    return this.prisma.category.findMany({
      where: { tenantId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async update(tenantId: string, id: string, data: { nama_kategori: string }) {
    // Pastikan kategori yang mau di-update benar-benar milik tenant ini
    const existing = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan atau Anda tidak memiliki akses.');
    }

    return this.prisma.category.update({
      where: { id },
      data: { nama_kategori: data.nama_kategori },
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.category.findFirst({
      where: { id, tenantId },
    });

    if (!existing) {
      throw new NotFoundException('Kategori tidak ditemukan atau Anda tidak memiliki akses.');
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}