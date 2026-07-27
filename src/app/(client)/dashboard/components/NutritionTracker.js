"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, Plus, X, ChevronRight, Search, Sliders, Utensils, Trash2, ListOrdered } from 'lucide-react';

const FOOD_DATABASE = [
  { id: 1, name: "Izgara Tavuk Göğsü", portion: "100g", kcal: 165, protein: 31, carb: 0, fat: 3.6 },
  { id: 2, name: "Pirinç Pilavı (Lapa)", portion: "100g", kcal: 130, protein: 2.7, carb: 28, fat: 0.3 },
  { id: 3, name: "Haşlanmış Yumurta", portion: "1 Adet (M)", kcal: 78, protein: 6.3, carb: 0.6, fat: 5.3 },
  { id: 4, name: "Yulaf Ezmesi", portion: "50g", kcal: 185, protein: 6.5, carb: 33, fat: 3.5 },
  { id: 5, name: "Süzme Peynir", portion: "50g", kcal: 50, protein: 6, carb: 2, fat: 2 },
  { id: 6, name: "Muz", portion: "1 Adet (Orta)", kcal: 105, protein: 1.3, carb: 27, fat: 0.3 },
  { id: 7, name: "Ton Balığı (Konserve)", portion: "100g", kcal: 116, protein: 26, carb: 0, fat: 1 },
  { id: 8, name: "Tam Buğday Ekmeği", portion: "1 Dilim (30g)", kcal: 69, protein: 3.6, carb: 12, fat: 0.9 },
  { id: 9, name: "Fıstık Ezmesi", portion: "1 Yemek Kaşığı (20g)", kcal: 118, protein: 5, carb: 4, fat: 10 },
  { id: 10, name: "Protein Tozu (Whey)", portion: "1 Ölçek (30g)", kcal: 120, protein: 24, carb: 2, fat: 1.5 },
];

export default function NutritionTracker({ userId = 3 }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMealsModalOpen, setIsMealsModalOpen] = useState(false); // Bugün yenenler listesi modalı
  const [activeTab, setActiveTab] = useState('ai');
  
  const [targetKcal, setTargetKcal] = useState(0);
  const [macroData, setMacroData] = useState([
    { name: 'Protein', value: 0, color: '#10B981' },
    { name: 'Karbonhidrat', value: 0, color: '#3B82F6' },
    { name: 'Yağ', value: 0, color: '#F97316' },
  ]);
  const [loggedMeals, setLoggedMeals] = useState([]);

  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [portionAmount, setPortionAmount] = useState(1);
  const [manualData, setManualData] = useState({ kcal: '', protein: '', carb: '', fat: '' });

  const fetchNutritionData = async () => {
    try {
      const targetRes = await fetch(`http://localhost:8000/api/nutrition/target/${userId}`);
      const targetData = await targetRes.json();
      if (targetData && targetData.target_kcal) {
        setTargetKcal(targetData.target_kcal);
      }

      const summaryRes = await fetch(`http://localhost:8000/api/nutrition/summary/${userId}`);
      const summaryData = await summaryRes.json();
      
      if (summaryData && summaryData.success) {
        setLoggedMeals(summaryData.logged_meals || []);
        setMacroData([
          { name: 'Protein', value: summaryData.total_protein || 0, color: '#10B981' },
          { name: 'Karbonhidrat', value: summaryData.total_carbs || 0, color: '#3B82F6' },
          { name: 'Yağ', value: summaryData.total_fat || 0, color: '#F97316' },
        ]);
      }
    } catch (error) {
      console.error("Veritabanı verileri yüklenirken hata oluştu:", error);
    }
  };

  useEffect(() => {
    fetchNutritionData();
  }, [userId]);

  const totalConsumedKcal = macroData.reduce((acc, curr) => {
    if (curr.name === 'Protein') return acc + (curr.value * 4);
    if (curr.name === 'Karbonhidrat') return acc + (curr.value * 4);
    return acc + (curr.value * 9);
  }, 0);

  const handleAiAnalysis = async (e) => {
    e.preventDefault();
    if (!aiInput.trim()) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiInput, user_id: userId })
      });
      
      if (response.ok) {
        await fetchNutritionData();
      }
    } catch (error) {
      console.error("AI analizi kaydedilemedi:", error);
    } finally {
      setIsAnalyzing(false);
      setAiInput('');
      setIsModalOpen(false);
    }
  };

  const handleAddSearchFood = async () => {
    if (!selectedFood) return;

    const multiplier = parseFloat(portionAmount) || 1;
    const mealPayload = {
      user_id: userId,
      food_name: selectedFood.name,
      kcal: Math.round(selectedFood.kcal * multiplier),
      protein: Math.round(selectedFood.protein * multiplier * 10) / 10,
      carb: Math.round(selectedFood.carb * multiplier * 10) / 10,
      fat: Math.round(selectedFood.fat * multiplier * 10) / 10
    };

    try {
      const res = await fetch('http://localhost:8000/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealPayload)
      });

      if (res.ok) {
        await fetchNutritionData();
      }
    } catch (err) {
      console.error("Öğün loglanamadı:", err);
    }

    setSelectedFood(null);
    setSearchQuery('');
    setPortionAmount(1);
    setIsModalOpen(false);
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    const p = parseFloat(manualData.protein) || 0;
    const c = parseFloat(manualData.carb) || 0;
    const f = parseFloat(manualData.fat) || 0;
    const k = parseFloat(manualData.kcal) || (p * 4 + c * 4 + f * 9);

    if (k <= 0 && p <= 0 && c <= 0 && f <= 0) return;

    const mealPayload = {
      user_id: userId,
      food_name: "Manuel Giriş",
      kcal: k,
      protein: p,
      carb: c,
      fat: f
    };

    try {
      const res = await fetch('http://localhost:8000/api/nutrition/log', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(mealPayload)
      });

      if (res.ok) {
        await fetchNutritionData();
      }
    } catch (err) {
      console.error("Manuel öğün kaydedilemedi:", err);
    }

    setManualData({ kcal: '', protein: '', carb: '', fat: '' });
    setIsModalOpen(false);
  };

  // 📌 Öğün Silme Fonksiyonu
  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/nutrition/meal/${mealId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchNutritionData();
      }
    } catch (err) {
      console.error("Öğün silinemedi:", err);
    }
  };

  const filteredFoods = FOOD_DATABASE.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Günlük Beslenme & Makro Dengesi</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Neon DB Günlük Takip</p>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Bugün Neler Yedim Butonu */}
          <button 
            onClick={() => setIsMealsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-[#F8FAF8] hover:bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold transition-all border border-slate-200"
          >
            <ListOrdered size={14} className="text-[#0A3A25]" /> Bugün Ne Yedim?
          </button>

          {/* Öğün Gir Butonu */}
          <button 
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-[#0A3A25] hover:bg-[#10B981] active:scale-95 text-white px-3.5 py-2.5 rounded-xl font-bold transition-all shadow-sm border border-[#C5A880]/15"
          >
            <Sparkles size={12} className="text-[#C5A880] fill-[#C5A880]" /> Öğün Gir
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
        <div className="h-44 flex justify-center items-center relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={macroData} innerRadius={55} outerRadius={72} paddingAngle={4} dataKey="value">
                {macroData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          
          <div className="absolute text-center flex flex-col items-center justify-center">
            <div className="flex items-baseline gap-1">
              <span className="text-xl font-black text-slate-900 tracking-tight">{Math.round(totalConsumedKcal)}</span>
              <span className="text-xs font-bold text-slate-400">/ {targetKcal}</span>
            </div>
            <span className="text-[9px] text-[#C5A880] font-extrabold uppercase tracking-wider block mt-0.5">Kcal Alındı</span>
          </div>
        </div>

        <div className="space-y-2.5">
          {macroData.map((macro, i) => (
            <div key={i} className="flex justify-between items-center p-2.5 rounded-xl bg-[#F8FAF8] border border-slate-100/80">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full shadow-xs" style={{ backgroundColor: macro.color }}></span>
                <span className="text-xs font-semibold text-slate-600">{macro.name}</span>
              </div>
              <span className="text-xs font-bold text-slate-900">{macro.value}g</span>
            </div>
          ))}
        </div>
      </div>

      {/* 📌 Bugün Yenenler Listesi Modalı */}
      {isMealsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#C5A880]/15 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ListOrdered size={16} className="text-[#0A3A25]" /> Bugün Tüketilen Öğünler
              </h3>
              <button onClick={() => setIsMealsModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2 pr-1">
              {loggedMeals.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  Bugün henüz kayıtlı bir öğününüz bulunmuyor.
                </div>
              ) : (
                loggedMeals.map((meal) => (
                  <div key={meal.id} className="flex justify-between items-center p-3 rounded-xl bg-[#F8FAF8] border border-slate-100/80 hover:border-slate-200 transition-all">
                    <div>
                      <span className="text-xs font-bold block text-slate-900">{meal.meal_text}</span>
                      <span className="text-[10px] text-slate-400 font-medium">
                        {meal.kcal} kcal • P: {meal.protein}g | K: {meal.carbs}g | Y: {meal.fat}g
                      </span>
                    </div>
                    <button 
                      onClick={() => handleDeleteMeal(meal.id)}
                      className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all"
                      title="Öğünü Sil"
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center">
              <span className="text-[11px] text-slate-500 font-semibold">Toplam Kalori: <strong className="text-slate-900">{Math.round(totalConsumedKcal)} kcal</strong></span>
              <button 
                onClick={() => setIsMealsModalOpen(false)}
                className="bg-[#0A3A25] text-white text-xs font-bold px-4 py-2 rounded-xl"
              >
                Kapat
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Öğün Ekleme Modal Yapısı */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#C5A880]/15 max-h-[90vh] overflow-y-auto">
            
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <Utensils size={16} className="text-[#0A3A25]" /> Öğün & Besin Kaydı
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex bg-slate-100 p-1 rounded-xl mb-4 gap-1">
              <button onClick={() => setActiveTab('ai')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'ai' ? 'bg-[#0A3A25] text-white shadow-sm' : 'text-slate-500'}`}>
                <Sparkles size={12} /> AI Akıllı
              </button>
              <button onClick={() => setActiveTab('search')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'search' ? 'bg-[#0A3A25] text-white shadow-sm' : 'text-slate-500'}`}>
                <Search size={12} /> Besin Ara
              </button>
              <button onClick={() => setActiveTab('manual')} className={`flex-1 py-2 text-[10px] font-bold rounded-lg transition-all flex items-center justify-center gap-1 ${activeTab === 'manual' ? 'bg-[#0A3A25] text-white shadow-sm' : 'text-slate-500'}`}>
                <Sliders size={12} /> Manuel Gir
              </button>
            </div>

            {activeTab === 'ai' && (
              <form onSubmit={handleAiAnalysis} className="space-y-4">
                <textarea 
                  rows={3}
                  value={aiInput}
                  onChange={(e) => setAiInput(e.target.value)}
                  placeholder="Örn: 200g tavuk göğsü ve 1 tabak pirinç pilavı yedim."
                  className="w-full border border-slate-200 rounded-xl p-3 text-xs outline-none focus:border-[#10B981] resize-none text-slate-700"
                  required
                />
                <button type="submit" disabled={isAnalyzing} className="w-full bg-[#0A3A25] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#10B981] disabled:opacity-50">
                  {isAnalyzing ? "Veritabanına İşleniyor..." : "Analiz Et & Kaydet"}
                </button>
              </form>
            )}

            {activeTab === 'search' && (
              <div className="space-y-4">
                <input 
                  type="text" 
                  placeholder="Besin ara..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-xs outline-none focus:border-[#10B981]"
                />
                <div className="max-h-48 overflow-y-auto space-y-1.5">
                  {filteredFoods.map((food) => (
                    <div key={food.id} onClick={() => setSelectedFood(food)} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${selectedFood?.id === food.id ? 'bg-[#10B981]/10 border-[#10B981]' : 'bg-[#F8FAF8] border-slate-100'}`}>
                      <div>
                        <span className="text-xs font-bold block text-slate-800">{food.name}</span>
                        <span className="text-[10px] text-slate-400">{food.portion} • {food.kcal} kcal</span>
                      </div>
                      <span className="text-[10px] font-semibold text-slate-500">P: {food.protein}g</span>
                    </div>
                  ))}
                </div>
                {selectedFood && (
                  <div className="flex justify-between items-center bg-[#FCFAF7] p-3 rounded-xl border border-[#C5A880]/20">
                    <span className="text-xs font-bold text-slate-700">Porsiyon Kat Sayısı:</span>
                    <input type="number" step="0.1" min="0.1" value={portionAmount} onChange={(e) => setPortionAmount(e.target.value)} className="w-20 p-1.5 border border-slate-200 rounded-lg text-xs text-center font-bold" />
                  </div>
                )}
                <button type="button" onClick={handleAddSearchFood} disabled={!selectedFood} className="w-full bg-[#0A3A25] text-white text-xs font-bold py-2.5 rounded-xl disabled:opacity-40">Seçilen Öğünü Kaydet</button>
              </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" placeholder="Kalori (kcal)" value={manualData.kcal} onChange={(e) => setManualData({ ...manualData, kcal: e.target.value })} className="border rounded-xl p-2.5 text-xs font-semibold" />
                  <input type="number" placeholder="Protein (g)" value={manualData.protein} onChange={(e) => setManualData({ ...manualData, protein: e.target.value })} className="border rounded-xl p-2.5 text-xs font-semibold" />
                  <input type="number" placeholder="Karbonhidrat (g)" value={manualData.carb} onChange={(e) => setManualData({ ...manualData, carb: e.target.value })} className="border rounded-xl p-2.5 text-xs font-semibold" />
                  <input type="number" placeholder="Yağ (g)" value={manualData.fat} onChange={(e) => setManualData({ ...manualData, fat: e.target.value })} className="border rounded-xl p-2.5 text-xs font-semibold" />
                </div>
                <button type="submit" className="w-full bg-[#0A3A25] text-white text-xs font-bold py-2.5 rounded-xl mt-2">Manuel Kaydet</button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}