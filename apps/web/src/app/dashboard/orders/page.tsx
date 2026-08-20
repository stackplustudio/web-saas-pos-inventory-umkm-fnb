"use client";

import { useState, useEffect } from "react";
import { ReceiptText, Search, Eye } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface OrderItem {
  id: string;
  qty: number;
  harga: number;
  menuItem: { nama: string };
}

interface Order {
  id: string;
  tipe: string;
  status: string;
  total: number;
  metode_bayar: string;
  createdAt: string;
  kasir: { name: string };
  orderItems: OrderItem[];
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get('/orders');
      setOrders(response.data);
    } catch (error: any) {
      // Jika 403 (Kasir memaksa masuk dashboard), kita cegah
      if (error.response?.status === 403) {
        toast.error("Anda tidak memiliki akses ke halaman ini.");
      } else {
        toast.error("Gagal mengambil data riwayat transaksi");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatRp = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat('id-ID', { 
      day: '2-digit', month: 'short', year: 'numeric', 
      hour: '2-digit', minute: '2-digit' 
    }).format(new Date(dateString));
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Riwayat Transaksi</h1>
          <p className="text-[#00232C]/70 mt-1">Pantau semua pesanan yang masuk dari kasir.</p>
        </div>
        <div className="relative">
          <input 
            type="text" 
            placeholder="Cari ID Transaksi..."
            className="h-12 pl-10 pr-4 bg-white/60 border border-[#00232C]/10 rounded-full focus:border-[#0053FF] outline-none"
          />
          <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#00232C]/40" />
        </div>
      </div>

      {/* Tabel */}
      <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><p className="text-[#00232C]/50">Memuat transaksi...</p></div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="bg-[#00232C]/5 p-4 rounded-full mb-4"><ReceiptText className="text-[#00232C]/40" size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Belum ada transaksi</h3>
            <p className="text-[#00232C]/60">Penjualan dari POS akan muncul di sini.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#00232C]/10 bg-white/40">
                  <th className="p-5 font-semibold text-[14px]">Waktu</th>
                  <th className="p-5 font-semibold text-[14px]">ID / Tipe</th>
                  <th className="p-5 font-semibold text-[14px]">Kasir</th>
                  <th className="p-5 font-semibold text-[14px]">Metode</th>
                  <th className="p-5 font-semibold text-[14px]">Total</th>
                  <th className="p-5 font-semibold text-[14px] text-right">Detail</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-[#00232C]/5 hover:bg-white/40 transition-colors">
                    <td className="p-5 text-sm">{formatDate(order.createdAt)}</td>
                    <td className="p-5">
                      <p className="font-semibold text-xs text-[#0053FF]">{order.id.slice(-6).toUpperCase()}</p>
                      <p className="text-xs text-[#00232C]/60 font-bold mt-1">{order.tipe}</p>
                    </td>
                    <td className="p-5 text-sm">{order.kasir?.name || 'Unknown'}</td>
                    <td className="p-5">
                      <span className="px-2 py-1 bg-[#FBFBF3] border border-[#00232C]/10 rounded-md text-[11px] font-bold">
                        {order.metode_bayar || 'TUNAI'}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-[#0053FF]">{formatRp(order.total)}</td>
                    <td className="p-5 text-right">
                      {/* Tombol detail (Bisa di-expand menjadi modal struk) */}
                      <button className="p-2 text-[#00232C]/60 hover:bg-[#0053FF]/10 hover:text-[#0053FF] rounded-full transition-colors">
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}