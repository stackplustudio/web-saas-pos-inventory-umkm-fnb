import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { OrderType } from '@prisma/client';

@Injectable()
export class OrdersService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    tenantId: string, 
    kasirId: string, 
    data: { tipe: OrderType; tableId?: string; metode_bayar: string; discountId?: string; diskon_nominal?: number; items: any[] }
  ) {
    if (!data.items || data.items.length === 0) {
      throw new BadRequestException('Keranjang belanja kosong.');
    }

    const subtotal = data.items.reduce((sum, item) => sum + (item.harga * item.qty), 0);
    const diskon = data.diskon_nominal || 0; // Nominal diskon yang sudah dihitung oleh Frontend POS
    const subtotalSetelahDiskon = subtotal - diskon;
    
    // Pastikan tidak minus
    const finalSubtotal = subtotalSetelahDiskon > 0 ? subtotalSetelahDiskon : 0;
    const pajak = Math.round(finalSubtotal * 0.11);
    const total = finalSubtotal + pajak;

    return this.prisma.$transaction(async (tx) => {
      // 1. Buat Header Pesanan (Tambahkan diskon dan discountId)
      const order = await tx.order.create({
        data: {
          tenantId,
          kasirId,
          tipe: data.tipe,
          tableId: data.tableId,
          status: 'COMPLETED', 
          subtotal,
          diskon, // 🔥 Data baru
          discountId: data.discountId, // 🔥 Data baru
          pajak,
          total,
          metode_bayar: data.metode_bayar,
        }
      });
      // ... (Sisa kode ke bawah sama seperti sebelumnya: potong stok, update meja, tambah kas_sistem)

      // 2. Loop setiap item pesanan & Potong Stok
      for (const item of data.items) {
        await tx.orderItem.create({
          data: {
            orderId: order.id,
            menuItemId: item.menuItemId,
            qty: item.qty,
            harga: item.harga,
            catatan: item.catatan
          }
        });

        const recipes = await tx.recipe.findMany({
          where: { menuItemId: item.menuItemId }
        });

        for (const recipe of recipes) {
          const totalPotongan = recipe.jumlah_takaran * item.qty;
          await tx.ingredient.update({
            where: { id: recipe.ingredientId },
            data: { stok_saat_ini: { decrement: totalPotongan } }
          });

          await tx.stockMovement.create({
            data: {
              tenantId,
              ingredientId: recipe.ingredientId,
              tipe: 'SALE',
              jumlah: totalPotongan,
              referensi_id: order.id,
              catatan: `Terjual ${item.qty} porsi menu ID: ${item.menuItemId}`
            }
          });
        }
      }

      // 3. Update Meja jika Dine In
      if (data.tipe === 'DINE_IN' && data.tableId) {
        await tx.table.update({
          where: { id: data.tableId },
          data: { status: 'TERISI' }
        });
      }

      // 4. 🔥 PERBAIKAN: Tambahkan uang pemasukan ke laci Shift Kasir yang sedang aktif
      const activeShift = await tx.shift.findFirst({
        where: { tenantId, kasirId, waktu_tutup: null }
      });

      if (activeShift) {
        await tx.shift.update({
          where: { id: activeShift.id },
          data: { kas_sistem: { increment: total } } // Kas sistem bertambah sesuai total belanja
        });
      }

      return order;
    });
  }

  // Fungsi Read Riwayat
  async findAll(tenantId: string) {
    return this.prisma.order.findMany({
      where: { tenantId },
      include: {
        kasir: { select: { name: true } },
        table: true,
        orderItems: { include: { menuItem: true } }
      },
      orderBy: { createdAt: 'desc' },
    });
  }
}