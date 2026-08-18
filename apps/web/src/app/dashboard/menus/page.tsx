"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon } from "lucide-react";
import { api } from "@/lib/axios";

interface Category {
  id: string;
  nama_kategori: string;
}

interface MenuItem {
  id: string;
  nama: string;
  harga_jual: number;
  status: boolean;
  category: Category;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchMenus();
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenus(response.data);
    } catch (error) {
      console.error("Gagal mengambil data menu", error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="max-w-[1280px] mx-auto p-6 md:p-8 font-inter text-[#00232C]">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Daftar Menu</h1>
          <p className="text-[#00232C]/70 mt-1">Kelola item produk yang dijual di outlet Anda.</p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all duration-200">
          <Plus size={18} />
          Tambah Menu
        </button>
      </div>

      {/* Grid Layout untuk Menu Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-[#00232C]/50">Memuat data menu...</p>
        </div>
      ) : menus.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 rounded-[20px] p-10 flex flex-col items-center justify-center text-center">
          <div className="bg-[#00232C]/5 p-4 rounded-full mb-4">
            <ImageIcon className="text-[#00232C]/40" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Belum ada menu</h3>
          <p className="text-[#00232C]/60 max-w-sm">Anda belum menambahkan menu apapun. Silakan tambah menu pertama Anda untuk mulai berjualan.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menus.map((menu) => (
            <div 
              key={menu.id} 
              className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-5 transition-transform duration-200 hover:-translate-y-[4px]"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-[#0053FF]/10 text-[#0053FF] text-[12px] font-semibold rounded-full">
                  {menu.category?.nama_kategori || 'Tanpa Kategori'}
                </span>
                <span className={`px-2 py-1 text-[12px] font-bold rounded-full ${menu.status ? 'bg-green-100 text-[#16A34A]' : 'bg-red-100 text-[#DC2626]'}`}>
                  {menu.status ? 'Tersedia' : 'Habis (86)'}
                </span>
              </div>
              
              <h3 className="text-[22px] font-bold leading-tight mb-2">{menu.nama}</h3>
              <p className="text-[#0053FF] font-bold text-lg mb-6">{formatRupiah(menu.harga_jual)}</p>
              
              <div className="flex justify-end gap-2 border-t border-[#00232C]/10 pt-4 mt-auto">
                <button className="p-2 text-[#00232C]/70 hover:bg-[#0053FF]/10 hover:text-[#0053FF] rounded-full transition-colors">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-[#00232C]/70 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}