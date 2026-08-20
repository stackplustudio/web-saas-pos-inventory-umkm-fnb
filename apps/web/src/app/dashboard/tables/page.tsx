"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, LayoutGrid } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Table {
  id: string;
  nomor_meja: string;
  area: string;
  status: string;
}

export default function TablesPage() {
  const [tables, setTables] = useState<Table[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // State untuk form sederhana (Bisa diubah jadi Modal/Dialog jika butuh divalidasi ketat)
  const [nomorMeja, setNomorMeja] = useState("");
  const [area, setArea] = useState("");

  useEffect(() => {
    fetchTables();
  }, []);

  const fetchTables = async () => {
    try {
      const response = await api.get('/tables');
      setTables(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data meja");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTable = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nomorMeja) return;

    try {
      await api.post('/tables', { nomor_meja: nomorMeja, area });
      toast.success("Meja berhasil ditambahkan");
      setNomorMeja("");
      setArea("");
      fetchTables();
    } catch (error) {
      toast.error("Gagal menambahkan meja");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/tables/${id}`);
      toast.success("Meja dihapus");
      fetchTables();
    } catch (error) {
      toast.error("Gagal menghapus meja");
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Manajemen Meja</h1>
          <p className="text-[#00232C]/70 mt-1">Atur tata letak meja untuk pesanan Dine-in.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Kolom Kiri: Form Tambah */}
        <div className="lg:col-span-1">
          <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-6 sticky top-6">
            <h3 className="text-xl font-bold mb-4 flex items-center gap-2"><Plus size={20}/> Tambah Meja</h3>
            <form onSubmit={handleAddTable} className="space-y-4">
              <div>
                <label className="block text-[14px] font-semibold mb-2">Nomor Meja</label>
                <input 
                  type="text" required value={nomorMeja} onChange={(e) => setNomorMeja(e.target.value)}
                  placeholder="Contoh: A1, Teras-2"
                  className="w-full h-12 bg-[#FBFBF3] border border-[#00232C]/10 focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF] rounded-[12px] px-4 outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-[14px] font-semibold mb-2">Area (Opsional)</label>
                <input 
                  type="text" value={area} onChange={(e) => setArea(e.target.value)}
                  placeholder="Contoh: Indoor, Smoking Area"
                  className="w-full h-12 bg-[#FBFBF3] border border-[#00232C]/10 focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF] rounded-[12px] px-4 outline-none transition-all"
                />
              </div>
              <button type="submit" className="w-full h-12 bg-[#0053FF] text-white rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all">
                Simpan Meja
              </button>
            </form>
          </div>
        </div>

        {/* Kolom Kanan: Grid Meja */}
        <div className="lg:col-span-2">
          {isLoading ? (
            <div className="flex justify-center py-20"><p className="text-[#00232C]/50">Memuat meja...</p></div>
          ) : tables.length === 0 ? (
            <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 rounded-[20px] p-10 flex flex-col items-center text-center">
              <div className="bg-[#00232C]/5 p-4 rounded-full mb-4"><LayoutGrid className="text-[#00232C]/40" size={32} /></div>
              <h3 className="text-xl font-bold mb-2">Belum ada meja</h3>
              <p className="text-[#00232C]/60">Tambahkan meja di form sebelah kiri untuk memulai.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {tables.map(table => (
                <div key={table.id} className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-5 flex flex-col items-center justify-center relative group">
                  <span className={`absolute top-3 left-3 w-3 h-3 rounded-full ${table.status === 'KOSONG' ? 'bg-[#16A34A]' : 'bg-[#DC2626]'}`}></span>
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleDelete(table.id)} className="p-1 text-red-500 hover:bg-red-50 rounded-full"><Trash2 size={16}/></button>
                  </div>
                  
                  <h4 className="text-3xl font-black text-[#00232C] mt-2">{table.nomor_meja}</h4>
                  <p className="text-[12px] font-semibold text-[#00232C]/50 uppercase tracking-wide mt-1">{table.area || 'Tanpa Area'}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}