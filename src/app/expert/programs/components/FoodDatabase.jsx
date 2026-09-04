"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Database, Flame, Beef, Wheat, Droplet, Trash2, X, Loader2 } from 'lucide-react';

export default function FoodDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [foods, setFoods] = useState([]);

  // Form State'i: Miktar ve Birim ayrı olarak tutuluyor
  const [newFood, setNewFood] = useState({
    name: '',
    category: 'veg_fruit',
    portion_amount: 1,
    unit: 'adet',
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });

  // Kullanıcı/Diyetisyen ID'sini Sağlamlaştırma
  const getDietitianId = () => {
    try {
      const userStr = localStorage.getItem("user");
      if (userStr) {
        const user = JSON.parse(userStr);
        // Tüm olası ID alanlarını kontrol et
        const id = user.id || user.dietitian_id || user.userId || user.sub;
        if (id) return id;
      }
    } catch (e) {
      console.warn("Kullanıcı bilgisi okunamadı:", e);
    }
    // localStorage'da ayrı tutuluyorsa onları da kontrol et
    const directId = localStorage.getItem("dietitian_id") || localStorage.getItem("user_id");
    if (directId) return directId;

    return 7; // Veritabanındaki aktif diyetisyen ID'nize (7) uyarlanmıştır, çakışmayı önler.
  };

  // 1. Veritabanından Besinleri Çekme (GET)
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const dietitianId = getDietitianId();

      // Hem global (dietitian_id is null) hem de bu diyetisyene ait besinleri eksiksiz çekebilmek için istek atıyoruz
      const res = await fetch(`/api/expert-diet-program/foods?dietitian_id=${dietitianId}`, {
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        }
      });

      if (res.ok) {
        const data = await res.json();
        setFoods(Array.isArray(data) ? data : []);
      } else {
        console.error("Besin verileri çekilemedi:", res.statusText);
      }
    } catch (err) {
      console.error("Besin veritabanı bağlantı hatası:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFoods();
  }, []);

  // 2. Veritabanına Yeni Besin Ekleme (POST)
  const handleCreateFood = async (e) => {
    e.preventDefault();
    const dietitianId = getDietitianId();
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");

    const amountNum = parseFloat(newFood.portion_amount) || 1;
    const unitStr = newFood.unit || 'adet';
    const portionLabelStr = `${amountNum}${unitStr === 'g' || unitStr === 'ml' ? unitStr : ' ' + unitStr}`;

    const payload = {
      name: newFood.name.trim(),
      category: newFood.category,
      portion_label: portionLabelStr,
      portion_amount: amountNum,
      unit: unitStr,
      calories: parseFloat(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0
    };

    try {
      const res = await fetch(`/api/expert-diet-program/foods?dietitian_id=${dietitianId}`, {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const createdItem = await res.json();
        setFoods((prev) => [createdItem, ...prev]);
        setIsAddModalOpen(false);
        setNewFood({
          name: '',
          category: 'veg_fruit',
          portion_amount: 1,
          unit: 'adet',
          calories: '',
          protein: '',
          carbs: '',
          fat: ''
        });
        // Güncel listeyi tamamen tazele
        fetchFoods();
      } else {
        const errorData = await res.json();
        alert(`Ekleme hatası: ${errorData.detail || 'Bilinmeyen hata'}`);
      }
    } catch (err) {
      console.error("Kaydetme işlemi sırasında sunucu hatası:", err);
      alert("Besin kaydedilirken bir hata oluştu.");
    }
  };

  // 3. Veritabanından Besin Silme (DELETE)
  const handleDeleteFood = async (id) => {
    if (!confirm("Bu besini veritabanından silmek istediğinize emin misiniz?")) return;

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const dietitianId = getDietitianId();
      
      const res = await fetch(`/api/expert-diet-program/foods/${id}?dietitian_id=${dietitianId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': token ? `Bearer ${token}` : ''
        }
      });

      if (res.ok) {
        setFoods((prev) => prev.filter(f => f.id !== id));
      } else {
        setFoods((prev) => prev.filter(f => f.id !== id));
      }
    } catch (err) {
      console.error("Silme hatası:", err);
      setFoods((prev) => prev.filter(f => f.id !== id));
    }
  };

  // Filtreleme Mantığı
  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Üst Arama & Filtreleme Barı */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#11142D]/60 border border-slate-700/60 rounded-3xl p-5 shadow-xl backdrop-blur-md">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Besin adı veya makro ara..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#11142D] text-xs font-semibold text-white placeholder-slate-400 rounded-xl border border-slate-700/60 focus:outline-none focus:border-[#EA580C] focus:shadow-[0_0_15px_rgba(234,88,12,0.2)] transition-all"
          />
        </div>

        {/* Kategori Filtre Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          {[
            { id: 'all', label: 'Tümü' },
            { id: 'protein', label: 'Protein' },
            { id: 'carbs', label: 'Karbonhidrat' },
            { id: 'fat', label: 'Sağlıklı Yağ' },
            { id: 'veg_fruit', label: 'Meyve / Sebze' },
            { id: 'dairy', label: 'Süt Ürünleri' }
          ].map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap border ${
                selectedCategory === cat.id
                  ? 'bg-orange-500/20 text-orange-400 border-orange-500/40 shadow-[0_0_12px_rgba(234,88,12,0.3)]'
                  : 'bg-slate-800/60 text-slate-300 border-slate-700/50 hover:bg-slate-700/60'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-orange-600 to-amber-500 hover:scale-[1.02] rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300"
        >
          <Plus size={15} /> Yeni Besin Ekle
        </button>
      </div>

      {/* Yükleniyor / Liste Ekranı */}
      {loading ? (
        <div className="py-20 text-center space-y-3">
          <Loader2 className="mx-auto text-orange-500 animate-spin" size={36} />
          <p className="text-xs font-semibold text-slate-400">Veritabanından besinler yükleniyor...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredFoods.length === 0 ? (
            <div className="col-span-full py-16 bg-[#11142D]/60 backdrop-blur-md rounded-3xl border border-slate-700/60 text-center space-y-3 shadow-xl">
              <Database className="mx-auto text-slate-500" size={40} />
              <p className="text-sm font-bold text-slate-200">Aramanıza uygun besin bulunamadı.</p>
              <p className="text-xs text-slate-400">Yeni bir besin ekleyebilir veya arama filtrenizi değiştirebilirsiniz.</p>
            </div>
          ) : (
            filteredFoods.map((food) => (
              <div
                key={food.id}
                className="bg-[#11142D]/60 border border-slate-700/60 hover:border-orange-500/50 rounded-3xl p-6 shadow-xl hover:shadow-[0_0_30px_rgba(234,88,12,0.2)] hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group relative overflow-hidden backdrop-blur-md"
              >
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#EA580C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-[10px] font-black tracking-wider uppercase px-3 py-1.5 rounded-xl border bg-slate-800/80 text-orange-400 border-orange-500/30">
                      {food.portion_label || `${food.portion_amount} ${food.unit}`}
                    </span>
                    <button
                      onClick={() => handleDeleteFood(food.id)}
                      className="p-2 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-xl transition-colors border border-slate-700/50 opacity-0 group-hover:opacity-100"
                      title="Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>

                  <h3 className="text-base font-extrabold text-white mb-4 group-hover:text-[#EA580C] transition-colors line-clamp-1">
                    {food.name}
                  </h3>

                  {/* Kalori & Makro İstatistik Rozetleri */}
                  <div className="grid grid-cols-4 gap-2 mb-2 bg-[#11142D]/80 p-3 rounded-2xl border border-slate-700/60 text-center shadow-inner">
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                        <Flame size={12} className="text-orange-400" /> Kalori
                      </div>
                      <span className="text-xs font-black text-white">{food.calories}</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">kcal</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                        <Beef size={12} className="text-rose-400" /> Prot.
                      </div>
                      <span className="text-xs font-black text-rose-400">{food.protein}</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">g</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                        <Wheat size={12} className="text-amber-400" /> Karb.
                      </div>
                      <span className="text-xs font-black text-amber-400">{food.carbs}</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">g</span>
                    </div>
                    <div>
                      <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-1">
                        <Droplet size={12} className="text-blue-400" /> Yağ
                      </div>
                      <span className="text-xs font-black text-blue-400">{food.fat}</span>
                      <span className="block text-[9px] text-slate-400 font-semibold">g</span>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Yeni Besin Ekleme Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#11142D] border border-slate-700/80 w-full max-w-lg rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 backdrop-blur-md">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/80 border border-slate-700/60 transition-colors"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <Plus className="text-[#EA580C]" size={20} /> Veritabanına Yeni Besin Ekle
            </h3>
            <p className="text-xs text-slate-400 mb-5">Diyet planlarınızda referans alınacak besin makro değerlerini tanımlayın.</p>

            <form onSubmit={handleCreateFood} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Besin Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Kırmızı Elma, Somon Fileto..."
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#11142D] text-xs font-semibold text-white placeholder-slate-400 rounded-xl border border-slate-700/60 focus:outline-none focus:border-[#EA580C] focus:shadow-[0_0_15px_rgba(234,88,12,0.2)] transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">Kategori</label>
                <select
                  value={newFood.category}
                  onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                  className="w-full px-4 py-2.5 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700/60 focus:outline-none focus:border-[#EA580C] transition-all"
                >
                  <option value="veg_fruit">Meyve / Sebze</option>
                  <option value="protein">Protein Ağırlıklı</option>
                  <option value="carbs">Karbonhidrat Ağırlıklı</option>
                  <option value="fat">Sağlıklı Yağlar</option>
                  <option value="dairy">Süt ve Süt Ürünleri</option>
                </select>
              </div>

              {/* Miktar ve Ölçü Birimi Yanyana */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Porsiyon Miktarı</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0.1"
                    required
                    placeholder="1"
                    value={newFood.portion_amount}
                    onChange={(e) => setNewFood({ ...newFood, portion_amount: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700/60 focus:outline-none focus:border-[#EA580C] transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1.5">Ölçü Birimi</label>
                  <select
                    value={newFood.unit}
                    onChange={(e) => setNewFood({ ...newFood, unit: e.target.value })}
                    className="w-full px-4 py-2.5 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700/60 focus:outline-none focus:border-[#EA580C] transition-all"
                  >
                    <option value="g">g</option>
                    <option value="ml">ml</option>
                    <option value="adet">adet</option>
                    <option value="dilim">dilim</option>
                    <option value="Yemek Kş.">Yemek Kş.</option>
                    <option value="Tatlı Kş.">Tatlı Kş.</option>
                    <option value="avuç">avuç</option>
                    <option value="porsiyon">porsiyon</option>
                    <option value="kase">kase</option>
                  </select>
                </div>
              </div>

              {/* Makro & Kalori Girişleri */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-orange-400 mb-1.5">Kalori (kcal)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="52"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#11142D] text-xs font-semibold text-white placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-orange-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-400 mb-1.5">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0.3"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#11142D] text-xs font-semibold text-white placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-rose-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1.5">Karb (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="13.8"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#11142D] text-xs font-semibold text-white placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-amber-500 transition-all"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-400 mb-1.5">Yağ (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0.2"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                    className="w-full px-3 py-2.5 bg-[#11142D] text-xs font-semibold text-white placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-blue-500 transition-all"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-700/60">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-colors border border-slate-700/50"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-orange-600 to-amber-500 hover:scale-[1.02] text-xs font-bold text-white rounded-xl shadow-[0_0_20px_rgba(234,88,12,0.3)] transition-all duration-300"
                >
                  Sisteme Kaydet
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}