"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";
import { ShoppingCart, LogOut, CheckCircle2, LockKeyhole, Coins, Tag, Printer, X } from "lucide-react";

interface MenuItem { id: string; nama: string; harga_jual: number; status: boolean; }
interface CartItem extends MenuItem { qty: number; catatan: string; }
interface Shift { id: string; modal_awal: number; kas_sistem: number; waktu_buka: string; }
interface Discount { id: string; nama: string; tipe: string; nilai: number; }

export default function POSPage() {
  const router = useRouter();
  
  // States
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // States Shift
  const [activeShift, setActiveShift] = useState<Shift | null>(null);
  const [isLoadingShift, setIsLoadingShift] = useState(true);
  const [modalAwal, setModalAwal] = useState("");
  const [kasFisik, setKasFisik] = useState("");
  const [isCloseShiftModalOpen, setIsCloseShiftModalOpen] = useState(false);

  // States Diskon
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [selectedDiscount, setSelectedDiscount] = useState<Discount | null>(null);
  const [isDiscountModalOpen, setIsDiscountModalOpen] = useState(false);

  // States Struk / Receipt
  const [lastOrder, setLastOrder] = useState<any>(null);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);

  useEffect(() => {
    checkActiveShift();
    fetchMenus();
    fetchDiscounts();
  }, []);

  const checkActiveShift = async () => {
    try {
      const res = await api.get('/shifts/active');
      setActiveShift(res.data);
    } catch (error) { console.error("Gagal mengecek shift"); } 
    finally { setIsLoadingShift(false); }
  };

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenus(response.data.filter((m: MenuItem) => m.status));
    } catch (error) { toast.error("Gagal load menu"); }
  };

  const fetchDiscounts = async () => {
    try {
      const res = await api.get('/discounts?activeOnly=true');
      setDiscounts(res.data);
    } catch (error) { console.error("Gagal load promo"); }
  };

  const handleOpenShift = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await api.post('/shifts/open', { modal_awal: parseInt(modalAwal) || 0 });
      setActiveShift(res.data);
      toast.success("Shift berhasil dibuka.");
    } catch (error: any) { toast.error("Gagal membuka shift"); }
  };

  const handleCloseShift = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeShift) return;
    try {
      await api.patch(`/shifts/close/${activeShift.id}`, { kas_fisik: parseInt(kasFisik) || 0 });
      toast.success("Shift ditutup.");
      setActiveShift(null);
      setIsCloseShiftModalOpen(false);
      setModalAwal(""); setKasFisik("");
    } catch (error) { toast.error("Gagal menutup shift"); }
  };

  const addToCart = (menu: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === menu.id);
      if (existing) return prev.map((item) => item.id === menu.id ? { ...item, qty: item.qty + 1 } : item);
      return [...prev, { ...menu, qty: 1, catatan: "" }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart((prev) => prev.map((item) => {
      if (item.id === id) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : item;
      }
      return item;
    }));
  };

  // --- LOGIKA KALKULASI MATEMATIKA ---
  const subtotal = cart.reduce((sum, item) => sum + (item.harga_jual * item.qty), 0);
  
  let diskonNominal = 0;
  if (selectedDiscount) {
    if (selectedDiscount.tipe === 'PERSENTASE') {
      diskonNominal = Math.round(subtotal * (selectedDiscount.nilai / 100));
    } else {
      diskonNominal = selectedDiscount.nilai;
    }
  }

  // Mencegah subtotal minus
  const subtotalSetelahDiskon = Math.max(0, subtotal - diskonNominal);
  const pajak = Math.round(subtotalSetelahDiskon * 0.11);
  const total = subtotalSetelahDiskon + pajak;

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      await api.post('/orders', {
        tipe: "TAKEAWAY",
        metode_bayar: "TUNAI",
        discountId: selectedDiscount?.id,
        diskon_nominal: diskonNominal,
        items: cart.map(item => ({ menuItemId: item.id, qty: item.qty, harga: item.harga_jual, catatan: item.catatan }))
      });
      
      toast.success("Transaksi Berhasil!");
      
      // Simpan data untuk dicetak di struk
      setLastOrder({
        items: [...cart],
        subtotal,
        diskonNama: selectedDiscount?.nama || null,
        diskonNominal,
        pajak,
        total,
        waktu: new Date().toLocaleString('id-ID')
      });

      setCart([]);
      setSelectedDiscount(null);
      checkActiveShift();
      setIsReceiptModalOpen(true); // Buka modal cetak struk

    } catch (error) {
      toast.error("Transaksi gagal diproses.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(num);

  const handlePrint = () => {
    window.print();
  };

  if (isLoadingShift) return <div className="h-screen flex items-center justify-center bg-[#FBFBF3] text-[#00232C] font-inter">Memuat Sistem...</div>;

  if (!activeShift) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#FBFBF3] font-inter text-[#00232C] p-4 relative print:hidden">
        <div className="bg-white p-8 rounded-[24px] shadow-2xl max-w-md w-full text-center">
          <LockKeyhole size={32} className="mx-auto mb-4 text-[#0053FF]" />
          <h2 className="text-2xl font-bold mb-2">Buka Shift Kasir</h2>
          <form onSubmit={handleOpenShift} className="space-y-4">
            <input type="number" required value={modalAwal} onChange={(e) => setModalAwal(e.target.value)} className="w-full h-14 px-4 bg-[#FBFBF3] border-none rounded-[16px] text-lg outline-none" placeholder="Modal Awal (Rp)" />
            <button type="submit" className="w-full h-14 bg-[#0053FF] text-white rounded-[16px] font-bold">Mulai Bertugas</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#FBFBF3] font-inter overflow-hidden print:bg-white">
      
      {/* AREA KIRI: Menu & Header (Sembunyikan saat nge-print) */}
      <div className="w-2/3 h-full flex flex-col border-r border-[#00232C]/10 print:hidden">
        <div className="bg-white px-6 py-4 flex justify-between items-center shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => router.push('/dashboard')} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200"><LogOut size={16} /></button>
            <h1 className="text-xl font-bold text-[#00232C]">POS Kasir</h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="text-right text-sm">
              <p className="text-[#00232C]/50 font-semibold">Kas Sistem Saat Ini</p>
              <p className="font-bold text-[#0053FF]">{formatRp(activeShift.kas_sistem)}</p>
            </div>
            <button onClick={() => setIsCloseShiftModalOpen(true)} className="px-4 py-2 bg-red-50 text-red-600 font-bold rounded-full">Tutup Shift</button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {menus.map((menu) => (
              <div key={menu.id} onClick={() => addToCart(menu)} className="bg-white rounded-[16px] p-4 cursor-pointer hover:border-[#0053FF] border border-transparent shadow-sm flex flex-col justify-between h-[120px]">
                <h3 className="font-bold text-sm leading-tight">{menu.nama}</h3>
                <p className="text-[#0053FF] font-bold mt-auto">{formatRp(menu.harga_jual)}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AREA KANAN: Keranjang (Sembunyikan saat nge-print) */}
      <div className="w-1/3 h-full bg-white flex flex-col shadow-lg z-20 print:hidden">
        <div className="p-6 border-b border-[#00232C]/10 flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2"><ShoppingCart size={22} /> Pesanan Saat Ini</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="p-3 bg-[#FBFBF3] rounded-[14px]">
              <div className="flex justify-between items-start">
                <span className="font-semibold text-sm">{item.nama}</span>
                <span className="font-bold text-[#0053FF]">{formatRp(item.harga_jual * item.qty)}</span>
              </div>
              <div className="flex items-center justify-between mt-2">
                <button onClick={() => setCart(cart.filter(c => c.id !== item.id))} className="text-xs text-red-500">Hapus</button>
                <div className="flex items-center gap-2 bg-white rounded-full px-1 py-1">
                  <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 rounded-full bg-gray-100">-</button>
                  <span className="font-bold w-4 text-center text-sm">{item.qty}</span>
                  <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 rounded-full bg-[#0053FF] text-white">+</button>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="p-6 border-t border-[#00232C]/10 bg-white">
          
          {/* Tombol Pemilih Promo */}
          <button 
            onClick={() => setIsDiscountModalOpen(true)}
            className="w-full flex items-center justify-between p-3 mb-4 rounded-[12px] border border-dashed border-[#0053FF]/50 bg-[#0053FF]/5 hover:bg-[#0053FF]/10 transition-colors"
          >
            <div className="flex items-center gap-2 text-[#0053FF] font-semibold text-sm">
              <Tag size={16} /> {selectedDiscount ? `Promo Aktif: ${selectedDiscount.nama}` : 'Gunakan Promo / Diskon'}
            </div>
            {selectedDiscount && <X size={16} className="text-red-500" onClick={(e) => { e.stopPropagation(); setSelectedDiscount(null); }} />}
          </button>

          <div className="space-y-2 mb-6">
            <div className="flex justify-between text-sm"><span>Subtotal</span><span>{formatRp(subtotal)}</span></div>
            {diskonNominal > 0 && (
              <div className="flex justify-between text-sm text-green-600 font-semibold"><span>Diskon</span><span>- {formatRp(diskonNominal)}</span></div>
            )}
            <div className="flex justify-between text-sm"><span>Pajak (11%)</span><span>{formatRp(pajak)}</span></div>
            <div className="flex justify-between text-2xl font-black pt-2 border-t mt-2">
              <span>Total</span><span className="text-[#0053FF]">{formatRp(total)}</span>
            </div>
          </div>

          <button onClick={handleCheckout} disabled={cart.length === 0 || isProcessing} className="w-full h-14 bg-[#0053FF] text-white rounded-[16px] font-bold text-lg disabled:opacity-50">
            {isProcessing ? "Memproses..." : "Bayar Tagihan"}
          </button>
        </div>
      </div>

      {/* MODAL PILIH PROMO (Hidden saat print) */}
      {isDiscountModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
          <div className="bg-white p-6 rounded-[24px] max-w-sm w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Pilih Promo Aktif</h2>
              <button onClick={() => setIsDiscountModalOpen(false)}><X size={20} /></button>
            </div>
            <div className="space-y-3">
              {discounts.length === 0 ? (
                <p className="text-sm text-center text-gray-500 py-4">Tidak ada promo aktif.</p>
              ) : (
                discounts.map(d => (
                  <button key={d.id} onClick={() => { setSelectedDiscount(d); setIsDiscountModalOpen(false); }} className="w-full text-left p-4 rounded-[12px] border hover:border-[#0053FF] hover:bg-[#0053FF]/5 transition-all">
                    <p className="font-bold text-[#00232C]">{d.nama}</p>
                    <p className="text-sm text-[#0053FF] font-semibold">{d.tipe === 'PERSENTASE' ? `${d.nilai}% OFF` : `Potongan ${formatRp(d.nilai)}`}</p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL CETAK STRUK (Ditampilkan khusus saat transaksi sukses, dan ini yang akan dicetak) */}
      {isReceiptModalOpen && lastOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 print:p-0 print:bg-white">
          <div className="bg-white p-8 rounded-[24px] max-w-sm w-full print:rounded-none print:shadow-none print:p-0">
            
            {/* AREA KHUSUS STRUK PRINTER THERMAL */}
            <div className="text-center text-[#00232C] font-mono text-sm mb-6 print:mb-0">
              <h2 className="text-xl font-black uppercase mb-1">NusaKasir</h2>
              <p className="text-xs mb-4">Tanggal: {lastOrder.waktu}</p>
              <div className="border-t border-dashed border-gray-400 my-4"></div>
              
              <div className="space-y-2 text-left">
                {lastOrder.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-xs">
                    <span>{item.qty}x {item.nama}</span>
                    <span>{formatRp(item.harga_jual * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-gray-400 my-4"></div>
              <div className="space-y-1 text-xs text-left font-semibold">
                <div className="flex justify-between"><span>Subtotal</span><span>{formatRp(lastOrder.subtotal)}</span></div>
                {lastOrder.diskonNominal > 0 && (
                  <div className="flex justify-between text-gray-600"><span>Diskon ({lastOrder.diskonNama})</span><span>-{formatRp(lastOrder.diskonNominal)}</span></div>
                )}
                <div className="flex justify-between"><span>Pajak (11%)</span><span>{formatRp(lastOrder.pajak)}</span></div>
                <div className="flex justify-between text-sm font-black pt-2 mt-2 border-t"><span>TOTAL</span><span>{formatRp(lastOrder.total)}</span></div>
              </div>
              
              <div className="border-t border-dashed border-gray-400 my-4"></div>
              <p className="text-xs font-bold">TERIMA KASIH</p>
            </div>

            {/* TOMBOL AKSI (Sembunyi saat dicetak) */}
            <div className="flex gap-3 print:hidden">
              <button onClick={() => setIsReceiptModalOpen(false)} className="flex-1 py-3 bg-gray-100 text-gray-700 font-bold rounded-[12px]">Tutup</button>
              <button onClick={handlePrint} className="flex-1 py-3 bg-[#0053FF] text-white font-bold rounded-[12px] flex justify-center items-center gap-2">
                <Printer size={18} /> Cetak
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal Close Shift (Hidden saat print) */}
      {isCloseShiftModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 print:hidden">
          <div className="bg-white p-6 rounded-[24px] max-w-sm w-full">
            <h2 className="text-xl font-bold mb-4">Akhiri Shift</h2>
            <form onSubmit={handleCloseShift} className="space-y-4">
              <input type="number" required value={kasFisik} onChange={(e) => setKasFisik(e.target.value)} className="w-full h-14 px-4 border rounded-[12px]" placeholder="Total Uang Fisik Laci" />
              <div className="flex gap-2">
                <button type="button" onClick={() => setIsCloseShiftModalOpen(false)} className="flex-1 py-3 bg-gray-100 rounded-[12px] font-bold">Batal</button>
                <button type="submit" className="flex-1 py-3 bg-red-600 text-white rounded-[12px] font-bold">Tutup Shift</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}