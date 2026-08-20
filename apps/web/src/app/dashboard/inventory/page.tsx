"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, PackageSearch, ArrowDownToLine, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Ingredient {
  id: string;
  nama: string;
  satuan: string;
  stok_saat_ini: number;
  stok_minimum: number;
  harga_beli_terakhir: number;
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // States untuk Modal Restock
  const [isRestockModalOpen, setIsRestockModalOpen] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [jumlahMasuk, setJumlahMasuk] = useState("");
  const [catatanMasuk, setCatatanMasuk] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchIngredients();
  }, []);

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data inventory");
    } finally {
      setIsLoading(false);
    }
  };

  const openRestockModal = (item: Ingredient) => {
    setSelectedIngredient(item);
    setJumlahMasuk("");
    setCatatanMasuk("");
    setIsRestockModalOpen(true);
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedIngredient || !jumlahMasuk) return;
    
    setIsSubmitting(true);
    try {
      await api.post('/stock-movements', {
        ingredientId: selectedIngredient.id,
        tipe: 'IN', // Catat sebagai barang masuk
        jumlah: parseFloat(jumlahMasuk),
        catatan: catatanMasuk || "Restock manual dari Dashboard"
      });
      
      toast.success(`Stok ${selectedIngredient.nama} berhasil ditambahkan!`);
      setIsRestockModalOpen(false);
      fetchIngredients(); // Refresh data tabel
    } catch (error) {
      toast.error("Gagal menambahkan stok");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Inventory Bahan Baku</h1>
          <p className="text-[#00232C]/70 mt-1">Kelola stok bahan dan harga beli untuk menghitung HPP.</p>
        </div>
        <button className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all duration-200">
          <Plus size={18} /> Tambah Bahan Baru
        </button>
      </div>

      {/* Content Table */}
      {isLoading ? (
         <div className="flex justify-center items-center py-20"><p className="text-[#00232C]/50">Memuat data inventory...</p></div>
      ) : ingredients.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 rounded-[20px] p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-[#00232C]/5 p-4 rounded-full mb-4"><PackageSearch className="text-[#00232C]/40" size={32} /></div>
          <h3 className="text-xl font-bold mb-2">Inventory Kosong</h3>
          <p className="text-[#00232C]/60 max-w-sm">Belum ada bahan baku yang terdaftar.</p>
        </div>
      ) : (
        <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#00232C]/10 bg-white/40">
                  <th className="p-5 font-semibold text-[14px]">Nama Bahan</th>
                  <th className="p-5 font-semibold text-[14px]">Stok Saat Ini</th>
                  <th className="p-5 font-semibold text-[14px]">Stok Minimum</th>
                  <th className="p-5 font-semibold text-[14px]">Harga Beli</th>
                  <th className="p-5 font-semibold text-[14px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {ingredients.map((item) => (
                  <tr key={item.id} className="border-b border-[#00232C]/5 hover:bg-white/40 transition-colors">
                    <td className="p-5 font-medium">{item.nama}</td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded-md text-[13px] font-bold ${item.stok_saat_ini <= item.stok_minimum ? 'bg-red-100 text-[#DC2626]' : 'bg-green-100 text-[#16A34A]'}`}>
                        {item.stok_saat_ini} {item.satuan}
                      </span>
                    </td>
                    <td className="p-5 text-[#00232C]/70">{item.stok_minimum} {item.satuan}</td>
                    <td className="p-5 text-[#00232C]/70">{formatRupiah(item.harga_beli_terakhir)}</td>
                    <td className="p-5 flex justify-end gap-2">
                      {/* Tombol Restock Baru */}
                      <button 
                        onClick={() => openRestockModal(item)}
                        className="flex items-center gap-1 px-3 py-1 bg-[#16A34A]/10 text-[#16A34A] hover:bg-[#16A34A]/20 font-semibold rounded-full transition-colors mr-2 text-[13px]"
                      >
                        <ArrowDownToLine size={14} /> Restock
                      </button>
                      <button className="p-2 text-[#0053FF] hover:bg-[#0053FF]/10 rounded-full transition-colors"><Edit2 size={16} /></button>
                      <button className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* MODAL RESTOCK */}
      {isRestockModalOpen && selectedIngredient && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00232C]/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-[24px] border border-white/60 w-full max-w-md rounded-[24px] shadow-[0_20px_50px_rgba(0,35,44,0.15)] overflow-hidden flex flex-col">
            
            <div className="flex items-center justify-between p-6 border-b border-[#00232C]/10 bg-white">
              <div>
                <h3 className="text-xl font-bold">Stok Masuk</h3>
                <p className="text-sm text-[#00232C]/60">Tambah stok untuk <span className="font-bold text-[#0053FF]">{selectedIngredient.nama}</span></p>
              </div>
              <button onClick={() => setIsRestockModalOpen(false)} className="p-2 text-[#00232C]/50 hover:text-[#00232C] hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleRestock} className="p-6 bg-[#FBFBF3]">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-semibold mb-2">Jumlah Tambahan ({selectedIngredient.satuan})</label>
                  <input 
                    type="number" step="0.01" required min="0.01"
                    value={jumlahMasuk} onChange={(e) => setJumlahMasuk(e.target.value)}
                    placeholder="Contoh: 10"
                    className="w-full h-12 bg-white border border-[#00232C]/20 focus:border-[#0053FF] rounded-[12px] px-4 outline-none font-medium"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-2">Catatan (Opsional)</label>
                  <input 
                    type="text" 
                    value={catatanMasuk} onChange={(e) => setCatatanMasuk(e.target.value)}
                    placeholder="Contoh: Belanja di Pasar Senen"
                    className="w-full h-12 bg-white border border-[#00232C]/20 focus:border-[#0053FF] rounded-[12px] px-4 outline-none"
                  />
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3">
                <button type="button" onClick={() => setIsRestockModalOpen(false)} className="px-5 py-3 text-[#00232C]/60 font-medium hover:bg-[#00232C]/5 rounded-full">Batal</button>
                <button type="submit" disabled={isSubmitting} className="px-6 py-3 bg-[#0053FF] text-white font-bold rounded-full shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] disabled:opacity-50">
                  {isSubmitting ? "Menyimpan..." : "Simpan Stok"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}