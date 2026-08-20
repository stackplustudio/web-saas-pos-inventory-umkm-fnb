"use client";

import { useState, useEffect } from "react";
import { TrendingUp, ReceiptText, Wallet, ArrowRight, Store, RefreshCw } from "lucide-react";
import Link from "next/link";
import { api } from "@/lib/axios";

export default function DashboardPage() {
  const [userData, setUserData] = useState<any>(null);
  const [metrics, setMetrics] = useState({ omzet: 0, transaksi: 0, rataRata: 0 });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      setUserData(user);
      
      // 🔥 PERBAIKAN: Hanya panggil API analytics jika bukan KASIR
      if (user.role !== "KASIR") {
        fetchAnalytics();
      } else {
        setIsLoading(false); 
      }
    }
  }, []);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      // 🔥 Menarik data real-time dari Backend yang baru saja kita buat
      const res = await api.get('/analytics/summary');
      setMetrics(res.data);
    } catch (error) {
      console.error("Gagal memuat data analitik", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  // RENDER KHUSUS KASIR
  if (userData?.role === "KASIR") {
    const today = new Date().toLocaleDateString('id-ID', { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' 
    });

    return (
      <div className="max-w-[1280px] mx-auto font-inter text-[#00232C] animate-in fade-in duration-300">
        <div className="mb-8">
          <h1 className="text-[40px] font-bold leading-tight">Portal Pegawai</h1>
          <p className="text-[#00232C]/70 mt-1">{today}</p>
        </div>

        <div className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-10 mb-8 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-[#0053FF]/10 text-[#0053FF] rounded-full flex items-center justify-center mb-6">
            <Store size={40} />
          </div>
          <h2 className="text-3xl font-black mb-2">Halo, {userData.name}!</h2>
          <p className="text-[#00232C]/60 mb-8 max-w-md">
            Selamat datang di sistem operasional NusaKasir. Pastikan Anda telah melakukan perhitungan uang laci sebelum memulai shift.
          </p>
          <Link href="/pos" className="bg-[#0053FF] text-white px-8 py-4 rounded-full font-bold shadow-[0_10px_30px_rgba(0,83,255,0.3)] hover:-translate-y-1 transition-all flex items-center gap-2">
            Buka Layar Kasir (POS) <ArrowRight size={20} />
          </Link>
        </div>

        {/* Info Cepat Pegawai */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded-[20px] border border-[#00232C]/5 shadow-sm flex items-center gap-5">
            <div className="bg-blue-50 p-4 rounded-2xl text-blue-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#00232C]">Status Shift Saat Ini</h3>
              <p className="text-sm text-[#00232C]/60">Anda dapat membuka atau menutup shift langsung dari layar POS utama.</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-[20px] border border-[#00232C]/5 shadow-sm flex items-center gap-5">
            <div className="bg-green-50 p-4 rounded-2xl text-green-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
            </div>
            <div>
              <h3 className="font-bold text-lg text-[#00232C]">Katalog & Meja</h3>
              <p className="text-sm text-[#00232C]/60">Akses menu "Daftar Menu" di sidebar untuk melihat ketersediaan stok hari ini.</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // RENDER UNTUK OWNER / MANAGER
  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Overview Bisnis</h1>
          <p className="text-[#00232C]/70 mt-1">Ringkasan performa penjualan outlet Anda hari ini.</p>
        </div>
        
        {/* Tombol Refresh Manual */}
        <button 
          onClick={fetchAnalytics}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-[#00232C]/10 rounded-full text-sm font-semibold hover:bg-gray-50 transition-colors"
        >
          <RefreshCw size={16} className={isLoading ? "animate-spin" : ""} /> Perbarui Data
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-6 transition-transform hover:-translate-y-[2px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#0053FF]/10 text-[#0053FF] p-3 rounded-2xl"><Wallet size={24} /></div>
            <h3 className="text-[#00232C]/60 font-semibold text-sm uppercase tracking-wider">Total Omzet (Hari Ini)</h3>
          </div>
          <h2 className="text-3xl font-black text-[#00232C]">
            {isLoading ? <span className="animate-pulse bg-gray-200 text-transparent rounded">Rp 0.000.000</span> : formatRp(metrics.omzet)}
          </h2>
        </div>

        <div className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-6 transition-transform hover:-translate-y-[2px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#16A34A]/10 text-[#16A34A] p-3 rounded-2xl"><ReceiptText size={24} /></div>
            <h3 className="text-[#00232C]/60 font-semibold text-sm uppercase tracking-wider">Jumlah Transaksi</h3>
          </div>
          <h2 className="text-3xl font-black text-[#00232C]">
            {isLoading ? <span className="animate-pulse bg-gray-200 text-transparent rounded">00 Order</span> : `${metrics.transaksi} Order`}
          </h2>
        </div>

        <div className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-6 transition-transform hover:-translate-y-[2px]">
          <div className="flex items-center gap-4 mb-4">
            <div className="bg-[#F59E0B]/10 text-[#F59E0B] p-3 rounded-2xl"><TrendingUp size={24} /></div>
            <h3 className="text-[#00232C]/60 font-semibold text-sm uppercase tracking-wider">Rata-rata Order</h3>
          </div>
          <h2 className="text-3xl font-black text-[#00232C]">
            {isLoading ? <span className="animate-pulse bg-gray-200 text-transparent rounded">Rp 00.000</span> : formatRp(metrics.rataRata)}
          </h2>
        </div>
      </div>

      <h3 className="text-xl font-bold mb-4">Aksi Cepat</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link href="/pos" className="bg-[#0053FF] text-white p-5 rounded-[16px] shadow-[0_10px_30px_rgba(0,83,255,0.2)] hover:shadow-[0_15px_40px_rgba(0,83,255,0.3)] hover:-translate-y-[2px] transition-all flex flex-col justify-between h-[130px] group">
          <span className="font-semibold text-lg">Buka Kasir (POS)</span>
          <div className="flex justify-between items-end">
            <span className="text-white/70 text-sm">Mulai transaksi shift ini</span>
            <ArrowRight size={24} className="group-hover:translate-x-1 transition-transform" />
          </div>
        </Link>
        <Link href="/dashboard/menus" className="bg-white p-5 rounded-[16px] border border-[#00232C]/10 hover:border-[#0053FF]/50 hover:shadow-[0_10px_30px_rgba(0,35,44,0.05)] transition-all flex flex-col justify-between h-[130px] text-[#00232C] group">
          <span className="font-semibold text-lg">Menu & Resep</span>
          <div className="flex justify-between items-end">
            <span className="text-[#00232C]/50 text-sm">Atur harga & BOM</span>
            <ArrowRight size={24} className="text-[#0053FF] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
        <Link href="/dashboard/inventory" className="bg-white p-5 rounded-[16px] border border-[#00232C]/10 hover:border-[#0053FF]/50 hover:shadow-[0_10px_30px_rgba(0,35,44,0.05)] transition-all flex flex-col justify-between h-[130px] text-[#00232C] group">
          <span className="font-semibold text-lg">Inventory</span>
          <div className="flex justify-between items-end">
            <span className="text-[#00232C]/50 text-sm">Cek bahan baku</span>
            <ArrowRight size={24} className="text-[#0053FF] opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
          </div>
        </Link>
      </div>
    </div>
  );
}