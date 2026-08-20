"use client";

import { useState, useEffect } from "react";
import { Plus, CheckCircle, XCircle, ShoppingBag, X, Check } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

export default function PurchaseOrdersPage() {
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [ingredients, setIngredients] = useState<any[]>([]);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [catatan, setCatatan] = useState("");
  const [items, setItems] = useState<{ ingredientId: string; qty: number; harga_satuan: number }[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [resPo, resSup, resIng] = await Promise.all([
        api.get('/purchase-orders'),
        api.get('/suppliers'),
        api.get('/ingredients')
      ]);
      setPos(resPo.data);
      setSuppliers(resSup.data);
      setIngredients(resIng.data);
    } catch (error) { toast.error("Gagal memuat data PO"); }
  };

  const addItem = () => setItems([...items, { ingredientId: "", qty: 1, harga_satuan: 0 }]);
  
  const updateItem = (index: number, field: string, value: string | number) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSupplier || items.length === 0) return toast.error("Supplier dan Item wajib diisi");
    
    try {
      await api.post('/purchase-orders', { supplierId: selectedSupplier, catatan, items });
      toast.success("PO Berhasil dibuat!");
      setIsModalOpen(false);
      setItems([]); setSelectedSupplier(""); setCatatan("");
      fetchData();
    } catch (error) { toast.error("Gagal membuat PO"); }
  };

  const updateStatus = async (id: string, status: string) => {
    if (!confirm(`Yakin mengubah status PO menjadi ${status}? (Jika SELESAI, stok otomatis bertambah)`)) return;
    try {
      await api.patch(`/purchase-orders/${id}/status`, { status });
      toast.success(`PO ${status}`);
      fetchData();
    } catch (error) { toast.error("Gagal mengubah status"); }
  };

  const formatRp = (num: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C]">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Purchase Order</h1>
          <p className="text-[#00232C]/70 mt-1">Catat belanja ke supplier dan otomatisasi stok Gudang.</p>
        </div>
        <button onClick={() => setIsModalOpen(true)} className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-bold">
          <Plus size={18} /> Buat PO Baru
        </button>
      </div>

      <div className="space-y-4">
        {pos.length === 0 ? (
          <div className="text-center py-20 bg-white/60 rounded-[20px]"><ShoppingBag size={48} className="mx-auto opacity-20 mb-4"/>Belum ada riwayat PO.</div>
        ) : (
          pos.map(po => (
            <div key={po.id} className="bg-white p-6 rounded-[20px] border shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-bold text-lg">{po.nomor_po}</h3>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${po.status === 'SELESAI' ? 'bg-green-100 text-green-700' : po.status === 'BATAL' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {po.status}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-1">Supplier: <span className="font-bold text-[#00232C]">{po.supplier.nama}</span></p>
                <p className="text-xs text-gray-400">Total: {formatRp(po.total)} • {po.items.length} Item</p>
              </div>

              {po.status === 'PENDING' && (
                <div className="flex gap-2">
                  <button onClick={() => updateStatus(po.id, 'BATAL')} className="px-4 py-2 bg-red-50 text-red-600 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-red-100"><XCircle size={16}/> Batal</button>
                  <button onClick={() => updateStatus(po.id, 'SELESAI')} className="px-4 py-2 bg-green-50 text-green-600 rounded-full text-sm font-bold flex items-center gap-1 hover:bg-green-100"><CheckCircle size={16}/> Terima Barang</button>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* MODAL BUAT PO */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-[24px] w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold">Buat Purchase Order</h3>
              <button onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <select required value={selectedSupplier} onChange={(e) => setSelectedSupplier(e.target.value)} className="w-full h-12 px-4 border rounded-[12px] bg-white font-semibold">
                <option value="">-- Pilih Supplier --</option>
                {suppliers.map(s => <option key={s.id} value={s.id}>{s.nama}</option>)}
              </select>

              <div className="p-4 bg-gray-50 rounded-[16px] space-y-3 border">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-bold">Daftar Belanja</span>
                  <button type="button" onClick={addItem} className="text-sm text-[#0053FF] font-bold flex items-center gap-1"><Plus size={16}/> Tambah Item</button>
                </div>
                
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-2 items-center">
                    <select required value={item.ingredientId} onChange={e => updateItem(idx, 'ingredientId', e.target.value)} className="flex-1 h-10 px-2 border rounded-lg text-sm bg-white">
                      <option value="">Pilih Bahan</option>
                      {ingredients.map(ing => <option key={ing.id} value={ing.id}>{ing.nama} ({ing.satuan})</option>)}
                    </select>
                    <input type="number" step="0.01" required placeholder="Qty" value={item.qty} onChange={e => updateItem(idx, 'qty', parseFloat(e.target.value) || 0)} className="w-20 h-10 px-2 border rounded-lg text-sm" />
                    <input type="number" required placeholder="Harga Satuan (Rp)" value={item.harga_satuan} onChange={e => updateItem(idx, 'harga_satuan', parseInt(e.target.value) || 0)} className="w-32 h-10 px-2 border rounded-lg text-sm" />
                    <button type="button" onClick={() => setItems(items.filter((_, i) => i !== idx))} className="text-red-500"><X size={18}/></button>
                  </div>
                ))}
              </div>

              <input type="text" placeholder="Catatan (Opsional)" value={catatan} onChange={e => setCatatan(e.target.value)} className="w-full h-12 px-4 border rounded-[12px]" />
              
              <button type="submit" className="w-full h-12 bg-[#0053FF] text-white font-bold rounded-full mt-4 flex items-center justify-center gap-2">
                <Check size={18} /> Buat PO Sekarang
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}