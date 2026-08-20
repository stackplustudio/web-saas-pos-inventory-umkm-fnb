"use client";

import { useState, useEffect } from "react";
import { Plus, Tag, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Discount {
  id: string;
  nama: string;
  tipe: string;
  nilai: number;
  status: boolean;
}

export default function DiscountsPage() {
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nama: "", tipe: "PERSENTASE", nilai: "" });

  useEffect(() => { fetchDiscounts(); }, []);

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/discounts');
      setDiscounts(res.data);
    } catch (error) { toast.error("Gagal memuat data diskon"); } 
    finally { setIsLoading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/discounts', { ...formData, nilai: parseInt(formData.nilai) });
      toast.success("Promo berhasil dibuat!");
      setIsModalOpen(false);
      fetchDiscounts();
    } catch (error) { toast.error("Gagal membuat promo"); }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await api.patch(`/discounts/${id}/status`, { status: !currentStatus });
      toast.success("Status promo diperbarui");
      fetchDiscounts();
    } catch (error) { toast.error("Gagal mengubah status"); }
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Promo & Diskon</h1>
          <p className="text-[#00232C]/70 mt-1">Buat potongan harga untuk pelanggan Anda.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-bold hover:-translate-y-1 transition-all">
          <Plus size={18} /> Buat Promo
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {discounts.map(discount => (
          <div key={discount.id} className={`p-6 rounded-[20px] border shadow-sm transition-all ${discount.status ? 'bg-white border-white/50' : 'bg-gray-100 opacity-60 border-gray-200'}`}>
            <div className="flex justify-between items-start mb-4">
              <div className="bg-[#0053FF]/10 text-[#0053FF] p-3 rounded-full"><Tag size={20} /></div>
              <button onClick={() => toggleStatus(discount.id, discount.status)} className={`text-xs font-bold px-3 py-1 rounded-full ${discount.status ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-500'}`}>
                {discount.status ? 'AKTIF' : 'NONAKTIF'}
              </button>
            </div>
            <h3 className="text-xl font-bold mb-1">{discount.nama}</h3>
            <p className="text-3xl font-black text-[#0053FF]">
              {discount.tipe === 'PERSENTASE' ? `${discount.nilai}%` : `Rp ${discount.nilai.toLocaleString('id-ID')}`}
            </p>
          </div>
        ))}
      </div>

      {/* Modal Buat Promo */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00232C]/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Buat Promo Baru</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Nama Promo</label>
                <input type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} className="w-full h-12 px-4 border rounded-[12px]" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">Tipe</label>
                  <select value={formData.tipe} onChange={e => setFormData({...formData, tipe: e.target.value})} className="w-full h-12 px-4 border rounded-[12px] bg-white">
                    <option value="PERSENTASE">Persentase (%)</option>
                    <option value="NOMINAL">Nominal (Rp)</option>
                  </select>
                </div>
                <div className="flex-1">
                  <label className="block text-sm font-bold mb-2">Nilai</label>
                  <input type="number" required value={formData.nilai} onChange={e => setFormData({...formData, nilai: e.target.value})} className="w-full h-12 px-4 border rounded-[12px]" />
                </div>
              </div>
              <button type="submit" className="w-full h-12 bg-[#0053FF] text-white font-bold rounded-full mt-4">Simpan Promo</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}