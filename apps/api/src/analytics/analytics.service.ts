import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getTodaySummary(tenantId: string) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const orders = await this.prisma.order.findMany({
      where: { tenantId, createdAt: { gte: today, lt: tomorrow }, status: 'COMPLETED' },
    });

    const transaksi = orders.length;
    const omzet = orders.reduce((sum, order) => sum + order.total, 0);
    const rataRata = transaksi > 0 ? Math.round(omzet / transaksi) : 0;

    return { omzet, transaksi, rataRata };
  }

  // 🔥 FUNGSI BARU UNTUK LABA RUGI (P&L)
  async getProfitLoss(tenantId: string, startDate?: string, endDate?: string) {
    // Default: Hitung bulan ini jika tidak ada filter tanggal
    const start = startDate ? new Date(startDate) : new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    const end = endDate ? new Date(endDate) : new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

    // 1. Pemasukan (Total Belanja Kasir)
    const orders = await this.prisma.order.findMany({
      where: {
        tenantId,
        status: 'COMPLETED',
        createdAt: { gte: start, lte: end }
      }
    });
    const totalPemasukan = orders.reduce((sum, order) => sum + order.total, 0);

    // 2. Pengeluaran (Total Belanja Supplier dari PO)
    const purchaseOrders = await this.prisma.purchaseOrder.findMany({
      where: {
        tenantId,
        status: 'SELESAI', // Hanya hitung PO yang barangnya sudah diterima
        createdAt: { gte: start, lte: end }
      }
    });
    const totalPengeluaran = purchaseOrders.reduce((sum, po) => sum + po.total, 0);

    // 3. Laba Bersih
    const labaBersih = totalPemasukan - totalPengeluaran;

    return {
      periode: { start, end },
      pemasukan: totalPemasukan,
      pengeluaran: totalPengeluaran,
      labaBersih
    };
  }
}