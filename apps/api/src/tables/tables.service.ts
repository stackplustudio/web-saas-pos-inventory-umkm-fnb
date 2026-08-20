import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class TablesService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { nomor_meja: string; area?: string }) {
    return this.prisma.table.create({
      data: { ...data, tenantId },
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.table.findMany({
      where: { tenantId },
      orderBy: { nomor_meja: 'asc' },
    });
  }

  async update(tenantId: string, id: string, data: { nomor_meja?: string; area?: string; status?: string }) {
    const existing = await this.prisma.table.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Meja tidak ditemukan.');
    return this.prisma.table.update({ where: { id }, data });
  }

  async remove(tenantId: string, id: string) {
    const existing = await this.prisma.table.findFirst({ where: { id, tenantId } });
    if (!existing) throw new NotFoundException('Meja tidak ditemukan.');
    return this.prisma.table.delete({ where: { id } });
  }
}