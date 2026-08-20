import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class PurchaseOrdersService {
  constructor(private prisma: PrismaService) {}

  async create(tenantId: string, data: { supplierId: string; catatan?: string; items: { ingredientId: string; qty: number; harga_satuan: number }[] }) {
    if (!data.items || data.items.length === 0) throw new BadRequestException('Item PO tidak boleh kosong');

    const total = data.items.reduce((sum, item) => sum + (item.qty * item.harga_satuan), 0);
    const nomor_po = `PO-${Date.now().toString().slice(-6)}`;

    return this.prisma.purchaseOrder.create({
      data: {
        tenantId,
        supplierId: data.supplierId,
        nomor_po,
        total,
        catatan: data.catatan,
        items: {
          create: data.items.map(item => ({
            ingredientId: item.ingredientId,
            qty: item.qty,
            harga_satuan: item.harga_satuan
          }))
        }
      }
    });
  }

  async findAll(tenantId: string) {
    return this.prisma.purchaseOrder.findMany({
      where: { tenantId },
      include: {
        supplier: { select: { nama: true } },
        items: { include: { ingredient: { select: { nama: true, satuan: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async updateStatus(tenantId: string, id: string, status: string) {
    const po = await this.prisma.purchaseOrder.findFirst({
      where: { id, tenantId },
      include: { items: true }
    });

    if (!po) throw new NotFoundException('PO tidak ditemukan');
    if (po.status === 'SELESAI') throw new BadRequestException('PO yang sudah selesai tidak bisa diubah');

    return this.prisma.$transaction(async (tx) => {
      // Update status PO
      const updatedPo = await tx.purchaseOrder.update({
        where: { id },
        data: { status }
      });

      // Jika statusnya SELESAI, otomatis tambahkan stok bahan baku!
      if (status === 'SELESAI') {
        for (const item of po.items) {
          // Tambah stok
          await tx.ingredient.update({
            where: { id: item.ingredientId },
            data: { 
              stok_saat_ini: { increment: item.qty },
              harga_beli_terakhir: item.harga_satuan // Update harga HPP terbaru
            }
          });

          // Catat di Stock Movement
          await tx.stockMovement.create({
            data: {
              tenantId,
              ingredientId: item.ingredientId,
              tipe: 'IN' as MovementType,
              jumlah: item.qty,
              referensi_id: po.nomor_po,
              catatan: `Barang masuk dari PO: ${po.nomor_po}`
            }
          });
        }
      }

      return updatedPo;
    });
  }
}