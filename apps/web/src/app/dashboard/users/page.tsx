"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Users as UsersIcon, UserX, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "", password: "", role: "KASIR" });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      setUsers(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data pegawai");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('/users', formData);
      toast.success("Pegawai berhasil ditambahkan!");
      setIsModalOpen(false);
      setFormData({ name: "", email: "", password: "", role: "KASIR" });
      fetchUsers();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambahkan pegawai");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeactivate = async (id: string) => {
    if(!confirm("Yakin ingin menonaktifkan pegawai ini?")) return;
    try {
      await api.delete(`/users/${id}`);
      toast.success("Pegawai dinonaktifkan");
      fetchUsers();
    } catch (error) {
      toast.error("Gagal menonaktifkan pegawai");
    }
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Manajemen Pegawai</h1>
          <p className="text-[#00232C]/70 mt-1">Kelola akses Kasir, Manager, dan staff dapur Anda.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all"
        >
          <Plus size={18} /> Tambah Pegawai
        </button>
      </div>

      <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] overflow-hidden">
        {isLoading ? (
          <div className="flex justify-center py-20"><p className="text-[#00232C]/50">Memuat data pegawai...</p></div>
        ) : users.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <div className="bg-[#00232C]/5 p-4 rounded-full mb-4"><UsersIcon className="text-[#00232C]/40" size={32} /></div>
            <h3 className="text-xl font-bold mb-2">Belum ada pegawai</h3>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-[#00232C]/10 bg-white/40">
                  <th className="p-5 font-semibold text-[14px]">Nama & Email</th>
                  <th className="p-5 font-semibold text-[14px]">Role</th>
                  <th className="p-5 font-semibold text-[14px]">Status</th>
                  <th className="p-5 font-semibold text-[14px] text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.id} className="border-b border-[#00232C]/5 hover:bg-white/40 transition-colors">
                    <td className="p-5">
                      <p className="font-bold">{user.name}</p>
                      <p className="text-sm text-[#00232C]/60">{user.email}</p>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                        user.role === 'OWNER' ? 'bg-[#F59E0B]/10 text-[#F59E0B]' : 'bg-[#0053FF]/10 text-[#0053FF]'
                      }`}>
                        {user.role}
                      </span>
                    </td>
                    <td className="p-5">
                      <span className={`px-2 py-1 rounded-md text-[11px] font-bold ${
                        user.status === 'ACTIVE' ? 'bg-green-100 text-[#16A34A]' : 'bg-red-100 text-[#DC2626]'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="p-5 text-right">
                      {user.role !== 'OWNER' && (
                        <button onClick={() => handleDeactivate(user.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors" title="Nonaktifkan">
                          <UserX size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL TAMBAH PEGAWAI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00232C]/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-[24px] border border-white/60 w-full max-w-md rounded-[24px] shadow-[0_20px_50px_rgba(0,35,44,0.15)] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-[#00232C]/10 bg-white">
              <h3 className="text-xl font-bold">Tambah Pegawai Baru</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-2 text-[#00232C]/50 hover:text-[#00232C] hover:bg-black/5 rounded-full transition-colors"><X size={20} /></button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 bg-[#FBFBF3] space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Nama Lengkap</label>
                <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full h-12 px-4 border border-[#00232C]/20 rounded-[12px] focus:border-[#0053FF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Email Login</label>
                <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full h-12 px-4 border border-[#00232C]/20 rounded-[12px] focus:border-[#0053FF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Password Sementara</label>
                <input type="text" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} className="w-full h-12 px-4 border border-[#00232C]/20 rounded-[12px] focus:border-[#0053FF] outline-none" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Hak Akses (Role)</label>
                <select value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full h-12 px-4 border border-[#00232C]/20 rounded-[12px] focus:border-[#0053FF] outline-none bg-white">
                  <option value="KASIR">KASIR</option>
                  <option value="MANAGER">MANAGER</option>
                  <option value="DAPUR">STAF DAPUR</option>
                </select>
              </div>
              <div className="mt-8 pt-4 flex gap-3 border-t border-[#00232C]/10">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-3 text-[#00232C]/60 font-medium hover:bg-[#00232C]/5 rounded-full">Batal</button>
                <button type="submit" disabled={isSubmitting} className="flex-1 py-3 bg-[#0053FF] text-white font-bold rounded-full disabled:opacity-50 hover:-translate-y-[1px] transition-transform shadow-[0_4px_12px_rgba(0,83,255,0.25)]">
                  Simpan Pegawai
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}