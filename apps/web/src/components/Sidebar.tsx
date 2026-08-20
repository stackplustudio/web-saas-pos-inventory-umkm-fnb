"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { 
  LayoutDashboard, List, Coffee, Package, Users, LogOut, ReceiptText, MonitorPlay, LayoutGrid, Settings, Truck, Tag,
  ShoppingBag, TrendingUp,
  ShieldAlert
} from "lucide-react";
import Cookies from "js-cookie";

interface UserData {
  name: string;
  email: string;
  role: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      setUserData(JSON.parse(userStr));
    }
  }, []);

  const handleLogout = () => {
    Cookies.remove("token");
    localStorage.removeItem("user");
    router.push("/auth/login");
  };

  // Pengelompokan Menu (Grouping)
  const menuGroups = [
    {
      title: "UTAMA",
      items: [
        { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Transaksi", href: "/dashboard/orders", icon: ReceiptText, roles: ["OWNER", "MANAGER"] },
        { name: "Laporan Keuangan", href: "/dashboard/reports", icon: TrendingUp, roles: ["OWNER", "MANAGER"] },
      ]
    },
    {
      title: "KATALOG",
      items: [
        { name: "Kategori", href: "/dashboard/categories", icon: List, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Daftar Menu", href: "/dashboard/menus", icon: Coffee, roles: ["OWNER", "MANAGER", "KASIR"] },
      ]
    },
    {
      title: "OPERASIONAL",
      items: [
        { name: "Manajemen Meja", href: "/dashboard/tables", icon: LayoutGrid, roles: ["OWNER", "MANAGER", "KASIR"] },
        { name: "Inventory", href: "/dashboard/inventory", icon: Package, roles: ["OWNER", "MANAGER"] },
        { name: "Supplier", href: "/dashboard/suppliers", icon: Truck, roles: ["OWNER", "MANAGER"] },
        { name: "Purchase Order", href: "/dashboard/purchase-orders", icon: ShoppingBag, roles: ["OWNER", "MANAGER"] },
        { name: "Promo & Diskon", href: "/dashboard/discounts", icon: Tag, roles: ["OWNER", "MANAGER"] },
        { name: "Pegawai", href: "/dashboard/users", icon: Users, roles: ["OWNER", "MANAGER"] },
        { name: "Pengaturan", href: "/dashboard/settings", icon: Settings, roles: ["OWNER"] },
      ]
    },
    {
      title: "SYSTEM ADMIN",
      items: [
        { name: "SaaS Control Center", href: "/dashboard/superadmin", icon: ShieldAlert, roles: ["SUPER_ADMIN"] },
      ]
    },
  ];

  return (
    <div className="w-[260px] h-screen bg-[#0053FF] text-white flex flex-col font-inter flex-shrink-0 shadow-xl z-20">
      
      {/* Brand Logo */}
      <div className="p-6 flex items-center gap-3 border-b border-white/20">
        <div className="bg-white text-[#0053FF] font-black text-lg flex items-center justify-center w-10 h-10 rounded-[10px]">NK</div>
        <span className="text-xl font-bold tracking-wide">NusaKasir</span>
      </div>

      {/* Menu List - SCROLLBAR DIHILANGKAN DI SINI */}
      <div className="flex-1 overflow-y-auto py-6 px-4 space-y-6 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
        {menuGroups.map((group, idx) => {
          // Filter item berdasarkan role
          const filteredItems = group.items.filter(item => item.roles.includes(userData?.role || ""));
          if (filteredItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <p className="px-4 text-[11px] font-bold text-white/50 uppercase tracking-wider mb-2">{group.title}</p>
              {filteredItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name} href={item.href}
                    className={`flex items-center gap-3 px-4 py-3 rounded-[12px] transition-all duration-200 ${
                      isActive ? "bg-white text-[#0053FF] font-bold shadow-md" : "text-white/80 hover:text-white hover:bg-white/10"
                    }`}
                  >
                    <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                    <span className="text-[14px]">{item.name}</span>
                  </Link>
                );
              })}
            </div>
          );
        })}

        {/* 🔥 PERBAIKAN DI SINI: Tombol ditaruh di dalam div list menu, dan hanya 1 blok ini saja */}
        {userData?.role !== "SUPER_ADMIN" && (
          <Link href="/pos" className="flex items-center gap-3 px-4 py-3 mt-4 rounded-[12px] text-white bg-white/20 border border-white/30 hover:bg-white/30 transition-all duration-200">
            <MonitorPlay size={20} />
            <span className="text-[14px] font-bold">Buka Layar POS</span>
          </Link>
        )}
      </div> {/* <-- Ini adalah tag penutup div scrollbar */}

      {/* User Profile & Logout */}
      <div className="p-4 border-t border-white/20 bg-black/10">
        {userData && (
          <div className="flex items-center gap-3 px-3 py-2 mb-3 bg-white/10 rounded-[12px]">
            <div className="w-9 h-9 rounded-full bg-white text-[#0053FF] flex items-center justify-center font-black uppercase text-sm flex-shrink-0">
              {userData.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-bold truncate text-white leading-tight">{userData.name}</p>
              <p className="text-[11px] font-medium text-white/60 truncate uppercase">{userData.role}</p>
            </div>
          </div>
        )}
        <button onClick={handleLogout} className="flex items-center justify-center w-full gap-2 px-4 py-2.5 rounded-[12px] text-white/80 hover:text-white hover:bg-red-500 transition-all duration-200">
          <LogOut size={18} />
          <span className="text-[14px] font-medium">Log Out</span>
        </button>
      </div>
    </div>
  );
}