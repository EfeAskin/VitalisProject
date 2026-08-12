"use client";

import React, { useState, useEffect } from 'react';
import { X, Plus, Utensils, Flame, Beef, Wheat, Droplet, Trash2, Check, Sparkles } from 'lucide-react';

export default function DietTemplateBuilder({ isOpen, onClose, onSave, initialData }) {
  const [title, setTitle] = useState('');
  const [targetCalories, setTargetCalories] = useState(2000);
  const [goal, setGoal] = useState('Kilo Verme & Definisyon');
  
  // Öğünler State'i
  const [meals, setMeals] = useState([
    {
      id: "m-1",
      name: "Kahvaltı (08:30)",
      items: [
        { id: "i-1", foodName: "Yumurta (Haşlanmış)", portion: "2 Adet", calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6 },
        { id: "i-2", foodName: "Lor Peyniri", portion: "50g", calories: 40, protein: 6.0, carbs: 1.5, fat: 0.8 }
      ]
    },
    {
      id: "m-2",
      name: "Öğle Yemeği (13:00)",
      items: [
        { id: "i-3", foodName: "Izgara Tavuk Göğsü", portion: "180g", calories: 297, protein: 55.8, carbs: 0, fat: 6.4 },
        { id: "i-4", foodName: "Basmati Pirinç", portion: "100g", calories: 130, protein: 2.7, carbs: 28.0, fat: 0.3 }
      ]
    }
  ]);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setTargetCalories(initialData.targetCalories || 2000);
      setGoal(initialData.goal || 'Kilo Verme & Definisyon');
      setMeals(initialData.meals || []);
    } else {
      setTitle('');
      setTargetCalories(2000);
      setGoal('Kilo Verme & Definisyon');
      setMeals([
        {
          id: `m-${Date.now()}-1`,
          name: "Kahvaltı (08:30)",
          items: [{ id: `i-${Date.now()}-1`, foodName: "Yumurta (Haşlanmış)", portion: "2 Adet", calories: 155, protein: 12.6, carbs: 1.1, fat: 10.6 }]
        }
      ]);
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  // Canlı Toplam Makro Hesaplamaları
  const totalCalories = meals.reduce((acc, m) => acc + m.items.reduce((iAcc, item) => iAcc + (Number(item.calories) || 0), 0), 0);
  const totalProtein = meals.reduce((acc, m) => acc + m.items.reduce((iAcc, item) => iAcc + (Number(item.protein) || 0), 0), 0);
  const totalCarbs = meals.reduce((acc, m) => acc + m.items.reduce((iAcc, item) => iAcc + (Number(item.carbs) || 0), 0), 0);
  const totalFat = meals.reduce((acc, m) => acc + m.items.reduce((iAcc, item) => iAcc + (Number(item.fat) || 0), 0), 0);

  const handleAddMeal = () => {
    setMeals([
      ...meals,
      {
        id: `m-${Date.now()}`,
        name: `Öğün ${meals.length + 1}`,
        items: []
      }
    ]);
  };

  const handleRemoveMeal = (mealId) => {
    setMeals(meals.filter(m => m.id !== mealId));
  };

  const handleAddItem = (mealId) => {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          items: [
            ...m.items,
            { id: `i-${Date.now()}`, foodName: "Yeni Besin", portion: "100g", calories: 100, protein: 10, carbs: 10, fat: 2 }
          ]
        };
      }
      return m;
    }));
  };

  const handleRemoveItem = (mealId, itemId) => {
    setMeals(meals.map(m => {
      if (m.id === mealId) {
        return {
          ...m,
          items: m.items.filter(item => item.id !== itemId)
        };
      }
      return m;
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      id: initialData ? initialData.id : `diet-${Date.now()}`,
      title: title || 'Özel Beslenme Planı',
      targetCalories,
      goal,
      totalCalories,
      protein: Math.round(totalProtein),
      carbs: Math.round(totalCarbs),
      fat: Math.round(totalFat),
      meals
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#11142D]/85 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#141832] border border-emerald-500/30 w-full max-w-4xl rounded-2xl shadow-[0_0_40px_rgba(16,185,129,0.2)] overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Başlık Barı */}
        <div className="px-6 py-4 bg-[#161b38] border-b border-slate-700/80 flex justify-between items-center shadow-md">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/15 text-emerald-400 rounded-xl border border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.25)]">
              <Utensils size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white tracking-wide">
                {initialData ? "Diyet Şablonunu Düzenle" : "Yeni Elit Diyet & Beslenme Planı"}
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">Danışanlarınız için kişiselleştirilmiş makro odaklı plan tasarlayın.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-300 hover:text-white rounded-lg bg-[#11142D] border border-slate-700 hover:border-emerald-500/50 transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Plan Detay Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-200 mb-1">Plan Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Akdeniz Tipi Ketojenik Şablon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 shadow-inner placeholder-slate-400"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Hedef Kalori (kcal)</label>
              <input
                type="number"
                required
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 shadow-inner"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1">Hedef & Kategori</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 shadow-inner cursor-pointer"
              >
                <option value="Kilo Verme & Definisyon">Kilo Verme & Definisyon</option>
                <option value="Kas Kazanımı & Hacim">Kas Kazanımı & Hacim</option>
                <option value="Glutensiz & Detoks">Glutensiz & Detoks</option>
                <option value="Sporcu Performansı">Sporcu Performansı</option>
              </select>
            </div>
          </div>

          {/* Canlı Hesaplanan Makro Dashboard Özeti */}
          <div className="bg-[#161b38]/90 p-4 rounded-xl border border-slate-700/80 shadow-[0_0_20px_rgba(0,0,0,0.4)] grid grid-cols-2 sm:grid-cols-4 gap-3 text-center backdrop-blur-sm">
            <div className="p-2.5 rounded-lg bg-[#11142D] border border-slate-700/60 shadow-md">
              <span className="text-[10px] text-slate-300 font-bold block mb-0.5 uppercase tracking-wider">Toplam Kalori</span>
              <span className="text-sm font-black text-white flex items-center justify-center gap-1">
                <Flame size={14} className="text-orange-400 filter drop-shadow-[0_0_6px_rgba(251,146,60,0.6)]" /> {totalCalories} / {targetCalories} kcal
              </span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#11142D] border border-slate-700/60 shadow-md">
              <span className="text-[10px] text-slate-300 font-bold block mb-0.5 uppercase tracking-wider">Protein</span>
              <span className="text-sm font-black text-rose-400 filter drop-shadow-[0_0_6px_rgba(251,113,133,0.5)]">{Math.round(totalProtein)}g</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#11142D] border border-slate-700/60 shadow-md">
              <span className="text-[10px] text-slate-300 font-bold block mb-0.5 uppercase tracking-wider">Karbonhidrat</span>
              <span className="text-sm font-black text-amber-400 filter drop-shadow-[0_0_6px_rgba(251,191,36,0.5)]">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="p-2.5 rounded-lg bg-[#11142D] border border-slate-700/60 shadow-md">
              <span className="text-[10px] text-slate-300 font-bold block mb-0.5 uppercase tracking-wider">Sağlıklı Yağ</span>
              <span className="text-sm font-black text-cyan-400 filter drop-shadow-[0_0_6px_rgba(34,211,238,0.5)]">{Math.round(totalFat)}g</span>
            </div>
          </div>

          {/* Öğün Oluşturucu Bölümü */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                Öğünler ve İçerikler <Sparkles size={14} className="text-emerald-400 filter drop-shadow-[0_0_8px_rgba(16,185,129,0.8)]" />
              </h4>
              <button
                type="button"
                onClick={handleAddMeal}
                className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#161b38] hover:bg-slate-700 text-slate-100 text-xs font-bold rounded-lg border border-slate-600 shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-colors"
              >
                <Plus size={14} className="text-emerald-400" /> Yeni Öğün Ekle
              </button>
            </div>

            {meals.map((meal, mIndex) => (
              <div key={meal.id} className="bg-[#161b38]/70 border border-slate-700/80 rounded-xl p-4 space-y-3 shadow-[0_4px_20px_rgba(0,0,0,0.3)] backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => {
                      const newMeals = [...meals];
                      newMeals[mIndex].name = e.target.value;
                      setMeals(newMeals);
                    }}
                    className="bg-[#11142D] font-extrabold text-xs text-emerald-400 border border-slate-700 hover:border-slate-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 rounded-lg px-2.5 py-1 shadow-inner"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddItem(meal.id)}
                      className="text-[11px] font-bold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 px-3 py-1 rounded-lg border border-emerald-500/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-colors"
                    >
                      + Besin Ekle
                    </button>
                    {meals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(meal.id)}
                        className="text-slate-400 hover:text-rose-400 p-1.5 rounded-lg bg-[#11142D] border border-slate-700 hover:border-rose-500/50 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Öğün Besin Listesi */}
                <div className="space-y-2">
                  {meal.items.map((item, iIndex) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[#11142D] p-2.5 rounded-xl border border-slate-700/80 shadow-inner text-xs">
                      <input
                        type="text"
                        placeholder="Besin Adı"
                        value={item.foodName}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIndex].items[iIndex].foodName = e.target.value;
                          setMeals(newMeals);
                        }}
                        className="col-span-4 bg-[#161b38] text-white font-semibold px-2.5 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 placeholder-slate-400"
                      />
                      <input
                        type="text"
                        placeholder="Porsiyon"
                        value={item.portion}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIndex].items[iIndex].portion = e.target.value;
                          setMeals(newMeals);
                        }}
                        className="col-span-2 bg-[#161b38] text-slate-200 font-medium px-2.5 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 placeholder-slate-400"
                      />
                      <input
                        type="number"
                        placeholder="Kalori"
                        value={item.calories}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIndex].items[iIndex].calories = Number(e.target.value);
                          setMeals(newMeals);
                        }}
                        className="col-span-2 bg-[#161b38] text-orange-400 font-bold px-2.5 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 text-center filter drop-shadow-[0_0_4px_rgba(251,146,60,0.4)]"
                      />
                      <input
                        type="number"
                        placeholder="Prot."
                        value={item.protein}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIndex].items[iIndex].protein = Number(e.target.value);
                          setMeals(newMeals);
                        }}
                        className="col-span-1 bg-[#161b38] text-rose-400 font-bold px-1.5 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 text-center filter drop-shadow-[0_0_4px_rgba(251,113,133,0.4)]"
                      />
                      <input
                        type="number"
                        placeholder="Karb."
                        value={item.carbs}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIndex].items[iIndex].carbs = Number(e.target.value);
                          setMeals(newMeals);
                        }}
                        className="col-span-1 bg-[#161b38] text-amber-400 font-bold px-1.5 py-1.5 rounded-lg border border-slate-600 focus:outline-none focus:border-emerald-400 focus:ring-1 focus:ring-emerald-500/30 text-center filter drop-shadow-[0_0_4px_rgba(251,191,36,0.4)]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(meal.id, item.id)}
                        className="col-span-2 text-slate-400 hover:text-rose-400 text-center flex justify-center items-center p-1.5 bg-[#161b38] rounded-lg border border-slate-700 hover:border-rose-500/50 transition-colors"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Modal Alt Butonlar */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-700/80">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-[#161b38] hover:bg-slate-700 text-xs font-bold text-slate-200 rounded-xl border border-slate-600 transition-colors shadow-md"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-xs font-bold text-white rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-1.5 border border-emerald-400/40"
            >
              <Check size={15} /> Şablonu Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}