"use client";

import React from "react";
import {
  Activity,
  Apple,
  Droplets,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  UtensilsCrossed,
} from "lucide-react";

export default function ClientWeeklyTracker({
  weeklySummary = [],
  selectedDayIndex = 0,
  setSelectedDayIndex,
  dailyCalorieTarget = 2000,
}) {
  const currentDaySummary = weeklySummary[selectedDayIndex] || {
    meals: [],
    totalCalories: 0,
    waterIntake: 0,
    workoutDone: false,
    dayName: "",
    isToday: false,
  };

  const caloriePercentage = Math.min(
    100,
    Math.round(
      (currentDaySummary.totalCalories / (dailyCalorieTarget || 1)) * 100
    )
  );

  const waterPercentage = Math.min(
    100,
    Math.round(
      ((parseFloat(currentDaySummary.waterIntake) || 0) / 3.0) * 100
    )
  );

  return (
    <div className="bg-[#1B204A] border border-orange-500/30 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_30px_rgba(0,0,0,0.5)] transition-all duration-300 space-y-6">
      {/* ÜST BAŞLIK VE GÜN SEÇİCİ */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-orange-500/20 pb-5 gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-[#121633] text-orange-400 rounded-2xl border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] flex-shrink-0">
            <Activity className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg md:text-xl font-heading font-black text-white tracking-tight">
              Haftalık Aktivite & Diyet Takibi
            </h3>
            <p className="text-xs text-slate-300 font-medium mt-0.5">
              Günlük kalori, su tüketimi ve antrenman performans verileri
            </p>
          </div>
        </div>

        {/* GÜN SEÇİM BUTONLARI */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-none">
          {weeklySummary.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isToday = day.isToday;

            return (
              <button
                key={day.date || idx}
                onClick={() => setSelectedDayIndex(idx)}
                className={`relative px-4 py-2.5 rounded-2xl text-xs font-heading font-bold transition-all duration-300 flex flex-col items-center min-w-[65px] border flex-shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white border-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105 z-10"
                    : isToday
                    ? "bg-[#121633] text-orange-400 border-orange-500/50 hover:bg-[#1A1F45]"
                    : "bg-[#121633] text-slate-400 border-orange-500/20 hover:bg-[#1A1F45] hover:text-slate-200"
                }`}
              >
                {isToday && !isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500 border border-[#1B204A]"></span>
                  </span>
                )}

                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  {day.dayName}
                </span>

                {isToday && (
                  <span
                    className={`text-[8px] font-black px-1.5 py-0.5 rounded-md mt-1 tracking-wider ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-orange-500/20 text-orange-400"
                    }`}
                  >
                    BUGÜN
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* SEÇİLİ GÜNÜN DETAY KARTLARI */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Beslenme & Öğünler */}
        <div className="bg-[#121633] p-5 md:p-6 rounded-2xl border border-orange-500/20 space-y-4 lg:col-span-2 shadow-[0_0_15px_rgba(0,0,0,0.2)] flex flex-col justify-between">
          <div className="space-y-3">
            <div className="flex flex-wrap justify-between items-center text-xs gap-2">
              <span className="font-heading font-bold text-slate-200 flex items-center gap-2">
                <Apple className="w-4 h-4 text-emerald-400" />
                <span>
                  Öğün Kayıtları ({currentDaySummary.dayName})
                </span>
              </span>
              <span className="font-heading font-black text-emerald-300 font-mono bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                {currentDaySummary.totalCalories} / {dailyCalorieTarget} kcal
              </span>
            </div>

            {/* İlerleme Çubuğu */}
            <div className="w-full bg-[#1B204A] h-2.5 rounded-full overflow-hidden p-0.5 border border-orange-500/10">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(16,185,129,0.4)]"
                style={{ width: `${caloriePercentage}%` }}
              />
            </div>
          </div>

          {/* Öğün Listesi */}
          {currentDaySummary.meals && currentDaySummary.meals.length > 0 ? (
            <div className="space-y-2 pt-1">
              {currentDaySummary.meals.map((meal, idx) => (
                <div
                  key={`${meal.name}-${idx}`}
                  className="flex items-center justify-between text-xs bg-[#1A1F45] hover:bg-[#202758] p-3 rounded-xl border border-orange-500/10 hover:border-orange-500/30 transition-all duration-200"
                >
                  <span className="text-slate-200 font-medium tracking-wide">
                    {meal.name}
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-mono">
                    <span className="bg-[#121633] px-2 py-0.5 rounded border border-orange-500/10">
                      P: <strong className="text-slate-200">{meal.protein}g</strong>
                    </span>
                    <span className="bg-[#121633] px-2 py-0.5 rounded border border-orange-500/10">
                      C: <strong className="text-slate-200">{meal.carb}g</strong>
                    </span>
                    <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                      {meal.kcal} kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 bg-[#1A1F45]/50 rounded-xl border border-dashed border-orange-500/20 text-center space-y-2">
              <div className="w-9 h-9 rounded-xl bg-[#121633] border border-orange-500/20 flex items-center justify-center text-slate-500">
                <UtensilsCrossed className="w-4 h-4 text-slate-500" />
              </div>
              <p className="text-xs text-slate-500 font-medium">
                Bu tarihte girilmiş öğün kaydı bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Su & Antrenman */}
        <div className="space-y-4 flex flex-col justify-between">
          {/* Su Tüketimi */}
          <div className="bg-[#121633] p-5 rounded-2xl border border-orange-500/20 space-y-3 shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <div className="flex justify-between items-center text-xs">
              <span className="font-heading font-bold text-slate-200 flex items-center gap-2">
                <Droplets className="w-4 h-4 text-sky-400" />
                <span>Su Tüketimi</span>
              </span>
              <span className="font-heading font-black text-sky-300 font-mono bg-sky-500/10 px-2.5 py-1 rounded-lg border border-sky-500/30">
                {currentDaySummary.waterIntake}L / 3.0L
              </span>
            </div>

            <div className="w-full bg-[#1B204A] h-2.5 rounded-full overflow-hidden p-0.5 border border-orange-500/10">
              <div
                className="bg-gradient-to-r from-sky-500 to-cyan-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(56,189,248,0.4)]"
                style={{ width: `${waterPercentage}%` }}
              />
            </div>
          </div>

          {/* Günün Antrenmanı */}
          <div className="bg-[#121633] p-5 rounded-2xl border border-orange-500/20 flex items-center justify-between shadow-[0_0_15px_rgba(0,0,0,0.2)]">
            <div className="flex items-center gap-2.5 text-xs">
              <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                <Dumbbell className="w-4 h-4" />
              </div>
              <span className="font-heading font-bold text-slate-200">
                Günün Antrenmanı
              </span>
            </div>

            {currentDaySummary.workoutDone ? (
              <span className="text-[10px] font-heading font-black uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 flex items-center gap-1.5 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
                <CheckCircle2 size={13} /> Tamamlandı
              </span>
            ) : (
              <span className="text-[10px] font-heading font-black uppercase tracking-wider text-slate-400 bg-[#1A1F45] px-3 py-1.5 rounded-xl border border-orange-500/20 flex items-center gap-1.5">
                <AlertCircle size={13} /> Yapılmadı
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}