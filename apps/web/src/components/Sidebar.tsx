"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  List, 
  Coffee, 
  Package, 
  Users, 
  Settings, 
  LogOut,
  ReceiptText
} from "lucide-react";
import Cookies from "js-cookie";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Kategori", href: "/dashboard/categories", icon: List },
    { name: "Daftar Menu", href: "/dashboard/menus", icon: Coffee },
    { name: "Transaksi", href: "/dashboard/orders", icon: ReceiptText },
    { name: "Inventory", href: "/dashboard/inventory", icon: Package },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#00232C] text-white flex flex-col font-inter flex-shrink-0">
      {/* Branding */}
      <div className="p-6 flex items-center gap-3 border-b border-white/10">
        <div className="bg-[#0053FF] text-white font-black text-lg flex items-center justify-center w-10 h-10 rounded-[10px]">
          NK
        </div>
        <span className="text-xl font-bold tracking-wide">NusaKasir</span>
      </div>

      {/* Menu Navigasi */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-1">
        <p className="px-4 text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">
          Menu Utama
        </p>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 ${
                isActive 
                  ? "bg-[#0053FF] text-white font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)]" 
                  : "text-white/60 hover:text-white hover:bg-white/5"
              }`}
            >
              <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
              <span className="text-[14px]">{item.name}</span>
            </Link>
          );
        })}

        <div className="mt-8 mb-2">
          <p className="px-4 text-[11px] font-bold text-white/40 uppercase tracking-wider mb-2">
            Pengaturan
          </p>
          <Link
            href="/dashboard/settings"
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Settings size={20} />
            <span className="text-[14px]">Sistem POS</span>
          </Link>
          <Link
            href="/dashboard/users"
            className="flex items-center gap-3 px-4 py-3 rounded-[12px] text-white/60 hover:text-white hover:bg-white/5 transition-all duration-200"
          >
            <Users size={20} />
            <span className="text-[14px]">Pegawai</span>
          </Link>
        </div>
      </div>

      {/* Logout */}
      <div className="p-4 border-t border-white/10">
        <button 
          onClick={handleLogout}
          className="flex items-center w-full gap-3 px-4 py-3 rounded-[12px] text-white/60 hover:text-red-400 hover:bg-red-400/10 transition-all duration-200"
        >
          <LogOut size={20} />
          <span className="text-[14px] font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}