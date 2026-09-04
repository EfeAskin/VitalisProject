"use client";

import React, { useState } from "react";
import { Calendar, Dumbbell, Flame, Layers, Utensils, Apple, Clock } from "lucide-react";

const DAYS = [
  { key: "Pzt", full: "Pazartesi" },
  { key: "Sal", full: "Salı" },
  { key: "Çar", full: "Çarşamba" },
  { key: "Per", full: "Perşembe" },
  { key: "Cum", full: "Cuma" },
  { key: "Cmt", full: "Cumartesi" },
  { key: "Paz", full: "Pazar" },
];

export default function ClientWeeklyScheduleCard({
  weeklyPrograms = [],
  programs = [],
  assignedPrograms = [],
  dietPrograms = [],
}) {
  const [selectedDay, setSelectedDay] = useState("Pzt");

  // Diyet kartı ve antrenman tespiti kontrolü
  const isDietItem = (item) => {
    const nameLower = (
      item.name ||
      item.title ||
      item.template_name ||
      item.program_details?.title ||
      item.program_details?.goal ||
      ""
    ).toLowerCase();

    return (
      item.itemType === "diet" ||
      item.diet_template_id !== undefined ||
      item.dietitian_id !== undefined ||
      item.target_calories !== undefined ||
      item.program_details?.day_types !== undefined ||
      item.program_details?.target_calories !== undefined ||
      nameLower.includes("diyet") ||
      nameLower.includes("diet") ||
      nameLower.includes("beslenme") ||
      nameLower.includes("sağlık")
    );
  };

  // Güne atanmışlık kontrolü
  const getItemDays = (item) => {
    if (Array.isArray(item.assigned_days) && item.assigned_days.length > 0) return item.assigned_days;
    if (Array.isArray(item.program_details?.assigned_days) && item.program_details.assigned_days.length > 0) return item.program_details.assigned_days;
    if (Array.isArray(item.days) && item.days.length > 0) return item.days;
    return [];
  };

  // Öğün verilerini seçili güne göre çekme
  const extractMeals = (dietItem, currentDay) => {
    if (Array.isArray(dietItem.meals) && dietItem.meals.length > 0) {
      return dietItem.meals;
    }
    if (Array.isArray(dietItem.program_details?.meals) && dietItem.program_details.meals.length > 0) {
      return dietItem.program_details.meals;
    }

    const dayTypes = dietItem.day_types || dietItem.program_details?.day_types;
    if (Array.isArray(dayTypes) && dayTypes.length > 0) {
      // 1. Öncelik: Seçili günün key'i ile eşleşen day_type bul
      const matchedDay = dayTypes.find((dt) => {
        const dtDays = dt.assigned_days || dt.days || [];
        return Array.isArray(dtDays) && dtDays.includes(currentDay);
      });

      if (matchedDay && Array.isArray(matchedDay.meals)) {
        return matchedDay.meals;
      }

      // 2. Öncelik: Eşleşme yoksa haftanın gün sırasına göre day_type seç
      const dayIndex = DAYS.findIndex((d) => d.key === currentDay);
      const targetDayType = dayTypes[dayIndex] || dayTypes[0];
      if (targetDayType && Array.isArray(targetDayType.meals)) {
        return targetDayType.meals;
      }
    }
    return [];
  };

  // Öğün içindeki besin maddelerini çıkarma
  const extractFoodItems = (meal) => {
    let foods = [];
    if (Array.isArray(meal.items) && meal.items.length > 0) {
      foods = meal.items;
    } else if (Array.isArray(meal.foods) && meal.foods.length > 0) {
      foods = meal.foods;
    } else if (Array.isArray(meal.options)) {
      meal.options.forEach((opt) => {
        if (Array.isArray(opt.items)) {
          foods.push(...opt.items);
        } else if (Array.isArray(opt.foods)) {
          foods.push(...opt.foods);
        }
      });
    }
    return foods;
  };

  // Tüm kaynaklardan gelen verileri birleştir
  const rawItemList = [
    ...weeklyPrograms,
    ...programs,
    ...assignedPrograms,
    ...dietPrograms,
  ];

  const combinedNormalized = rawItemList.map((item) => {
    const isDiet = isDietItem(item);
    return {
      ...item,
      itemType: isDiet ? "diet" : item.itemType || "workout",
    };
  });

  // Seçili güne ait programları filtrele ve mükerrer kayıtları engelle
  const activeItemsForDay = combinedNormalized.filter((item, index, self) => {
    const days = getItemDays(item);
    const isForThisDay = days.includes(selectedDay);
    if (!isForThisDay) return false;

    const itemKey = item.id
      ? item.id
      : `${item.name || item.title || item.template_name || item.program_details?.title}-${selectedDay}`;

    return (
      self.findIndex((t) => {
        const tKey = t.id
          ? t.id
          : `${t.name || t.title || t.template_name || t.program_details?.title}-${selectedDay}`;
        return tKey === itemKey;
      }) === index
    );
  });

  const selectedDayFull = DAYS.find((d) => d.key === selectedDay)?.full || selectedDay;

  return (
    <div className="relative overflow-hidden bg-[#0D101D]/95 border border-slate-800 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_40px_rgba(0,0,0,0.4)] space-y-6">
      {/* HEADER & HAFTANIN GÜNLERİ SEKMELERİ */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-br from-orange-500/20 via-amber-500/10 to-emerald-500/20 border border-orange-500/30 rounded-2xl text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)]">
            <Calendar size={22} />
          </div>
          <div>
            <h3 className="text-base font-heading font-black text-white tracking-wide">
              Haftalık Antrenman & Diyet Rutini
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Güne göre atanmış antrenman programları, diyet planları ve beslenme detayları
            </p>
          </div>
        </div>

        {/* GÜN SEÇİM BUTONLARI */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 custom-scrollbar">
          {DAYS.map((d) => {
            const isSelected = selectedDay === d.key;

            const hasWorkout = combinedNormalized.some((item) => {
              if (item.itemType === "diet") return false;
              const days = getItemDays(item);
              return days.includes(d.key);
            });

            const hasDiet = combinedNormalized.some((item) => {
              if (item.itemType !== "diet") return false;
              const days = getItemDays(item);
              return days.includes(d.key);
            });

            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDay(d.key)}
                className={`relative px-4 py-2 rounded-xl text-xs font-heading font-black transition-all duration-300 cursor-pointer shrink-0 flex items-center gap-2 ${
                  isSelected
                    ? "bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] scale-105"
                    : "bg-[#141833] text-slate-400 hover:text-white hover:bg-[#1C2248] border border-slate-800/80"
                }`}
              >
                <span>{d.key}</span>
                <div className="flex items-center gap-1">
                  {hasWorkout && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-white" : "bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.8)]"
                      }`}
                    />
                  )}
                  {hasDiet && (
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        isSelected ? "bg-emerald-200" : "bg-emerald-400 shadow-[0_0_8px_rgba(16,185,129,0.8)]"
                      }`}
                    />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* SEÇİLİ GÜN İÇERİĞİ */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-heading font-extrabold text-slate-200 flex items-center gap-2">
            <span className="text-orange-400">{selectedDayFull}</span> Programı ve Rutinleri
          </h4>
          <span className="text-xs font-mono font-bold text-slate-400 bg-slate-800/60 px-2.5 py-1 rounded-lg border border-slate-700/50">
            {activeItemsForDay.length} Aktif Rutin
          </span>
        </div>

        {activeItemsForDay.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
            {activeItemsForDay.map((item, idx) => {
              const isDiet = isDietItem(item);

              if (isDiet) {
                const dietTitle =
                  item.title ||
                  item.name ||
                  item.program_details?.title ||
                  item.program_details?.goal ||
                  "Diyet Planı";

                const targetCalories =
                  item.target_calories ||
                  item.program_details?.target_calories ||
                  item.program_details?.goal_calories ||
                  2000;

                const meals = extractMeals(item, selectedDay);

                return (
                  <div
                    key={item.id || `diet-${idx}`}
                    className="bg-gradient-to-b from-[#0F2220]/90 to-[#0A1615]/90 border border-emerald-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-[0_0_25px_rgba(16,185,129,0.08)] flex flex-col"
                  >
                    {/* DİYET KARTI BAŞLIĞI */}
                    <div className="flex items-center justify-between border-b border-emerald-500/20 pb-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                          <Utensils size={18} />
                        </div>
                        <div>
                          <h5 className="text-sm font-heading font-black text-white tracking-wide">
                            {dietTitle}
                          </h5>
                          <p className="text-[11px] text-emerald-400 font-mono flex items-center gap-1 mt-0.5">
                            <Apple size={12} /> Hedef: {targetCalories} kcal
                          </p>
                        </div>
                      </div>

                      <span className="text-[10px] font-heading font-black uppercase tracking-wider text-emerald-300 bg-emerald-500/20 border border-emerald-500/40 px-3 py-1 rounded-lg shadow-sm">
                        Diyet Planı
                      </span>
                    </div>

                    {/* ÖĞÜNLER LİSTESİ */}
                    <div className="space-y-3 flex-1">
                      <span className="text-[11px] font-heading font-bold uppercase text-slate-400 flex items-center gap-1.5 tracking-wider">
                        <Flame size={13} className="text-emerald-400" /> Günlük Öğün Listesi
                      </span>

                      {meals.length > 0 ? (
                        <div className="space-y-3 max-h-[380px] overflow-y-auto pr-1.5 custom-scrollbar">
                          {meals.map((meal, mIdx) => {
                            const foodItems = extractFoodItems(meal);
                            const mealName = meal.name || meal.title || meal.meal_name || `Öğün ${mIdx + 1}`;
                            const mealTime = meal.time ? meal.time : null;

                            return (
                              <div
                                key={meal.id || mIdx}
                                className="bg-[#071114] border border-emerald-500/25 p-3.5 rounded-xl space-y-2.5 transition-all duration-200 hover:border-emerald-500/45"
                              >
                                {/* Öğün Başlığı & Saati */}
                                <div className="flex items-center justify-between border-b border-emerald-500/15 pb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="w-5 h-5 rounded-md bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-mono font-bold text-[11px] flex items-center justify-center shrink-0">
                                      {mIdx + 1}
                                    </span>
                                    <span className="font-heading font-black text-white text-xs tracking-wider uppercase">
                                      {mealName}
                                    </span>
                                  </div>

                                  {mealTime && (
                                    <span className="font-mono font-bold text-emerald-400 text-xs bg-emerald-500/15 border border-emerald-500/35 px-2.5 py-0.5 rounded-md flex items-center gap-1 shadow-sm">
                                      <Clock size={12} /> {mealTime}
                                    </span>
                                  )}
                                </div>

                                {/* Besin Elemanları Listesi */}
                                {foodItems.length > 0 ? (
                                  <div className="space-y-1.5">
                                    {foodItems.map((food, fIdx) => {
                                      const foodName =
                                        food.foodName ||
                                        food.name ||
                                        food.food_name ||
                                        food.title ||
                                        food.label ||
                                        food.besin_adi ||
                                        "Besin";
                                      const amount = food.amount ?? food.quantity ?? food.miktar ?? "";
                                      const unit = food.unit || food.portion_unit || food.birim || "";
                                      const calories = food.calories ?? food.kcal ?? food.cal ?? null;
                                      const protein = food.protein ?? food.prot ?? food.protein_g ?? null;
                                      const carbs = food.carbs ?? food.carb ?? food.karb ?? null;
                                      const fat = food.fat ?? food.yag ?? food.yağ ?? null;

                                      return (
                                        <div
                                          key={food.id || fIdx}
                                          className="group flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#0E1A1D]/90 hover:bg-[#122226] border border-emerald-500/15 hover:border-emerald-500/35 p-2.5 rounded-lg text-xs transition-all duration-200"
                                        >
                                          {/* Besin Adı */}
                                          <div className="flex items-center gap-2 min-w-0">
                                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shrink-0 group-hover:scale-125 transition-transform" />
                                            <span className="text-slate-100 font-bold truncate tracking-wide text-xs">
                                              {foodName}
                                            </span>
                                          </div>

                                          {/* Miktar, Birim, Kalori ve Makrolar */}
                                          <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-auto flex-wrap">
                                            {(amount !== "" || unit) && (
                                              <span className="font-mono font-bold text-emerald-300 bg-emerald-500/20 border border-emerald-500/35 px-2 py-0.5 rounded text-[11px]">
                                                {amount} {unit}
                                              </span>
                                            )}

                                            {calories !== null && (
                                              <span className="font-mono font-semibold text-slate-300 bg-slate-800/80 border border-slate-700/60 px-2 py-0.5 rounded text-[11px]">
                                                {calories} kcal
                                              </span>
                                            )}

                                            {(protein !== null || carbs !== null || fat !== null) && (
                                              <div className="hidden xl:flex items-center gap-1 font-mono text-[10px] text-slate-400 bg-[#050B0D] border border-slate-800 px-1.5 py-0.5 rounded">
                                                {protein !== null && <span className="text-rose-400">P:{protein}g</span>}
                                                {carbs !== null && <span className="text-amber-400">K:{carbs}g</span>}
                                                {fat !== null && <span className="text-cyan-400">Y:{fat}g</span>}
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                ) : (
                                  <div className="text-[11px] text-slate-400 italic bg-[#0C171A] p-2.5 rounded-lg text-center border border-emerald-500/10">
                                    Öğüne eklenmiş özel bir besin maddesi bulunmuyor.
                                  </div>
                                )}
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <div className="text-xs text-slate-400 italic bg-[#071114] p-4 rounded-xl border border-emerald-500/20 text-center">
                          Bu diyet planı için tanımlanmış özel öğün detayı bulunmuyor.
                        </div>
                      )}
                    </div>
                  </div>
                );
              }

              // ANTRENMAN KARTI
              const exercises = item.exercises || item.template_exercises || [];
              const workoutTitle = item.name || item.template_name || "Günün Antrenmanı";

              return (
                <div
                  key={item.id || `workout-${idx}`}
                  className="bg-gradient-to-b from-[#171A3B]/90 to-[#10132B]/90 border border-orange-500/30 rounded-2xl p-5 space-y-4 backdrop-blur-xl shadow-[0_0_25px_rgba(249,115,22,0.08)] flex flex-col"
                >
                  <div className="flex items-center justify-between border-b border-slate-700/60 pb-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 rounded-xl text-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.2)]">
                        <Dumbbell size={18} />
                      </div>
                      <div>
                        <h5 className="text-sm font-heading font-black text-white tracking-wide">
                          {workoutTitle}
                        </h5>
                        <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                          {item.duration_minutes ? `${item.duration_minutes} Dakika` : "Standart Süre"}
                        </p>
                      </div>
                    </div>

                    <span className="text-[10px] font-heading font-black uppercase tracking-wider text-orange-300 bg-orange-500/20 border border-orange-500/40 px-3 py-1 rounded-lg shadow-sm">
                      Antrenman
                    </span>
                  </div>

                  <div className="space-y-2.5 flex-1">
                    <span className="text-[11px] font-heading font-bold uppercase text-slate-400 flex items-center gap-1.5 tracking-wider">
                      <Layers size={13} className="text-orange-400" /> Egzersizler & Set Detayları
                    </span>

                    {exercises.length > 0 ? (
                      <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1 custom-scrollbar">
                        {exercises.map((ex, exIdx) => (
                          <div
                            key={ex.id || exIdx}
                            className="flex items-center justify-between bg-[#10132B] border border-slate-700/60 hover:border-orange-500/45 p-3 rounded-xl text-xs transition-all duration-200"
                          >
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="w-5 h-5 rounded-md bg-orange-500/20 border border-orange-500/40 text-orange-400 font-mono font-bold text-[10px] flex items-center justify-center shrink-0">
                                {exIdx + 1}
                              </span>
                              <span className="font-heading font-bold text-slate-200 truncate">
                                {ex.exercise_name || ex.name || "Egzersiz"}
                              </span>
                            </div>

                            <div className="flex items-center gap-2 shrink-0">
                              <span className="font-mono text-amber-300 font-bold bg-amber-500/15 border border-amber-500/35 px-2.5 py-1 rounded-md text-[11px]">
                                {ex.sets || 3} Set x {ex.reps || "12"}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-slate-400 italic bg-[#10132B] p-4 rounded-xl border border-slate-800 text-center">
                        Bu programa eklenmiş egzersiz detayları bulunmuyor.
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-[#141833]/50 border border-dashed border-slate-800 rounded-2xl p-10 text-center space-y-3">
            <Flame size={36} className="mx-auto text-slate-600" />
            <h5 className="text-sm font-heading font-bold text-slate-300">
              {selectedDayFull} günü için aktif bir rutin veya program atanmamış.
            </h5>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Atanan diyet ve antrenman programları takvim günlerine göre burada sıralanacaktır.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}