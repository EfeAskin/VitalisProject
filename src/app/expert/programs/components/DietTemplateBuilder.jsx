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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-[#111827] border border-slate-800 w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Başlık Barı */}
        <div className="px-6 py-4 bg-[#182134] border-b border-slate-800 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Utensils size={18} />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-white">
                {initialData ? "Diyet Şablonunu Düzenle" : "Yeni Elit Diyet & Beslenme Planı"}
              </h2>
              <p className="text-[11px] text-slate-400">Danışanlarınız için kişiselleştirilmiş makro odaklı plan tasarlayın.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-800/60">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          {/* Plan Detay Bilgileri */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">Plan Başlığı</label>
              <input
                type="text"
                required
                placeholder="Örn: Akdeniz Tipi Ketojenik Şablon"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hedef Kalori (kcal)</label>
              <input
                type="number"
                required
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Hedef & Kategori</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#182134] text-xs font-semibold text-white rounded-xl border border-slate-700/80 focus:outline-none focus:border-emerald-500"
              >
                <option value="Kilo Verme & Definisyon">Kilo Verme & Definisyon</option>
                <option value="Kas Kazanımı & Hacim">Kas Kazanımı & Hacim</option>
                <option value="Glutensiz & Detoks">Glutensiz & Detoks</option>
                <option value="Sporcu Performansı">Sporcu Performansı</option>
              </select>
            </div>
          </div>

          {/* Canlı Hesaplanan Makro Dashboard Özeti */}
          <div className="bg-[#182134]/90 p-4 rounded-xl border border-slate-800 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-2 rounded-lg bg-slate-900/50">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Toplam Kalori</span>
              <span className="text-sm font-black text-white flex items-center justify-center gap-1">
                <Flame size={14} className="text-orange-400" /> {totalCalories} / {targetCalories} kcal
              </span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Protein</span>
              <span className="text-sm font-black text-rose-400">{Math.round(totalProtein)}g</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Karbonhidrat</span>
              <span className="text-sm font-black text-amber-400">{Math.round(totalCarbs)}g</span>
            </div>
            <div className="p-2 rounded-lg bg-slate-900/50">
              <span className="text-[10px] text-slate-400 font-bold block mb-0.5">Sağlıklı Yağ</span>
              <span className="text-sm font-black text-blue-400">{Math.round(totalFat)}g</span>
            </div>
          </div>

          {/* Öğün Oluşturucu Bölümü */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                Öğünler ve İçerikler <Sparkles size={14} className="text-emerald-400" />
              </h4>
              <button
                type="button"
                onClick={handleAddMeal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-lg transition-colors"
              >
                <Plus size={14} /> Yeni Öğün Ekle
              </button>
            </div>

            {meals.map((meal, mIndex) => (
              <div key={meal.id} className="bg-[#182134]/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center">
                  <input
                    type="text"
                    value={meal.name}
                    onChange={(e) => {
                      const newMeals = [...meals];
                      newMeals[mIndex].name = e.target.value;
                      setMeals(newMeals);
                    }}
                    className="bg-transparent font-extrabold text-xs text-emerald-400 border-b border-transparent hover:border-slate-700 focus:border-emerald-500 focus:outline-none px-1 py-0.5"
                  />
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleAddItem(meal.id)}
                      className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 px-2.5 py-1 rounded-lg border border-emerald-500/30 transition-colors"
                    >
                      + Besin Ekle
                    </button>
                    {meals.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveMeal(meal.id)}
                        className="text-slate-500 hover:text-rose-400 p-1 rounded-lg"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {/* Öğün Besin Listesi */}
                <div className="space-y-2">
                  {meal.items.map((item, iIndex) => (
                    <div key={item.id} className="grid grid-cols-12 gap-2 items-center bg-[#111827] p-2 rounded-lg border border-slate-800 text-xs">
                      <input
                        type="text"
                        placeholder="Besin Adı"
                        value={item.foodName}
                        onChange={(e) => {
                          const newMeals = [...meals];
                          newMeals[mIndex].items[iIndex].foodName = e.target.value;
                          setMeals(newMeals);
                        }}
                        className="col-span-4 bg-[#182134] text-white px-2 py-1 rounded border border-slate-700 focus:outline-none"
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
                        className="col-span-2 bg-[#182134] text-slate-300 px-2 py-1 rounded border border-slate-700 focus:outline-none"
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
                        className="col-span-2 bg-[#182134] text-orange-400 font-bold px-2 py-1 rounded border border-slate-700 focus:outline-none"
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
                        className="col-span-1 bg-[#182134] text-rose-400 font-bold px-1.5 py-1 rounded border border-slate-700 focus:outline-none text-center"
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
                        className="col-span-1 bg-[#182134] text-amber-400 font-bold px-1.5 py-1 rounded border border-slate-700 focus:outline-none text-center"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(meal.id, item.id)}
                        className="col-span-2 text-slate-500 hover:text-rose-400 text-center flex justify-center"
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
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-slate-300 rounded-xl transition-colors"
            >
              Vazgeç
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-xs font-bold text-white rounded-xl shadow-[0_0_15px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5"
            >
              <Check size={15} /> Şablonu Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}