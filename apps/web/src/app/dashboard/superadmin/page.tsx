"use client";

import { useState, useEffect } from "react";
import { ShieldAlert, Building2, Ban, CheckCircle2, Plus, X, User } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  // State untuk Modal Tambah Klien
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    nama_bisnis: "",
    alamat: "",
    owner_name: "",
    owner_email: "",
    owner_password: "",
  });

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      if (user.role !== "SUPER_ADMIN") {
        router.push("/dashboard"); 
        return;
      }
    }
    fetchTenants();
  }, []);

  const fetchTenants = async () => {
    try {
      const res = await api.get('/tenants');
      setTenants(res.data);
    } catch (error) {
      toast.error("Akses ditolak atau gagal memuat data klien.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (id: string, currentStatus: string, namaBisnis: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    const actionText = newStatus === 'SUSPENDED' ? 'membekukan' : 'mengaktifkan kembali';
    if (!confirm(`Apakah Anda yakin ingin ${actionText} akses untuk klien: ${namaBisnis}?`)) return;

    try {
      await api.patch(`/tenants/${id}/status`, { status: newStatus });
      toast.success(`Status ${namaBisnis} berhasil diubah menjadi ${newStatus}`);
      fetchTenants();
    } catch (error) {
      toast.error("Gagal mengubah status klien");
    }
  };

  const handleCreateTenant = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/tenants', formData);
      toast.success("Klien dan Akun Owner berhasil dibuat!");
      setIsModalOpen(false);
      setFormData({ nama_bisnis: "", alamat: "", owner_name: "", owner_email: "", owner_password: "" }); // Reset form
      fetchTenants(); // Refresh tabel
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal mendaftarkan klien baru");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-bold text-lg animate-pulse text-[#0053FF]">Memverifikasi Otoritas Super Admin...</div>;

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C] pb-20">
      
      {/* HEADER PORTAL */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <ShieldAlert size={28} className="text-[#0053FF]" />
            <h1 className="text-[40px] font-black leading-tight text-transparent bg-clip-text bg-gradient-to-r from-[#0053FF] to-purple-600">
              SaaS Control Center
            </h1>
          </div>
          <p className="text-[#00232C]/70 max-w-2xl">
            Pusat kendali utama platform. Kelola status langganan klien dan pantau performa seluruh restoran yang menggunakan ekosistem ini.
          </p>
        </div>
        
        {/* TOMBOL TAMBAH KLIEN */}
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-bold shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all"
        >
          <Plus size={20} /> Daftarkan Klien Baru
        </button>
      </div>

      {/* TABEL DATA KLIEN */}
      <div className="bg-white/80 backdrop-blur-[24px] border border-white shadow-[0_10px_40px_rgba(0,0,0,0.05)] rounded-[24px] overflow-hidden">
        <div className="p-6 border-b border-[#00232C]/10 flex items-center justify-between bg-white">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Building2 size={22} className="text-[#0053FF]" /> Daftar Klien Terdaftar
          </h2>
          <span className="bg-blue-50 text-[#0053FF] px-4 py-2 rounded-full text-sm font-bold shadow-sm">
            Total: {tenants.length} Klien
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50 text-[#00232C]/60 text-sm border-b border-[#00232C]/10">
                <th className="p-5 font-semibold">Nama Bisnis & ID</th>
                <th className="p-5 font-semibold">Statistik Sistem</th>
                <th className="p-5 font-semibold">Status Langganan</th>
                <th className="p-5 font-semibold text-right">Aksi Portal</th>
              </tr>
            </thead>
            <tbody>
              {tenants.map((tenant) => (
                <tr key={tenant.id} className="border-b border-[#00232C]/5 hover:bg-white transition-colors group">
                  <td className="p-5">
                    <p className="font-bold text-base text-[#00232C]">{tenant.nama_bisnis}</p>
                    <p className="text-xs text-[#00232C]/50 font-mono mt-1">{tenant.id}</p>
                  </td>
                  <td className="p-5">
                    <div className="flex gap-4 text-sm font-medium">
                      <span className="bg-blue-50 text-blue-700 px-3 py-1 rounded-md">{tenant._count?.users || 0} Pegawai</span>
                      <span className="bg-green-50 text-green-700 px-3 py-1 rounded-md">{tenant._count?.orders || 0} Transaksi</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 w-max ${
                      tenant.status_langganan === 'ACTIVE' ? 'bg-green-100 text-green-700' : 
                      tenant.status_langganan === 'SUSPENDED' ? 'bg-red-100 text-red-700' : 
                      'bg-yellow-100 text-yellow-700'
                    }`}>
                      {tenant.status_langganan === 'ACTIVE' && <CheckCircle2 size={14}/>}
                      {tenant.status_langganan === 'SUSPENDED' && <Ban size={14}/>}
                      {tenant.status_langganan}
                    </span>
                  </td>
                  <td className="p-5 text-right">
                    <button 
                      onClick={() => handleUpdateStatus(tenant.id, tenant.status_langganan, tenant.nama_bisnis)}
                      className={`px-4 py-2 rounded-full text-sm font-bold transition-all ${
                        tenant.status_langganan === 'ACTIVE' 
                          ? 'bg-red-50 text-red-600 hover:bg-red-600 hover:text-white' 
                          : 'bg-green-50 text-green-600 hover:bg-green-600 hover:text-white'
                      }`}
                    >
                      {tenant.status_langganan === 'ACTIVE' ? 'Suspend Klien' : 'Aktifkan Akses'}
                    </button>
                  </td>
                </tr>
              ))}
              {tenants.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-10 text-center text-gray-400">Belum ada klien yang terdaftar.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL TAMBAH KLIEN */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white p-8 rounded-[24px] max-w-xl w-full shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-2xl font-bold text-[#00232C]">Onboarding Klien Baru</h2>
                <p className="text-sm text-gray-500 mt-1">Sistem akan otomatis membuatkan akun Owner.</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTenant} className="space-y-6">
              {/* Form Data Bisnis */}
              <div className="p-5 bg-gray-50 border border-gray-100 rounded-[16px] space-y-4">
                <h3 className="font-bold text-sm text-[#0053FF] flex items-center gap-2"><Building2 size={16}/> PROFIL BISNIS (TENANT)</h3>
                <input required type="text" placeholder="Nama Bisnis / Restoran" 
                  value={formData.nama_bisnis} onChange={e => setFormData({...formData, nama_bisnis: e.target.value})} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-[12px] focus:outline-none focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF]" />
                <input type="text" placeholder="Alamat Lengkap (Opsional)" 
                  value={formData.alamat} onChange={e => setFormData({...formData, alamat: e.target.value})} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-[12px] focus:outline-none focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF]" />
              </div>

              {/* Form Data Owner */}
              <div className="p-5 bg-[#0053FF]/5 border border-[#0053FF]/10 rounded-[16px] space-y-4">
                <h3 className="font-bold text-sm text-[#0053FF] flex items-center gap-2"><User size={16}/> KREDENSIAL AKUN OWNER</h3>
                <input required type="text" placeholder="Nama Lengkap Owner" 
                  value={formData.owner_name} onChange={e => setFormData({...formData, owner_name: e.target.value})} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-[12px] focus:outline-none focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF]" />
                <input required type="email" placeholder="Email untuk Login" 
                  value={formData.owner_email} onChange={e => setFormData({...formData, owner_email: e.target.value})} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-[12px] focus:outline-none focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF]" />
                <input required type="password" placeholder="Password Akun" 
                  value={formData.owner_password} onChange={e => setFormData({...formData, owner_password: e.target.value})} 
                  className="w-full h-12 px-4 border border-gray-300 rounded-[12px] focus:outline-none focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF]" />
              </div>

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3.5 bg-gray-100 text-gray-700 font-bold rounded-full hover:bg-gray-200">
                  Batal
                </button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3.5 bg-[#0053FF] text-white font-bold rounded-full shadow-lg shadow-[#0053FF]/30 hover:bg-[#0047D9] disabled:opacity-50">
                  {isSubmitting ? "Memproses..." : "Daftarkan Sekarang"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}