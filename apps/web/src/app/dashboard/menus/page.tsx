"use client";

import { useState, useEffect } from "react";
import { Plus, Edit2, Trash2, Image as ImageIcon, BookOpen, X } from "lucide-react";
import { api } from "@/lib/axios";
import { toast } from "react-hot-toast";

interface Category {
  id: string;
  nama_kategori: string;
}

interface MenuItem {
  id: string;
  nama: string;
  harga_jual: number;
  status: boolean;
  category: Category;
}

interface Ingredient {
  id: string;
  nama: string;
  satuan: string;
}

interface Recipe {
  id: string;
  jumlah_takaran: number;
  ingredient: Ingredient;
}

export default function MenusPage() {
  const [menus, setMenus] = useState<MenuItem[]>([]);
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [isRecipeModalOpen, setIsRecipeModalOpen] = useState(false);
  const [selectedMenu, setSelectedMenu] = useState<MenuItem | null>(null);
  const [menuRecipes, setMenuRecipes] = useState<Recipe[]>([]);
  
  // Form Resep State
  const [selectedIngredientId, setSelectedIngredientId] = useState("");
  const [takaran, setTakaran] = useState("");
  const [isSavingRecipe, setIsSavingRecipe] = useState(false);

  useEffect(() => {
    fetchMenus();
    fetchIngredients(); // Tarik data bahan baku untuk dropdown modal
  }, []);

  const fetchMenus = async () => {
    try {
      const response = await api.get('/menu-items');
      setMenus(response.data);
    } catch (error) {
      toast.error("Gagal mengambil data menu");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchIngredients = async () => {
    try {
      const response = await api.get('/ingredients');
      setIngredients(response.data);
    } catch (error: any) {
      // Jika statusnya 403 (Kasir), abaikan saja secara diam-diam.
      // Jika error lain, baru tampilkan log.
      if (error.response?.status !== 403) {
        console.error("Gagal load bahan baku", error);
      }
    }
  };

  const openRecipeModal = async (menu: MenuItem) => {
    setSelectedMenu(menu);
    setIsRecipeModalOpen(true);
    setMenuRecipes([]); // Reset state
    
    try {
      const res = await api.get(`/recipes/menu/${menu.id}`);
      setMenuRecipes(res.data);
    } catch (error) {
      toast.error("Gagal mengambil komposisi resep");
    }
  };

  const handleAddRecipe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMenu || !selectedIngredientId || !takaran) return;

    setIsSavingRecipe(true);
    try {
      await api.post('/recipes', {
        menuItemId: selectedMenu.id,
        ingredientId: selectedIngredientId,
        jumlah_takaran: parseFloat(takaran)
      });
      toast.success("Bahan berhasil ditambahkan ke resep");
      
      // Refresh list resep
      const res = await api.get(`/recipes/menu/${selectedMenu.id}`);
      setMenuRecipes(res.data);
      
      // Reset form
      setSelectedIngredientId("");
      setTakaran("");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Gagal menambahkan bahan");
    } finally {
      setIsSavingRecipe(false);
    }
  };

  const handleRemoveRecipe = async (recipeId: string) => {
    try {
      await api.delete(`/recipes/${recipeId}`);
      setMenuRecipes(prev => prev.filter(r => r.id !== recipeId));
      toast.success("Bahan dihapus dari resep");
    } catch (error) {
      toast.error("Gagal menghapus bahan");
    }
  };

  const formatRupiah = (angka: number) => {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(angka);
  };

  return (
    <div className="max-w-[1280px] mx-auto font-inter text-[#00232C] relative">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-[40px] font-bold leading-tight">Daftar Menu & Resep</h1>
          <p className="text-[#00232C]/70 mt-1">Kelola item produk dan komposisi bahan baku (BOM).</p>
        </div>
        
        <button className="flex items-center gap-2 bg-[#0053FF] text-white px-6 py-3 rounded-full font-medium shadow-[0_4px_12px_rgba(0,83,255,0.25)] hover:-translate-y-[1px] transition-all duration-200">
          <Plus size={18} />
          Tambah Menu
        </button>
      </div>

      {/* Grid Layout untuk Menu Cards */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <p className="text-[#00232C]/50">Memuat data menu...</p>
        </div>
      ) : menus.length === 0 ? (
        <div className="bg-white/60 backdrop-blur-[20px] border border-white/55 rounded-[20px] p-10 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="bg-[#00232C]/5 p-4 rounded-full mb-4">
            <ImageIcon className="text-[#00232C]/40" size={32} />
          </div>
          <h3 className="text-xl font-bold mb-2">Belum ada menu</h3>
          <p className="text-[#00232C]/60 max-w-sm">Anda belum menambahkan menu apapun.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {menus.map((menu) => (
            <div 
              key={menu.id} 
              className="bg-white/72 backdrop-blur-[24px] border border-white/65 shadow-[0_10px_30px_rgba(0,35,44,0.08)] rounded-[20px] p-5 flex flex-col transition-transform duration-200 hover:-translate-y-[4px]"
            >
              <div className="flex justify-between items-start mb-4">
                <span className="px-3 py-1 bg-[#0053FF]/10 text-[#0053FF] text-[12px] font-semibold rounded-full">
                  {menu.category?.nama_kategori || 'Tanpa Kategori'}
                </span>
                <span className={`px-2 py-1 text-[12px] font-bold rounded-full ${menu.status ? 'bg-green-100 text-[#16A34A]' : 'bg-red-100 text-[#DC2626]'}`}>
                  {menu.status ? 'Tersedia' : 'Habis (86)'}
                </span>
              </div>
              
              <h3 className="text-[22px] font-bold leading-tight mb-2">{menu.nama}</h3>
              <p className="text-[#0053FF] font-bold text-lg mb-6">{formatRupiah(menu.harga_jual)}</p>
              
              <div className="flex justify-end gap-2 border-t border-[#00232C]/10 pt-4 mt-auto">
                <button 
                  onClick={() => openRecipeModal(menu)}
                  className="flex items-center gap-2 px-3 py-2 bg-[#00232C] text-white text-sm font-medium rounded-full hover:bg-[#00232C]/80 transition-colors mr-auto"
                >
                  <BookOpen size={16} /> Resep
                </button>
                <button className="p-2 text-[#00232C]/70 hover:bg-[#0053FF]/10 hover:text-[#0053FF] rounded-full transition-colors">
                  <Edit2 size={18} />
                </button>
                <button className="p-2 text-[#00232C]/70 hover:bg-red-50 hover:text-red-600 rounded-full transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Resep (Glassmorphism Modal) */}
      {isRecipeModalOpen && selectedMenu && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#00232C]/40 backdrop-blur-sm">
          <div className="bg-white/90 backdrop-blur-[24px] border border-white/60 w-full max-w-xl rounded-[24px] shadow-[0_20px_50px_rgba(0,35,44,0.15)] overflow-hidden flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-[#00232C]/10">
              <div>
                <h3 className="text-xl font-bold">Resep: {selectedMenu.nama}</h3>
                <p className="text-sm text-[#00232C]/60">Atur komposisi pemotongan stok otomatis.</p>
              </div>
              <button 
                onClick={() => setIsRecipeModalOpen(false)}
                className="p-2 text-[#00232C]/50 hover:text-[#00232C] hover:bg-black/5 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto">
              
              {/* Form Tambah Bahan */}
              <form onSubmit={handleAddRecipe} className="flex items-end gap-3 mb-8 bg-[#FBFBF3] p-4 rounded-[14px]">
                <div className="flex-1">
                  <label className="block text-[14px] font-semibold mb-2">Bahan Baku</label>
                  <select 
                    required
                    value={selectedIngredientId}
                    onChange={(e) => setSelectedIngredientId(e.target.value)}
                    className="w-full h-12 bg-white border border-[#00232C]/10 focus:border-[#0053FF] rounded-[12px] px-4 outline-none"
                  >
                    <option value="" disabled>Pilih bahan...</option>
                    {ingredients.map(ing => (
                      <option key={ing.id} value={ing.id}>{ing.nama} ({ing.satuan})</option>
                    ))}
                  </select>
                </div>
                <div className="w-1/3">
                  <label className="block text-[14px] font-semibold mb-2">Takaran</label>
                  <input 
                    type="number"
                    step="0.01"
                    required
                    value={takaran}
                    onChange={(e) => setTakaran(e.target.value)}
                    placeholder="0"
                    className="w-full h-12 bg-white border border-[#00232C]/10 focus:border-[#0053FF] rounded-[12px] px-4 outline-none"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isSavingRecipe}
                  className="h-12 px-6 bg-[#0053FF] text-white rounded-full font-medium hover:-translate-y-[1px] transition-transform disabled:opacity-50"
                >
                  Tambah
                </button>
              </form>

              {/* Daftar Komposisi */}
              <h4 className="font-semibold mb-3">Komposisi Saat Ini</h4>
              {menuRecipes.length === 0 ? (
                <p className="text-sm text-[#00232C]/50 italic">Menu ini belum memiliki resep. Stok tidak akan terpotong saat terjual.</p>
              ) : (
                <div className="space-y-2">
                  {menuRecipes.map((recipe) => (
                    <div key={recipe.id} className="flex justify-between items-center p-4 border border-[#00232C]/10 rounded-[14px]">
                      <div>
                        <p className="font-medium">{recipe.ingredient.nama}</p>
                        <p className="text-sm text-[#0053FF] font-semibold">
                          Potong: {recipe.jumlah_takaran} {recipe.ingredient.satuan} / porsi
                        </p>
                      </div>
                      <button 
                        onClick={() => handleRemoveRecipe(recipe.id)}
                        className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        </div>
      )}
    </div>
  );
}