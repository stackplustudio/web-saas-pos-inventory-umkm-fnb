import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class DiscountsService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { nama: string; tipe: string; nilai: number }) {
    return this.prisma.discount.create({ data: { ...data, tenantId } });
  }

  async findAll(tenantId: string, activeOnly?: boolean) {
    return this.prisma.discount.findMany({
      where: { 
        tenantId,
        ...(activeOnly ? { status: true } : {})
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(tenantId: string, id: string, status: boolean) {
    const existing = await this.prisma.discount.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Promo tidak ditemukan');
    return this.prisma.discount.update({ where: { id }, data: { status } });
  }
}