"use client";

import React from "react";
import { Utensils, Sliders, Lock, Check } from "lucide-react";
import { DIET_PROGRAMS } from "../data/dietData";

export default function DietProgramSelector({ 
  selectedDietKey, 
  setSelectedDietKey, 
  currentDiet, 
  completedMeals, 
  toggleMeal, 
  onOpenDietitianNotice 
}) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h4 className="text-xl font-black text-white flex items-center gap-2">
            <Utensils className="w-5 h-5 text-emerald-400" />
            Özel Diyet Programı Seçimi
          </h4>
          <p className="text-xs text-slate-400 mt-1">
            Metabolik tercihlerine uygun protokolü seç veya diyetisyeninin atadığı programı incele.
          </p>
        </div>

        {/* Program Buton Filtreleri */}
        <div className="flex flex-wrap gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          {Object.keys(DIET_PROGRAMS).map((key) => {
            const prog = DIET_PROGRAMS[key];
            const isActive = selectedDietKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDietKey(key)}
                className={`px-4 py-2 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                {prog.badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seçili Diyet Programı Detay Kartı */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {currentDiet.badge} PROTOKOLÜ
            </span>
            <h3 className="text-2xl font-black text-white mt-2">{currentDiet.title}</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">{currentDiet.desc}</p>
          </div>
          <div className="text-right bg-slate-950 p-4 rounded-2xl border border-slate-800 min-w-[140px]">
            <span className="text-[10px] font-bold text-slate-500 block">GÜNLÜK HEDEF</span>
            <span className="text-xl font-black text-emerald-400">{currentDiet.dailyKcal}</span>
          </div>
        </div>

        {/* Makro Dağılım Çubukları */}
        <div>
          <h5 className="text-xs font-black tracking-widest text-slate-400 uppercase mb-3">MAKRO NÜTRİSYON DAĞILIMI</h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-blue-400 block">PROTEİN</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDiet.macros.protein}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-amber-400 block">KARBONHİDRAT</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDiet.macros.carb}</span>
            </div>
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-center">
              <span className="text-[10px] font-bold text-rose-400 block">SAĞLIKLI YAĞ</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDiet.macros.fat}</span>
            </div>
          </div>
        </div>

        {/* Örnek Öğün Listesi & Kişiselleştirme Kilidi */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs font-black tracking-widest text-slate-400 uppercase">GÜNLÜK ÖĞÜN REÇETESİ</h5>
            <button 
              onClick={onOpenDietitianNotice}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1.5 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/20"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Öğün Kalorilerini Kişiselleştir</span>
              <Lock className="w-3 h-3 text-yellow-500" />
            </button>
          </div>

          <div className="space-y-3">
            {currentDiet.menu.map((item, idx) => {
              const isChecked = completedMeals.includes(idx);
              return (
                <div 
                  key={idx}
                  onClick={() => toggleMeal(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between ${
                    isChecked 
                      ? "bg-emerald-950/20 border-emerald-500/40 opacity-80" 
                      : "bg-slate-950 border-slate-800 hover:border-slate-700"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isChecked ? "bg-emerald-500 text-slate-950" : "border border-slate-700 text-transparent"
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {item.time}
                        </span>
                        <span className={`text-sm font-bold ${isChecked ? "line-through text-slate-500" : "text-white"}`}>
                          {item.meal}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">{item.desc}</p>
                    </div>
                  </div>

                  <span className="text-[11px] font-bold text-slate-500 hidden sm:block">
                    {isChecked ? "TAMAMLANDI" : "BEKLİYOR"}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}