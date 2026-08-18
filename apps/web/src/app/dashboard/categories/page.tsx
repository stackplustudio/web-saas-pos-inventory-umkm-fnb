"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
// Catatan: Pastikan Anda sudah punya konfigurasi axios di lib/axios
// import axios from "@/lib/axios"; 

interface Category {
  id: string;
  nama_kategori: string;
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Simulasi fetch data (Nanti ganti dengan axios asli yang sudah bawa Bearer Token)
  useEffect(() => {
    // axios.get('/categories').then((res) => setCategories(res.data));
    setCategories([
      { id: "1", nama_kategori: "Kopi" },
      { id: "2", nama_kategori: "Snack" },
    ]);
    setIsLoading(false);
  }, []);

  return (
    <div className="max-w-[1280px] mx-auto p-6 md:p-8 font-inter text-[#00232C]">
      {/* Page Intro / Hero */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Kategori Menu</h1>
          <p className="text-[#00232C]/70 mt-1">Kelola kelompok menu untuk memudahkan kasir.</p>
        </div>
        
        {/* Primary Button (Pill radius 9999px, Primary Blue, hover translateY) */}
        <button className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all duration-200">
          <Plus size={18} />
          Tambah Kategori
        </button>
      </div>

      {/* GlassCard Container untuk Table */}
      <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] overflow-hidden">
        <div className="p-6">
          {isLoading ? (
            <p className="text-center py-10 text-[#00232C]/50">Memuat data...</p>
          ) : (
            <div className="w-full">
              {categories.map((cat) => (
                <div 
                  key={cat.id} 
                  className="flex items-center justify-between py-4 border-b border-[#00232C]/10 last:border-0"
                >
                  <span className="text-[16px] font-medium">{cat.nama_kategori}</span>
                  
                  <div className="flex items-center gap-2">
                    {/* Ghost Buttons */}
                    <button className="p-2 text-[#0053FF] hover:bg-[#0053FF]/10 rounded-full transition-colors">
                      <Edit2 size={16} />
                    </button>
                    <button className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors">
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}