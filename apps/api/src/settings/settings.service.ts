import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getTenantProfile(tenantId: string) {
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      select: { id: true, nama_bisnis: true, alamat: true, status_langganan: true }
    });
    if (!tenant) throw new NotFoundException('Data bisnis tidak ditemukan');
    return tenant;
  }

  async updateTenantProfile(tenantId: string, data: { nama_bisnis?: string; alamat?: string }) {
    return this.prisma.tenant.update({
      where: { id: tenantId },
      data: {
        nama_bisnis: data.nama_bisnis,
        alamat: data.alamat
      },
      select: { nama_bisnis: true, alamat: true }
    });
  }
}