import Sidebar from "@/components/Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    // Background utama menggunakan Soft Neutral Background sesuai ui.md
    <div className="flex h-screen bg-[#FBFBF3] overflow-hidden">
      
      {/* Sidebar statis di kiri */}
      <Sidebar />
      
      {/* Area konten utama yang bisa di-scroll */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
      
    </div>
  );
}