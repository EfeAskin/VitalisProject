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
          <h4 className="text-xl font-black text-white flex items-center gap-2.5 tracking-wide">
            <Utensils className="w-6 h-6 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            Özel Diyet Programı Seçimi
          </h4>
          <p className="text-xs text-emerald-100/70 mt-1 font-medium">
            Metabolik tercihlerine uygun protokolü seç veya diyetisyeninin atadığı programı incele.
          </p>
        </div>

        {/* Program Buton Filtreleri */}
        <div className="flex flex-wrap gap-2 bg-[#11142D] p-2 rounded-2xl border border-emerald-500/30 shadow-inner">
          {Object.keys(DIET_PROGRAMS).map((key) => {
            const prog = DIET_PROGRAMS[key];
            const isActive = selectedDietKey === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDietKey(key)}
                className={`px-4.5 py-2.5 rounded-xl text-xs font-black tracking-wider transition-all duration-300 ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.6)]"
                    : "text-emerald-200/70 hover:text-white hover:bg-emerald-500/10"
                }`}
              >
                {prog.badge}
              </button>
            );
          })}
        </div>
      </div>

      {/* Seçili Diyet Programı Detay Kartı */}
      <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-3xl p-6 md:p-8 space-y-6 backdrop-blur-2xl shadow-[0_0_35px_rgba(16,185,129,0.18)] hover:border-emerald-400/70 hover:shadow-[0_0_45px_rgba(16,185,129,0.3)] transition-all duration-500">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-b border-emerald-500/20 pb-6">
          <div>
            <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] backdrop-blur-md">
              {currentDiet.badge} PROTOKOLü
            </span>
            <h3 className="text-2xl font-black text-white mt-3 tracking-wide">{currentDiet.title}</h3>
            <p className="text-xs text-emerald-100/70 mt-1 max-w-2xl font-medium">{currentDiet.desc}</p>
          </div>
          <div className="text-right bg-[#11142D] p-4 rounded-2xl border border-emerald-500/30 min-w-[140px] shadow-inner">
            <span className="text-[10px] font-bold text-emerald-300/70 block">GÜNLÜK HEDEF</span>
            <span className="text-xl font-black text-emerald-400 mt-0.5 block drop-shadow-[0_0_8px_rgba(52,211,153,0.6)]">{currentDiet.dailyKcal}</span>
          </div>
        </div>

        {/* Makro Dağılım Çubukları */}
        <div>
          <h5 className="text-xs font-black tracking-widest text-emerald-200/80 uppercase mb-3">MAKRO NÜTRİSYON DAĞILIMI</h5>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-[#11142D] p-3.5 rounded-2xl border border-emerald-500/20 text-center shadow-inner">
              <span className="text-[10px] font-bold text-cyan-400 block">PROTEİN</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDiet.macros.protein}</span>
            </div>
            <div className="bg-[#11142D] p-3.5 rounded-2xl border border-emerald-500/20 text-center shadow-inner">
              <span className="text-[10px] font-bold text-amber-400 block">KARBONHİDRAT</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDiet.macros.carb}</span>
            </div>
            <div className="bg-[#11142D] p-3.5 rounded-2xl border border-emerald-500/20 text-center shadow-inner">
              <span className="text-[10px] font-bold text-rose-400 block">SAĞLIKLI YAĞ</span>
              <span className="text-base font-black text-white mt-0.5 block">{currentDiet.macros.fat}</span>
            </div>
          </div>
        </div>

        {/* Örnek Öğün Listesi & Kişiselleştirme Kilidi */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h5 className="text-xs font-black tracking-widest text-emerald-200/80 uppercase">GÜNLÜK ÖĞÜN REÇETESİ</h5>
            <button 
              onClick={onOpenDietitianNotice}
              className="text-xs font-bold text-emerald-300 hover:text-white flex items-center gap-1.5 bg-emerald-500/20 px-3.5 py-1.5 rounded-xl border border-emerald-400/40 shadow-[0_0_10px_rgba(16,185,129,0.2)] transition-all"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Öğün Kalorilerini Kişiselleştir</span>
              <Lock className="w-3 h-3 text-amber-400" />
            </button>
          </div>

          <div className="space-y-3">
            {currentDiet.menu.map((item, idx) => {
              const isChecked = completedMeals.includes(idx);
              return (
                <div 
                  key={idx}
                  onClick={() => toggleMeal(idx)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between backdrop-blur-md ${
                    isChecked 
                      ? "bg-emerald-950/40 border-emerald-500/50 opacity-80 shadow-[0_0_15px_rgba(16,185,129,0.15)]" 
                      : "bg-[#11142D]/80 border-emerald-500/20 hover:border-emerald-400/50 shadow-inner"
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center transition-all ${
                      isChecked ? "bg-emerald-500 text-slate-950 shadow-[0_0_10px_rgba(16,185,129,0.8)]" : "border border-emerald-500/40 text-transparent"
                    }`}>
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-extrabold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded border border-emerald-400/30">
                          {item.time}
                        </span>
                        <span className={`text-sm font-bold ${isChecked ? "line-through text-emerald-200/40" : "text-white"}`}>
                          {item.meal}
                        </span>
                      </div>
                      <p className="text-xs text-emerald-100/60 mt-1 font-medium">{item.desc}</p>
                    </div>
                  </div>

                  <span className={`text-[11px] font-bold hidden sm:block ${isChecked ? "text-emerald-400/70" : "text-emerald-200/60"}`}>
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