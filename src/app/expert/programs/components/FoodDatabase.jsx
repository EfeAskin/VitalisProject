"use client";

import React, { useState, useEffect } from 'react';
import { Search, Plus, Filter, Database, Flame, Beef, Wheat, Droplet, Trash2, Edit3, X, Check } from 'lucide-react';

export default function FoodDatabase() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  // FastAPI + Neon DB'den çekilecek Besin Listesi (Varsayılan Elit Veriler)
  const [foods, setFoods] = useState([
    {
      id: "food-1",
      name: "Tavuk Göğsü (Izgara)",
      category: "protein",
      calories: 165,
      protein: 31.0,
      carbs: 0.0,
      fat: 3.6,
      unit: "100g"
    },
    {
      id: "food-2",
      name: "Basmati Pirinç (Pişmiş)",
      category: "carbs",
      calories: 130,
      protein: 2.7,
      carbs: 28.0,
      fat: 0.3,
      unit: "100g"
    },
    {
      id: "food-3",
      name: "Avokado",
      category: "fat",
      calories: 160,
      protein: 2.0,
      carbs: 8.5,
      fat: 14.7,
      unit: "100g"
    },
    {
      id: "food-4",
      name: "Yumurta (A Sınıfı - Haşlanmış)",
      category: "protein",
      calories: 155,
      protein: 12.6,
      carbs: 1.1,
      fat: 10.6,
      unit: "100g (Aproks. 2 Adet)"
    },
    {
      id: "food-5",
      name: "Yulaf Ezmesi",
      category: "carbs",
      calories: 389,
      protein: 16.9,
      carbs: 66.3,
      fat: 6.9,
      unit: "100g"
    },
    {
      id: "food-6",
      name: "Süzme Yoğurt (%0.5 Yağ)",
      category: "protein",
      calories: 59,
      protein: 10.0,
      carbs: 3.6,
      fat: 0.4,
      unit: "100g"
    }
  ]);

  // Yeni Besin Ekleme Formu State'i
  const [newFood, setNewFood] = useState({
    name: '',
    category: 'protein',
    calories: '',
    protein: '',
    carbs: '',
    fat: '',
    unit: '100g'
  });

  // FastAPI /api/expert/foods İsteği (Gelecekteki Canlı Bağlantı)
  useEffect(() => {
    async function fetchFoods() {
      try {
        setLoading(true);
        const token = localStorage.getItem("token") || localStorage.getItem("access_token");
        const res = await fetch('/api/expert/foods', {
          headers: {
            'Authorization': token ? `Bearer ${token}` : '',
            'Content-Type': 'application/json'
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            setFoods(data);
          }
        }
      } catch (err) {
        console.warn("FastAPI Besin veritabanı bağlantısı henüz hazır değil, varsayılan veriler gösteriliyor:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchFoods();
  }, []);

  // Yeni Besin Kaydetme (FastAPI POST)
  const handleCreateFood = async (e) => {
    e.preventDefault();
    const createdItem = {
      id: `food-${Date.now()}`,
      name: newFood.name,
      category: newFood.category,
      calories: parseFloat(newFood.calories) || 0,
      protein: parseFloat(newFood.protein) || 0,
      carbs: parseFloat(newFood.carbs) || 0,
      fat: parseFloat(newFood.fat) || 0,
      unit: newFood.unit || '100g'
    };

    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      await fetch('/api/expert/foods', {
        method: 'POST',
        headers: {
          'Authorization': token ? `Bearer ${token}` : '',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(createdItem)
      });
    } catch (err) {
      console.error("FastAPI kaydı başarısız, yerel state güncelleniyor:", err);
    }

    setFoods([createdItem, ...foods]);
    setIsAddModalOpen(false);
    setNewFood({ name: '', category: 'protein', calories: '', protein: '', carbs: '', fat: '', unit: '100g' });
  };

  const handleDeleteFood = (id) => {
    if (confirm("Bu besini veritabanından silmek istediğinize emin misiniz?")) {
      setFoods(foods.filter(f => f.id !== id));
    }
  };

  const filteredFoods = foods.filter(food => {
    const matchesSearch = food.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || food.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Üst Arama & Filtreleme & Ekleme Barı */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-[#111827] p-4 rounded-2xl border border-slate-800/80 shadow-2xl">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Besin adı veya makro ara..."
            className="w-full pl-10 pr-4 py-2 bg-[#182134] text-xs font-semibold text-white placeholder-slate-500 rounded-xl border border-slate-700/60 focus:outline-none focus:border-emerald-500 transition-colors"
          />
        </div>

        {/* Kategori Filtre Butonları */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'all'
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Tümü
          </button>
          <button
            onClick={() => setSelectedCategory('protein')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'protein'
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Protein
          </button>
          <button
            onClick={() => setSelectedCategory('carbs')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'carbs'
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Karbonhidrat
          </button>
          <button
            onClick={() => setSelectedCategory('fat')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
              selectedCategory === 'fat'
                ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40 shadow-[0_0_10px_rgba(59,130,246,0.2)]'
                : 'bg-slate-800/60 text-slate-400 hover:text-slate-200'
            }`}
          >
            Sağlıklı Yağ
          </button>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full md:w-auto flex items-center justify-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
        >
          <Plus size={15} /> Yeni Besin Ekle
        </button>
      </div>

      {/* Besin Grid / Kart Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredFoods.length === 0 ? (
          <div className="col-span-full py-16 bg-[#111827] rounded-2xl border border-slate-800 text-center space-y-3">
            <Database className="mx-auto text-slate-600" size={40} />
            <p className="text-sm font-bold text-slate-300">Aramanıza uygun besin bulunamadı.</p>
            <p className="text-xs text-slate-500">Yeni bir besin ekleyebilir veya arama filtrenizi değiştirebilirsiniz.</p>
          </div>
        ) : (
          filteredFoods.map((food) => (
            <div
              key={food.id}
              className="bg-[#111827] border border-slate-800/80 hover:border-emerald-500/50 rounded-2xl p-4 shadow-xl transition-all duration-300 flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-colors pointer-events-none" />

              <div>
                <div className="flex justify-between items-start mb-3">
                  <span className="text-[10px] font-black tracking-wider uppercase px-2.5 py-1 rounded-md border bg-slate-800 text-slate-300 border-slate-700">
                    {food.unit}
                  </span>
                  <button
                    onClick={() => handleDeleteFood(food.id)}
                    className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                    title="Sil"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                <h3 className="text-base font-extrabold text-white mb-3 group-hover:text-emerald-400 transition-colors">
                  {food.name}
                </h3>

                {/* Kalori & Makro İstatistik Rozetleri */}
                <div className="grid grid-cols-4 gap-2 mb-2 bg-[#182134] p-2.5 rounded-xl border border-slate-800/80 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Flame size={11} className="text-orange-400" /> Kalori
                    </div>
                    <span className="text-xs font-black text-white">{food.calories} kcal</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Beef size={11} className="text-rose-400" /> Prot.
                    </div>
                    <span className="text-xs font-bold text-rose-400">{food.protein}g</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Wheat size={11} className="text-amber-400" /> Karb.
                    </div>
                    <span className="text-xs font-bold text-amber-400">{food.carbs}g</span>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                      <Droplet size={11} className="text-blue-400" /> Yağ
                    </div>
                    <span className="text-xs font-bold text-blue-400">{food.fat}g</span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Yeni Besin Ekleme Modalı */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111827] border border-slate-800 w-full max-w-lg rounded-2xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsAddModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg bg-slate-800/50"
            >
              <X size={18} />
            </button>

            <h3 className="text-lg font-black text-white mb-1 flex items-center gap-2">
              <Plus className="text-emerald-400" size={20} /> Veritabanına Yeni Besin Ekle
            </h3>
            <p className="text-xs text-slate-400 mb-5">Diyet planlarınızda kullanmak üzere besin makro değerlerini tanımlayın.</p>

            <form onSubmit={handleCreateFood} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Besin Adı</label>
                <input
                  type="text"
                  required
                  placeholder="Örn: Somon Fileto, Kinoa..."
                  value={newFood.name}
                  onChange={(e) => setNewFood({ ...newFood, name: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Kategori</label>
                  <select
                    value={newFood.category}
                    onChange={(e) => setNewFood({ ...newFood, category: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="protein">Protein Ağırlıklı</option>
                    <option value="carbs">Karbonhidrat Ağırlıklı</option>
                    <option value="fat">Sağlıklı Yağlar</option>
                    <option value="veg">Sebze / Meyve</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Porsiyon / Ölçü Birimi</label>
                  <input
                    type="text"
                    required
                    placeholder="Örn: 100g, 1 Su Bardağı..."
                    value={newFood.unit}
                    onChange={(e) => setNewFood({ ...newFood, unit: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-bold text-orange-400 mb-1">Kalori (kcal)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="150"
                    value={newFood.calories}
                    onChange={(e) => setNewFood({ ...newFood, calories: e.target.value })}
                    className="w-full px-3 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-orange-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-rose-400 mb-1">Protein (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="25"
                    value={newFood.protein}
                    onChange={(e) => setNewFood({ ...newFood, protein: e.target.value })}
                    className="w-full px-3 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-rose-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-amber-400 mb-1">Karb (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="0"
                    value={newFood.carbs}
                    onChange={(e) => setNewFood({ ...newFood, carbs: e.target.value })}
                    className="w-full px-3 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-blue-400 mb-1">Yağ (g)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    placeholder="3"
                    value={newFood.fat}
                    onChange={(e) => setNewFood({ ...newFood, fat: e.target.value })}
                    className="w-full px-3 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-colors"
                >
                  İptal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all"
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