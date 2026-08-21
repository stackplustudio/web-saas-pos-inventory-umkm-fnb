"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Cookies from "js-cookie"; 
import { ShieldAlert } from "lucide-react";

// 1. Komponen Isi Form (Yang memanggil useSearchParams)
function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams(); 
  
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(""); 

  useEffect(() => {
    if (searchParams.get("error") === "suspended") {
      setErrorMsg("Akses ditolak. Akun bisnis Anda sedang dibekukan oleh Administrator Sistem. Silakan hubungi layanan pelanggan.");
    }
  }, [searchParams]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(""); 

    try {
      const res = await api.post("/auth/login", formData);
      
      Cookies.set("token", res.data.access_token, { expires: 1 }); 
      localStorage.setItem("user", JSON.stringify(res.data.user));

      toast.success("Login berhasil!");

      const userRole = res.data.user.role;
      if (userRole === "SUPER_ADMIN") {
        router.push("/dashboard/superadmin"); 
      } else {
        router.push("/dashboard"); 
      }
    } catch (error: any) {
      if (error.response?.data?.message === 'SUSPENDED_TENANT') {
        setErrorMsg("Akses ditolak. Akun bisnis Anda sedang dibekukan.");
      } else {
        toast.error(error.response?.data?.message || "Email atau Password salah");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-[1200px] flex flex-col lg:flex-row items-center gap-10 lg:gap-20 relative z-10 p-4">
      
      {/* BAGIAN KIRI */}
      <div className="hidden lg:flex flex-col w-1/2 text-white pr-10">
        <div className="flex items-center gap-3 mb-12">
          <div className="bg-white p-2 rounded-xl text-[#0053FF] font-black text-xl flex items-center justify-center w-12 h-12 shadow-lg">
            NK
          </div>
          <span className="text-2xl font-bold tracking-wide">NusaKasir POS</span>
        </div>
        
        <h1 className="text-6xl font-bold mb-6 leading-tight">Mulai<br/>Shift Anda!</h1>
        <p className="text-xl text-blue-100 font-medium mb-6">
          SaaS POS & Inventory Management
        </p>
        <p className="text-sm text-blue-200/80 max-w-md leading-relaxed">
          Platform terpadu untuk menyederhanakan operasional kasir, memantau stok bahan baku otomatis, dan menganalisa laba bisnis F&B Anda dari mana saja.
        </p>
      </div>

      {/* BAGIAN KANAN */}
      <div className="w-full lg:w-1/2 max-w-[480px] mx-auto">
        <div className="bg-white rounded-[24px] p-8 sm:p-12 shadow-2xl">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-bold text-[#00232C] mb-2">Welcome Back</h2>
            <p className="text-[#00232C]/60 text-sm">Silakan masuk menggunakan kredensial Anda.</p>
          </div>

          {errorMsg && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-600 rounded-[12px] text-sm font-semibold flex gap-3 items-start animate-in fade-in zoom-in duration-300">
              <ShieldAlert size={20} className="shrink-0 mt-0.5" />
              <p>{errorMsg}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div className="space-y-2">
              <Input 
                type="email" required placeholder="Email"
                value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="h-12 bg-[#FBFBF3] border-transparent focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF] rounded-[12px] px-5 text-md text-[#00232C]"
              />
            </div>

            <div className="space-y-2">
              <Input 
                type="password" required placeholder="Password"
                value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="h-12 bg-[#FBFBF3] border-transparent focus:border-[#0053FF] focus:ring-1 focus:ring-[#0053FF] rounded-[12px] px-5 text-md text-[#00232C]"
              />
            </div>

            <div className="flex justify-end pt-1">
              <a href="#" className="text-sm text-[#0053FF] font-medium hover:underline">Lupa Password?</a>
            </div>

            <Button type="submit" disabled={isLoading} className="w-full h-12 mt-2 bg-[#0053FF] hover:bg-[#0047D9] text-white rounded-full text-md font-bold transition-all shadow-lg shadow-[#0053FF]/30">
              {isLoading ? "Memverifikasi..." : "Login"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}

// 2. Export Halaman Utama (Bungkus dengan Suspense)
export default function LoginPage() {
  return (
    <div className="min-h-screen bg-[#0053FF] flex items-center justify-center p-4 lg:p-0 relative overflow-hidden font-inter">
      {/* Dekorasi Cahaya Tipis */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-white/10 blur-[120px]"></div>
        <div className="absolute bottom-[10%] -right-[10%] w-[40%] h-[40%] rounded-full bg-white/10 blur-[100px]"></div>
      </div>

      {/* 🔥 KUNCINYA DI SINI: Bungkus komponen form dengan Suspense */}
      <Suspense fallback={<div className="text-white relative z-10 font-bold animate-pulse">Memuat antarmuka...</div>}>
        <LoginContent />
      </Suspense>
    </div>
  );
}