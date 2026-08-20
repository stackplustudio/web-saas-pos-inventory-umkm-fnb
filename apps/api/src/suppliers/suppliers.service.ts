import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SuppliersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { nama: string; kontak?: string }) {
    return this.prisma.supplier.create({
      data: {
        ...data,
        tenantId,
      },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.supplier.findMany({
      where: { tenantId },
      orderBy: { nama: 'asc' },
    });
  }

  async update(tenantId: string, id: string, data: { nama?: string; kontak?: string }) {
    const existing = await this.prisma.supplier.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Supplier tidak ditemukan');

    return this.prisma.supplier.update({
      where: { id },
      data,
    });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.supplier.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Supplier tidak ditemukan');

    return this.prisma.supplier.delete({
      where: { id },
    });
  }
}