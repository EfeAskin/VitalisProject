"use client";

import React from "react";
import { Activity, Apple, Droplets, Dumbbell, CheckCircle2, AlertCircle } from "lucide-react";

export default function ClientWeeklyTracker({
  weeklySummary,
  selectedDayIndex,
  setSelectedDayIndex,
  dailyCalorieTarget,
}) {
  const currentDaySummary = weeklySummary[selectedDayIndex] || {
    meals: [],
    totalCalories: 0,
    waterIntake: 0,
    workoutDone: false,
    dayName: "",
    isToday: false,
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
        <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
          <Activity className="w-4 h-4 text-[#EA580C]" />
          Son 7 Günlük Aktivite & Diyet Takibi
        </h4>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {weeklySummary.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            const isToday = day.isToday;

            return (
              <button
                key={day.date}
                onClick={() => setSelectedDayIndex(idx)}
                className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center min-w-[58px] border ${
                  isSelected
                    ? "bg-[#EA580C] text-white border-[#EA580C] shadow-lg shadow-[#EA580C]/30 scale-105"
                    : isToday
                    ? "bg-slate-900 text-orange-400 border-[#EA580C]/50 hover:bg-slate-800"
                    : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                }`}
              >
                {isToday && !isSelected && (
                  <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EA580C]"></span>
                  </span>
                )}

                <span className="text-[11px] font-extrabold uppercase tracking-wider">
                  {day.dayName}
                </span>

                {isToday && (
                  <span
                    className={`text-[8px] font-black px-1 rounded mt-0.5 ${
                      isSelected
                        ? "bg-white/20 text-white"
                        : "bg-[#EA580C]/20 text-[#EA580C]"
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

      {/* SEÇİLİ GÜNÜN DETAYI */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Beslenme & Öğünler */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 md:col-span-2">
          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-300 flex items-center gap-1.5">
              <Apple className="w-4 h-4 text-emerald-400" /> Öğün Kayıtları (
              {currentDaySummary.isToday
                ? `${currentDaySummary.dayName} (Bugün)`
                : currentDaySummary.dayName}
              )
            </span>
            <span className="font-black text-emerald-400">
              {currentDaySummary.totalCalories} / {dailyCalorieTarget} kcal
            </span>
          </div>

          <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
            <div
              className="bg-emerald-500 h-full transition-all duration-300"
              style={{
                width: `${Math.min(
                  100,
                  (currentDaySummary.totalCalories / (dailyCalorieTarget || 1)) * 100
                )}%`,
              }}
            />
          </div>

          {currentDaySummary.meals && currentDaySummary.meals.length > 0 ? (
            <div className="space-y-1.5 pt-2">
              {currentDaySummary.meals.map((meal, idx) => (
                <div
                  key={`${meal.name}-${idx}`}
                  className="flex justify-between items-center text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50"
                >
                  <span className="text-slate-200 font-medium">{meal.name}</span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                    <span>P: {meal.protein}g</span>
                    <span>C: {meal.carb}g</span>
                    <span className="text-amber-400 font-bold">
                      {meal.kcal} kcal
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 py-6 text-center">
              Bu tarihte girilmiş öğün kaydı bulunmuyor.
            </p>
          )}
        </div>

        {/* Su & Antrenman */}
        <div className="space-y-4">
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-slate-300 flex items-center gap-1.5">
                <Droplets className="w-4 h-4 text-sky-400" /> Su Tüketimi
              </span>
              <span className="font-black text-sky-400">
                {currentDaySummary.waterIntake}L / 3.0L
              </span>
            </div>
            <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
              <div
                className="bg-sky-400 h-full transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    ((parseFloat(currentDaySummary.waterIntake) || 0) / 3.0) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs">
              <Dumbbell className="w-4 h-4 text-amber-400" />
              <span className="font-bold text-slate-300">Günün Antrenmanı</span>
            </div>
            {currentDaySummary.workoutDone ? (
              <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                <CheckCircle2 size={12} /> Tamamlandı
              </span>
            ) : (
              <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                <AlertCircle size={12} /> Yapılmadı
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}