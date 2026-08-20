import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ShiftsService {
  constructor(private prisma: PrismaService) {}

  async openShift(tenantId: string, kasirId: string, modal_awal: number) {
    // Cek apakah kasir ini masih punya shift yang menggantung (belum ditutup)
    const activeShift = await this.prisma.shift.findFirst({
      where: { tenantId, kasirId, waktu_tutup: null },
    });

    if (activeShift) {
      throw new BadRequestException('Anda masih memiliki shift yang aktif. Tutup terlebih dahulu.');
    }

    return this.prisma.shift.create({
      data: {
        tenantId,
        kasirId,
        modal_awal,
        kas_sistem: modal_awal, // Awal shift, kas sistem = modal awal
      },
    });
  }

  async closeShift(tenantId: string, kasirId: string, shiftId: string, kas_fisik: number, catatan?: string) {
    const shift = await this.prisma.shift.findFirst({
      where: { id: shiftId, tenantId, kasirId, waktu_tutup: null },
    });

    if (!shift) throw new NotFoundException('Shift aktif tidak ditemukan.');

    const selisih = kas_fisik - shift.kas_sistem;

    return this.prisma.shift.update({
      where: { id: shiftId },
      data: {
        waktu_tutup: new Date(),
        kas_fisik,
        selisih,
        catatan,
      },
    });
  }

  async getActiveShift(tenantId: string, kasirId: string) {
    return this.prisma.shift.findFirst({
      where: { tenantId, kasirId, waktu_tutup: null },
    });
  }
}