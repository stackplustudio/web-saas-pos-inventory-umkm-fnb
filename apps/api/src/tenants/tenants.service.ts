import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.tenant.findMany({
      include: {
        _count: { select: { users: true, orders: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  // 🔥 FUNGSI BARU: ONBOARDING KLIEN & AKUN OWNER
  async createTenant(data: any) {
    // 1. Cek apakah email sudah dipakai restoran lain
    const existingUser = await this.prisma.user.findUnique({
      where: { email: data.owner_email },
    });
    if (existingUser) throw new ConflictException('Email Owner sudah terdaftar di sistem!');

    // 2. Hash password untuk keamanan
    const hashedPassword = await bcrypt.hash(data.owner_password, 10);

    // 3. Lakukan Prisma Transaction
    return this.prisma.$transaction(async (tx) => {
      // Buat entitas Restorannya (Tenant)
      const newTenant = await tx.tenant.create({
        data: {
          nama_bisnis: data.nama_bisnis,
          alamat: data.alamat,
          status_langganan: 'ACTIVE',
        }
      });

      // Buat akun Owner dan kaitkan dengan Tenant barusan
      await tx.user.create({
        data: {
          name: data.owner_name,
          email: data.owner_email,
          password: hashedPassword,
          role: 'OWNER',
          tenantId: newTenant.id,
        }
      });

      return newTenant;
    });
  }

  async updateStatus(id: string, status: string) {
    const tenant = await this.prisma.tenant.findUnique({ where: { id } });
    if (!tenant) throw new NotFoundException('Data klien tidak ditemukan');

    return this.prisma.tenant.update({
      where: { id },
      data: { status_langganan: status }
    });
  }
}