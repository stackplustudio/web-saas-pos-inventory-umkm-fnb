import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, createUserDto: CreateUserDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: createUserDto.email }
    });
    
    if (existingUser) {
      throw new ConflictException('Email sudah terdaftar!');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password || 'password123', 10);

    return this.prisma.user.create({
      data: {
        email: createUserDto.email,
        name: createUserDto.name,
        password: hashedPassword,
        role: (createUserDto.role as Role) || Role.KASIR,
        tenantId, // 🔥 Wajib di-bind ke tenant sang Owner
      },
      select: { id: true, email: true, name: true, role: true, createdAt: true }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.user.findMany({
      where: { tenantId }, // 🔥 Hanya ambil user milik cabang/tenant ini
      select: { id: true, email: true, name: true, role: true, createdAt: true, status: true },
      orderBy: { createdAt: 'desc' }
    });
  }

  async findOne(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({
      where: { id, tenantId },
      select: { id: true, name: true, email: true, role: true, status: true },
    });
    if (!user) throw new NotFoundException('User tidak ditemukan');
    return user;
  }

  async update(tenantId: string, id: string, updateUserDto: UpdateUserDto) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User tidak ditemukan atau akses ditolak');

    const dataToUpdate: any = { ...updateUserDto };

    if (updateUserDto.password) {
      dataToUpdate.password = await bcrypt.hash(updateUserDto.password, 10);
    } else {
      delete dataToUpdate.password;
    }

    return this.prisma.user.update({
      where: { id },
      data: dataToUpdate,
      select: { id: true, email: true, name: true, role: true },
    });
  }

  async remove(tenantId: string, id: string) {
    const user = await this.prisma.user.findFirst({ where: { id, tenantId } });
    if (!user) throw new NotFoundException('User tidak ditemukan atau akses ditolak');
    
    // Jangan hapus permanen untuk menjaga relasi riwayat order kasir, cukup nonaktifkan statusnya.
    return this.prisma.user.update({
      where: { id },
      data: { status: 'INACTIVE' },
      select: { id: true, email: true, status: true }
    });
  }
}