"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Truck, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Supplier {
  id: string;
  nama: string;
  kontak: string | null;
}

export default function SuppliersPage() {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ nama: "", kontak: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const response = await api.get('/suppliers');
      setSuppliers(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data supplier");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/suppliers', formData);
      toast.success("Supplier berhasil ditambahkan!");
      setIsModalOpen(false);
      setFormData({ nama: "", kontak: "" });
      fetchSuppliers();
    } catch (error) {
      toast.error("Gagal menambahkan supplier");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin ingin menghapus supplier ini?")) return;
    try {
      await api.delete(`/suppliers/${id}`);
      toast.success("Supplier dihapus");
      fetchSuppliers();
    } catch (error) {
      toast.error("Gagal menghapus supplier");
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Data Supplier</h1>
          <p className="text-[#00232C]/70 mt-1">Kelola kontak pemasok bahan baku Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all"
        >
          <Plus size={18} /> Tambah Supplier
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><p className="text-[#00232C]/50">Memuat data...</p></div>
        ) : suppliers.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="bg-[#00232C]/5 p-4 rounded-full mb-4"><Truck className="text-[#00232C]/40" size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Belum ada supplier</h3>
            <p className="text-[#00232C]/60">Tambahkan kontak pemasok untuk mempermudah restock bahan baku.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#00232C]/10 bg-white/40">
                  <th className="p-5 font-semibold text-[14px]">Nama Pemasok</th>
                  <th className="p-5 font-semibold text-[14px]">Kontak / Telepon</th>
                  <th className="p-5 font-semibold text-[14px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((item) => (
                  <tr key={item.id} className="border-b border-[#00232C]/5 hover:bg-white/40 transition-colors">
                    <td className="p-5 font-bold">{item.nama}</td>
                    <td className="p-5 text-[#00232C]/70">{item.kontak || '-'}</td>
                    <td className="p-5 text-right">
                      <button onClick={() => handleDelete(item.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors">
                        <Trash2 size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Tambah */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00232C]/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-[24px] border border-white/60 w-full max-w-md rounded-[24px] shadow-[0_20px_50px_rgba(0,35,44,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#00232C]/10 bg-white">
              <h3 className="text-xl font-bold">Tambah Supplier Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#00232C]/50 hover:bg-black/5 rounded-full"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 bg-[#FBFBF3] space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nama Pemasok</label>
                <input 
                  type="text" required value={formData.nama} onChange={e => setFormData({...formData, nama: e.target.value})} 
                  placeholder="Contoh: Agen Telur Pak Budi"
                  className="w-full h-12 px-4 border border-[#00232C]/20 rounded-[12px] focus:border-[#0053FF] outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Kontak / Telepon (Opsional)</label>
                <input 
                  type="text" value={formData.kontak} onChange={e => setFormData({...formData, kontak: e.target.value})} 
                  placeholder="Contoh: 081234567890"
                  className="w-full h-12 px-4 border border-[#00232C]/20 rounded-[12px] focus:border-[#0053FF] outline-none" 
                />
              </div>
              
              <div className="mt-8 pt-4 flex gap-3 border-t border-[#00232C]/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[#00232C]/60 font-medium hover:bg-[#00232C]/5 rounded-full">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#0053FF] text-white font-bold rounded-full disabled:opacity-50 hover:-translate-y-[1px] shadow-[0_4px_12px_rgba(0,83,255,0.25)]">
                  Simpan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}