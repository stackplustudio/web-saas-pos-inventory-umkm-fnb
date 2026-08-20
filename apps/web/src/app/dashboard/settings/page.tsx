"use client";

import { useState, useEffect } from "react";
import { Store, MapPin, Save, ShieldCheck } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function SettingsPage() {
  const [formData, setFormData] = useState({ nama_bisnis: "", alamat: "" });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/settings');
      setFormData({
        nama_bisnis: res.data.nama_bisnis || "",
        alamat: res.data.alamat || ""
      });
    } catch (error) {
      toast.error("Gagal memuat pengaturan toko");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await api.patch('/settings', formData);
      toast.success("Profil toko berhasil diperbarui!");
    } catch (error) {
      toast.error("Gagal menyimpan pengaturan");
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
     return <div className="flex justify-center items-center h-[50vh] text-[#00232C]/50">Memuat data...</div>;
  }

  return (
    <div className="max-w-[800px] mx-auto font-inter text-[#00232C]">
      <div className="mb-8">
        <h1 className="text-[40px] font-bold leading-tight">Profil Outlet</h1>
        <p className="text-[#00232C]/70 mt-1">Ubah nama dan alamat cabang bisnis Anda.</p>
      </div>

      <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-8">
        <form onSubmit={handleSave} className="space-y-6">
          
          <div>
            <label className="flex items-center gap-2 text-sm font-bold mb-2 text-[#00232C]">
              <Store size={18} className="text-[#0053FF]" /> Nama Outlet
            </label>
            <input 
              type="text" required
              value={formData.nama_bisnis}
              onChange={(e) => setFormData({...formData, nama_bisnis: e.target.value})}
              className="w-full h-14 bg-[#FBFBF3] border border-[#00232C]/10 focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF] rounded-[16px] px-5 outline-none transition-all text-lg font-semibold"
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-bold mb-2 text-[#00232C]">
              <MapPin size={18} className="text-[#0053FF]" /> Alamat Lengkap
            </label>
            <textarea 
              rows={3}
              value={formData.alamat}
              onChange={(e) => setFormData({...formData, alamat: e.target.value})}
              className="w-full bg-[#FBFBF3] border border-[#00232C]/10 focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF] rounded-[16px] p-5 outline-none transition-all resize-none font-medium"
              placeholder="Contoh: Jl. Sudirman No. 45, Jakarta Selatan"
            />
          </div>

          <div className="flex items-start gap-3 bg-[#16A34A]/10 p-4 rounded-[12px] border border-[#16A34A]/20">
            <ShieldCheck className="text-[#16A34A] shrink-0" size={24} />
            <div>
              <p className="font-bold text-[#16A34A] text-sm">Sinkronisasi Real-time</p>
              <p className="text-sm text-[#00232C]/70 mt-1">Perubahan ini akan langsung diterapkan pada cetakan struk pelanggan di layar POS Kasir.</p>
            </div>
          </div>

          <div className="pt-4 border-t border-[#00232C]/10 flex justify-end">
            <button 
              type="submit" 
              disabled={isSaving}
              className="flex items-center gap-2 h-14 px-8 bg-[#0053FF] text-white rounded-full font-bold shadow-[0_10px_30px_rgba(0,83,255,0.3)] hover:-translate-y-1 transition-all disabled:opacity-50"
            >
              <Save size={20} /> {isSaving ? "Menyimpan..." : "Simpan Profil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}