"use client";
import React, { useState, useEffect } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Sparkles, X, Search, Sliders, Utensils, Trash2, ListOrdered, Pencil, Check } from 'lucide-react';

export default function NutritionTracker({ userId }) {
  // Eğer prop olarak userId gelmezse localStorage'dan veya oturum state'inden dinamik alalım
  const [currentUserId, setCurrentUserId] = useState(userId);

  useEffect(() => {
    if (!userId) {
      const storedUserId = localStorage.getItem('user_id') || localStorage.getItem('current_user_id');
      if (storedUserId) {
        setCurrentUserId(Number(storedUserId));
      }
    } else {
      setCurrentUserId(Number(userId));
    }
  }, [userId]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isMealsModalOpen, setIsMealsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('ai');
  
  const [targetKcal, setTargetKcal] = useState(2000);
  const [totalConsumedKcal, setTotalConsumedKcal] = useState(0);
  const [macroData, setMacroData] = useState([
    { name: 'Protein', value: 0, color: '#10B981' },
    { name: 'Karbonhidrat', value: 0, color: '#3B82F6' },
    { name: 'Yağ', value: 0, color: '#F97316' },
  ]);
  const [loggedMeals, setLoggedMeals] = useState([]);
  const [availableFoods, setAvailableFoods] = useState([]);

  const [aiInput, setAiInput] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [portionAmount, setPortionAmount] = useState(1);
  const [manualData, setManualData] = useState({ kcal: '', protein: '', carb: '', fat: '' });

  // Edit states
  const [editingMealId, setEditingMealId] = useState(null);
  const [editForm, setEditForm] = useState({ food_name: '', kcal: '', protein: '', carb: '', fat: '' });

  const fetchNutritionData = async () => {
    if (!currentUserId) return;
    try {
      const targetRes = await fetch(`http://localhost:8000/api/nutrition/target/${currentUserId}`);
      if (targetRes.ok) {
        const targetData = await targetRes.json();
        if (targetData && targetData.target_kcal) {
          setTargetKcal(targetData.target_kcal);
        }
      }

      const summaryRes = await fetch(`http://localhost:8000/api/nutrition/summary/${currentUserId}`);
      if (summaryRes.ok) {
        const summaryData = await summaryRes.json();
        if (summaryData && summaryData.success) {
          setLoggedMeals(summaryData.logged_meals || []);
          setTotalConsumedKcal(summaryData.total_consumed_kcal || 0);
          setMacroData([
            { name: 'Protein', value: summaryData.total_protein || 0, color: '#10B981' },
            { name: 'Karbonhidrat', value: summaryData.total_carbs || 0, color: '#3B82F6' },
            { name: 'Yağ', value: summaryData.total_fat || 0, color: '#F97316' },
          ]);
        }
      }

      const foodsRes = await fetch(`http://localhost:8000/api/nutrition/foods`);
      if (foodsRes.ok) {
        const foodsData = await foodsRes.json();
        if (foodsData && foodsData.success) {
          setAvailableFoods(foodsData.foods || []);
        }
      }
    } catch (error) {
      console.error("Veritabanı verileri yüklenirken hata oluştu:", error);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchNutritionData();
    }
  }, [currentUserId]);

  const handleAiAnalysis = async (e) => {
    e.preventDefault();
    if (!aiInput.trim() || !currentUserId) return;

    setIsAnalyzing(true);
    try {
      const response = await fetch('http://localhost:8000/api/nutrition/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query: aiInput, user_id: currentUserId })
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
    if (!selectedFood || !currentUserId) return;

    const multiplier = parseFloat(portionAmount) || 1;
    const mealPayload = {
      user_id: currentUserId,
      food_name: selectedFood.food_name,
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
    if (!currentUserId) return;

    const p = parseFloat(manualData.protein) || 0;
    const c = parseFloat(manualData.carb) || 0;
    const f = parseFloat(manualData.fat) || 0;
    const k = parseFloat(manualData.kcal) || (p * 4 + c * 4 + f * 9);

    if (k <= 0 && p <= 0 && c <= 0 && f <= 0) return;

    const mealPayload = {
      user_id: currentUserId,
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

  const handleDeleteMeal = async (mealId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/nutrition/meal/${mealId}?user_id=${currentUserId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        await fetchNutritionData();
      }
    } catch (err) {
      console.error("Öğün silinemedi:", err);
    }
  };

  const handleStartEdit = (meal) => {
    setEditingMealId(meal.id);
    setEditForm({
      food_name: meal.meal_text || '',
      kcal: meal.kcal || 0,
      protein: meal.protein || 0,
      carb: meal.carbs || 0,
      fat: meal.fat || 0
    });
  };

  const handleSaveEdit = async (mealId) => {
    try {
      const res = await fetch(`http://localhost:8000/api/nutrition/meal/${mealId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: currentUserId,
          food_name: editForm.food_name,
          kcal: parseFloat(editForm.kcal) || 0,
          protein: parseFloat(editForm.protein) || 0,
          carb: parseFloat(editForm.carb) || 0,
          fat: parseFloat(editForm.fat) || 0
        })
      });
      if (res.ok) {
        setEditingMealId(null);
        await fetchNutritionData();
      }
    } catch (err) {
      console.error("Öğün güncellenemedi:", err);
    }
  };

  const filteredFoods = availableFoods.filter(item => 
    item.food_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Günlük Beslenme & Makro Dengesi</h3>
          <p className="text-[10px] text-slate-400 font-semibold mt-0.5">Kullanıcı ID: {currentUserId}</p>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMealsModalOpen(true)}
            className="flex items-center gap-1.5 text-xs bg-[#F8FAF8] hover:bg-slate-100 text-slate-700 px-3.5 py-2.5 rounded-xl font-bold transition-all border border-slate-200"
          >
            <ListOrdered size={14} className="text-[#0A3A25]" /> Bugün Ne Yedim?
          </button>

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

      {isMealsModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl border border-[#C5A880]/15 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <ListOrdered size={16} className="text-[#0A3A25]" /> Tüketilen Öğünler (Bugün)
              </h3>
              <button onClick={() => setIsMealsModalOpen(false)} className="text-slate-400 hover:text-rose-500 p-1.5 rounded-lg transition-all">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {loggedMeals.length === 0 ? (
                <div className="text-center py-10 text-slate-400 text-xs font-medium">
                  Bugün henüz kayıtlı bir öğününüz bulunmuyor.
                </div>
              ) : (
                loggedMeals.map((meal) => (
                  <div key={meal.id} className="p-3 rounded-xl bg-[#F8FAF8] border border-slate-100/80 hover:border-slate-200 transition-all">
                    {editingMealId === meal.id ? (
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          value={editForm.food_name} 
                          onChange={(e) => setEditForm({...editForm, food_name: e.target.value})}
                          className="w-full p-1.5 border rounded-lg text-xs font-bold"
                          placeholder="Besin adı"
                        />
                        <div className="grid grid-cols-4 gap-1.5">
                          <input type="number" placeholder="Kcal" value={editForm.kcal} onChange={(e) => setEditForm({...editForm, kcal: e.target.value})} className="p-1 border rounded text-[11px]" />
                          <input type="number" placeholder="Pro (g)" value={editForm.protein} onChange={(e) => setEditForm({...editForm, protein: e.target.value})} className="p-1 border rounded text-[11px]" />
                          <input type="number" placeholder="Carb (g)" value={editForm.carb} onChange={(e) => setEditForm({...editForm, carb: e.target.value})} className="p-1 border rounded text-[11px]" />
                          <input type="number" placeholder="Fat (g)" value={editForm.fat} onChange={(e) => setEditForm({...editForm, fat: e.target.value})} className="p-1 border rounded text-[11px]" />
                        </div>
                        <div className="flex justify-end gap-1.5 pt-1">
                          <button onClick={() => setEditingMealId(null)} className="px-2.5 py-1 text-[10px] bg-slate-200 rounded-lg font-bold">İptal</button>
                          <button onClick={() => handleSaveEdit(meal.id)} className="px-2.5 py-1 text-[10px] bg-[#0A3A25] text-white rounded-lg font-bold flex items-center gap-1"><Check size={12}/> Kaydet</button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="text-xs font-bold block text-slate-900">{meal.meal_text}</span>
                          <span className="text-[10px] text-slate-400 font-medium">
                            {meal.kcal} kcal • P: {meal.protein}g | K: {meal.carbs}g | Y: {meal.fat}g
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <button 
                            onClick={() => handleStartEdit(meal)}
                            className="text-slate-400 hover:text-blue-600 p-2 rounded-lg hover:bg-blue-50 transition-all"
                            title="Öğünü Düzenle"
                          >
                            <Pencil size={15} />
                          </button>
                          <button 
                            onClick={() => handleDeleteMeal(meal.id)}
                            className="text-slate-400 hover:text-rose-600 p-2 rounded-lg hover:bg-rose-50 transition-all"
                            title="Öğünü Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    )}
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
                  placeholder="Örn: 1 kase mercimek çorbası içtim."
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
                  {filteredFoods.length === 0 ? (
                    <div className="text-center py-6 text-slate-400 text-xs">Kayıtlı besin bulunamadı.</div>
                  ) : (
                    filteredFoods.map((food) => (
                      <div key={food.id} onClick={() => setSelectedFood(food)} className={`p-2.5 rounded-xl border cursor-pointer flex justify-between items-center ${selectedFood?.id === food.id ? 'bg-[#10B981]/10 border-[#10B981]' : 'bg-[#F8FAF8] border-slate-100'}`}>
                        <div>
                          <span className="text-xs font-bold block text-slate-800">{food.food_name}</span>
                          <span className="text-[10px] text-slate-400">{food.kcal} kcal ({food.serving_unit})</span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">P: {food.protein}g</span>
                      </div>
                    ))
                  )}
                </div>
                {selectedFood && (
                  <div className="flex justify-between items-center bg-[#FCFAF7] p-3 rounded-xl border border-[#C5A880]/20">
                    <span className="text-xs font-bold text-slate-700">Porsiyon Kat Sayısı:</span>
                    <input type="number" step="0.1" min="0.1" value={portionAmount} onChange={(e) => setPortionAmount(e.target.value)} className="w-20 p-1.5 border rounded-lg text-xs text-center font-bold" />
                  </div>
                )}
                <button onClick={handleAddSearchFood} disabled={!selectedFood} className="w-full bg-[#0A3A25] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#10B981] disabled:opacity-50">
                  Öğüne Ekle
                </button>
              </div>
            )}

            {activeTab === 'manual' && (
              <form onSubmit={handleManualSubmit} className="space-y-3">
                <div>
                  <label className="text-[11px] font-bold text-slate-600 block mb-1">Kalori (Kcal)</label>
                  <input type="number" step="any" placeholder="Örn: 450" value={manualData.kcal} onChange={(e) => setManualData({...manualData, kcal: e.target.value})} className="w-full p-2.5 border rounded-xl text-xs" />
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Protein (g)</label>
                    <input type="number" step="any" placeholder="30" value={manualData.protein} onChange={(e) => setManualData({...manualData, protein: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Karb (g)</label>
                    <input type="number" step="any" placeholder="50" value={manualData.carb} onChange={(e) => setManualData({...manualData, carb: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 block mb-1">Yağ (g)</label>
                    <input type="number" step="any" placeholder="10" value={manualData.fat} onChange={(e) => setManualData({...manualData, fat: e.target.value})} className="w-full p-2 border rounded-xl text-xs" />
                  </div>
                </div>
                <button type="submit" className="w-full bg-[#0A3A25] text-white text-xs font-bold py-2.5 rounded-xl hover:bg-[#10B981] mt-2">
                  Manuel Kayıt
                </button>
              </form>
            )}

          </div>
        </div>
      )}
    </div>
  );
}