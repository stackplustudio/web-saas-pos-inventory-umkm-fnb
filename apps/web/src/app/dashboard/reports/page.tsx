"use client";

import { useState, useEffect } from "react";
import { TrendingUp, TrendingDown, DollarSign, Calendar } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function ProfitLossPage() {
  const [report, setReport] = useState({ pemasukan: 0, pengeluaran: 0, labaBersih: 0 });
  const [isLoading, setIsLoading] = useState(true);

  // Filter Bulan
  const currentDate = new Date();
  const [filterMonth, setFilterMonth] = useState(currentDate.getMonth()); // 0-11
  const [filterYear, setFilterYear] = useState(currentDate.getFullYear());

  useEffect(() => {
    fetchReport();
  }, [filterMonth, filterYear]);

  const fetchReport = async () => {
    setIsLoading(true);
    try {
      // Format tanggal awal dan akhir bulan yang dipilih
      const start = new Date(filterYear, filterMonth, 1).toISOString();
      const end = new Date(filterYear, filterMonth + 1, 0, 23, 59, 59).toISOString();

      const res = await api.get(`/analytics/profit-loss?startDate=${start}&endDate=${end}`);
      setReport(res.data);
    } catch (error) {
      toast.error("Gagal memuat laporan keuangan");
    } finally {
      setIsLoading(false);
    }
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const months = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Laba Rugi (P&L)</h1>
          <p className="text-[#00232C]/70 mt-1">Pantau arus kas masuk dan keluar secara real-time.</p>
        </div>
        
        {/* Filter Bulan & Tahun */}
        <div className="flex items-center gap-3 bg-white p-2 rounded-[16px] shadow-sm border border-[#00232C]/10">
          <Calendar size={20} className="text-[#0053FF] ml-2" />
          <select value={filterMonth} onChange={(e) => setFilterMonth(Number(e.target.value))} className="bg-transparent font-semibold outline-none text-[#00232C]">
            {months.map((m, i) => <option key={i} value={i}>{m}</option>)}
          </select>
          <select value={filterYear} onChange={(e) => setFilterYear(Number(e.target.value))} className="bg-transparent font-semibold outline-none text-[#00232C] pr-2">
            {[currentDate.getFullYear() - 1, currentDate.getFullYear()].map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><p className="text-[#00232C]/50 animate-pulse">Menghitung laporan...</p></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Pemasukan */}
          <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-green-100 text-green-600 p-4 rounded-[16px]"><TrendingUp size={28} /></div>
              <h3 className="text-[#00232C]/60 font-bold text-sm uppercase tracking-wider">Total Pemasukan<br/>(Omzet POS)</h3>
            </div>
            <h2 className="text-3xl font-black text-[#00232C]">{formatRp(report.pemasukan)}</h2>
          </div>

          {/* Pengeluaran */}
          <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-red-100 text-red-600 p-4 rounded-[16px]"><TrendingDown size={28} /></div>
              <h3 className="text-[#00232C]/60 font-bold text-sm uppercase tracking-wider">Total Pengeluaran<br/>(Belanja PO)</h3>
            </div>
            <h2 className="text-3xl font-black text-[#00232C]">{formatRp(report.pengeluaran)}</h2>
          </div>

          {/* Laba Bersih */}
          <div className={`backdrop-blur-[20px] border shadow-[0_15px_40px_rgba(0,35,44,0.12)] rounded-[20px] p-8 ${report.labaBersih >= 0 ? 'bg-[#0053FF] text-white border-[#0053FF]/50' : 'bg-red-600 text-white border-red-500'}`}>
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-white/20 p-4 rounded-[16px]"><DollarSign size={28} /></div>
              <h3 className="font-bold text-sm uppercase tracking-wider text-white/80">Laba Bersih<br/>(Net Profit)</h3>
            </div>
            <h2 className="text-4xl font-black">{formatRp(report.labaBersih)}</h2>
            <p className="mt-4 text-sm text-white/70">
              {report.labaBersih >= 0 ? "Bagus! Bisnis Anda profit di periode ini." : "Waspada! Pengeluaran lebih besar dari pemasukan."}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}