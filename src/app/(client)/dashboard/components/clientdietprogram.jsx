"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Utensils,
  Clock,
  Flame,
  ChevronRight,
  Sparkles,
  Layers,
  AlertCircle,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Info,
  PieChart
} from "lucide-react";

const DAYS_MAP = [
  { key: "Pzt", full: "Pazartesi", jsDay: 1 },
  { key: "Sal", full: "Salı", jsDay: 2 },
  { key: "Çar", full: "Çarşamba", jsDay: 3 },
  { key: "Per", full: "Perşembe", jsDay: 4 },
  { key: "Cum", full: "Cuma", jsDay: 5 },
  { key: "Cmt", full: "Cumartesi", jsDay: 6 },
  { key: "Paz", full: "Pazar", jsDay: 0 }
];

export default function ClientDietProgram({ clientId }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [programData, setProgramData] = useState(null);

  // Otomatik olarak haftanın gününü tespit et
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const currentJsDay = new Date().getDay();
    const foundDay = DAYS_MAP.find((d) => d.jsDay === currentJsDay);
    return foundDay ? foundDay.key : "Pzt";
  });

  // Her öğünün seçili olan opsiyon indeksini tutar: { [mealIndex]: selectedOptionIndex }
  const [selectedMealOptions, setSelectedMealOptions] = useState({});

  useEffect(() => {
    fetchAssignedProgram();
  }, [clientId]);

  const fetchAssignedProgram = async () => {
    try {
      setLoading(true);
      setError(null);

      // Kullanıcı ID'si dışarıdan verilmediyse yerel depolamadan al
      let effectiveClientId = clientId;
      if (!effectiveClientId) {
        const storedUser = localStorage.getItem("user");
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            effectiveClientId = parsed.id || parsed.user_id;
          } catch (e) {
            console.error("User storage parse error:", e);
          }
        }
      }

      if (!effectiveClientId) {
        setLoading(false);
        return;
      }

      const response = await fetch(
        `/api/expert-diet-program/assigned-programs?client_id=${effectiveClientId}`
      );

      if (!response.ok) {
        throw new Error("Beslenme programı yüklenirken bir hata oluştu.");
      }

      const data = await response.json();
      
      if (Array.isArray(data) && data.length > 0) {
        // En güncel atanan diyet programını al
        setProgramData(data[0]);
      } else {
        setProgramData(null);
      }
    } catch (err) {
      console.error("Fetch assigned program error:", err);
      setError(err.message || "Veri çekilemedi.");
    } finally {
      setLoading(false);
    }
  };

  // Program detaylarını güvenli çözümleme (safe-parse)
  const programDetails = useMemo(() => {
    if (!programData?.program_details) return null;
    const details = programData.program_details;
    if (typeof details === "string") {
      try {
        return JSON.parse(details);
      } catch (e) {
        return null;
      }
    }
    return details;
  }, [programData]);

  // Seçili güne denk gelen day_type objesini güvenli şekilde bul
  const activeDayData = useMemo(() => {
    if (!programDetails?.day_types || !Array.isArray(programDetails.day_types)) {
      return null;
    }
    return programDetails.day_types.find(
      (day) =>
        day?.name?.toLowerCase().trim() === selectedDayKey.toLowerCase().trim() ||
        day?.dayKey?.toLowerCase().trim() === selectedDayKey.toLowerCase().trim()
    );
  }, [programDetails, selectedDayKey]);

  // Seçenek sekmesi tıklandığında aktif seçeneği değiştir
  const handleOptionChange = (mealIdx, optionIdx) => {
    setSelectedMealOptions((prev) => ({
      ...prev,
      [mealIdx]: optionIdx
    }));
  };

  return (
    <div className="w-full bg-[#081216]/95 backdrop-blur-2xl border border-emerald-500/20 rounded-2xl p-3.5 sm:p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4)] text-slate-100 transition-all duration-300">
      
      {/* KART BAŞLIĞI VE GÜN SEÇİMLERİ */}
      <div className="flex flex-col gap-3 pb-3.5 border-b border-emerald-900/40">
        
        {/* Sol Başlık Bilgisi */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.2)] flex-shrink-0">
            <Utensils className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] uppercase tracking-widest font-extrabold text-emerald-400">
                GÜNLÜK BESLENME VE DİYET RUTİNİ
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
                <Sparkles className="w-2.5 h-2.5 mr-1 text-emerald-400 animate-pulse" />
                Diyetisyen Onaylı
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2.5 mt-0.5 flex-wrap">
              <span>{programDetails?.template_title || "Aktif Diyet Programı"}</span>
              {programDetails?.target_calories ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-lg border border-amber-500/30 shadow-sm">
                  <Flame className="w-3 h-3 text-amber-400 fill-amber-400" />
                  Hedef: {programDetails.target_calories} kcal
                </span>
              ) : null}
            </h3>
          </div>
        </div>

        {/* HAFTALIK GÜN SEÇİCİ BAR */}
        <div className="w-full mt-0.5">
          <div className="grid grid-cols-7 gap-1 bg-[#03090b] p-1 rounded-xl border border-emerald-900/40 w-full">
            {DAYS_MAP.map((day) => {
              const isSelected = selectedDayKey === day.key;
              return (
                <button
                  key={day.key}
                  onClick={() => setSelectedDayKey(day.key)}
                  className={`relative py-1 sm:py-1.5 px-0.5 rounded-lg text-[10px] sm:text-[11px] font-bold transition-all duration-200 flex flex-col items-center justify-center w-full ${
                    isSelected
                      ? "bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 shadow-md shadow-emerald-500/20 font-black scale-100 sm:scale-105"
                      : "text-slate-400 hover:text-white hover:bg-slate-800/50"
                  }`}
                >
                  <span className="tracking-wide">{day.key}</span>
                  {isSelected && (
                    <span className="w-1 h-1 rounded-full bg-slate-950 mt-0.5 animate-ping" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* İÇERİK ALANI */}
      <div className="mt-3.5">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-8 text-slate-400 space-y-2">
            <RefreshCw className="w-6 h-6 animate-spin text-emerald-400" />
            <p className="text-xs font-semibold tracking-wide text-slate-300">Günlük diyet programı yükleniyor...</p>
          </div>
        ) : error ? (
          <div className="flex items-center gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs backdrop-blur-md">
            <AlertCircle className="w-4 h-4 flex-shrink-0 text-rose-400" />
            <span className="font-medium">{error}</span>
          </div>
        ) : !programDetails ? (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-[#03090b]/60 rounded-xl border border-dashed border-slate-800 p-4">
            <div className="w-10 h-10 rounded-xl bg-slate-800/50 flex items-center justify-center mb-2 text-slate-400">
              <Calendar className="w-5 h-5" />
            </div>
            <p className="text-xs font-bold text-slate-200">Henüz Atanmış Bir Diyet Programınız Bulunmuyor</p>
            <p className="text-[11px] text-slate-400 mt-0.5 max-w-sm">
              Diyetisyeniniz sizin için bir beslenme programı hazırladığında tüm detaylar gün bazlı olarak burada görüntülenecektir.
            </p>
          </div>
        ) : !activeDayData || !activeDayData.meals || activeDayData.meals.length === 0 ? (
          <div className="flex flex-col sm:flex-row items-center justify-center py-8 px-4 bg-[#03090b]/60 rounded-xl border border-slate-800/80 text-center sm:text-left gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 flex-shrink-0">
              <Info className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-slate-200">
                {DAYS_MAP.find((d) => d.key === selectedDayKey)?.full} Günü İçin Program Bulunmuyor
              </h4>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Bu gün için aktif bir diyet programı çizelgesi veya öğün tanımlanmamış. Dinlenme veya serbest beslenme günü olabilir.
              </p>
            </div>
          </div>
        ) : (
          /* ÖĞÜN VE SEÇENEK LİSTESİ */
          <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1 custom-scrollbar">
            {activeDayData.meals.map((meal, mealIdx) => {
              const hasMultipleOptions = Array.isArray(meal?.options) && meal.options.length > 0;
              const currentOptionIdx = selectedMealOptions[mealIdx] || 0;
              
              let itemsToShow = [];
              if (hasMultipleOptions) {
                const activeOpt = meal.options[currentOptionIdx] || meal.options[0];
                itemsToShow = activeOpt?.items || [];
              } else if (Array.isArray(meal?.items)) {
                itemsToShow = meal.items;
              }

              const mealTotals = itemsToShow.reduce(
                (acc, item) => ({
                  kcal: acc.kcal + (parseFloat(item?.calories) || 0),
                  p: acc.p + (parseFloat(item?.protein) || 0),
                  k: acc.k + (parseFloat(item?.carbs) || 0),
                  y: acc.y + (parseFloat(item?.fat) || 0)
                }),
                { kcal: 0, p: 0, k: 0, y: 0 }
              );

              return (
                <div
                  key={mealIdx}
                  className="bg-[#040b0e]/90 rounded-xl border border-emerald-900/40 overflow-hidden hover:border-emerald-500/30 transition-all duration-300 shadow-sm"
                >
                  {/* ÖĞÜN BAŞLIĞI & SAAT & SEÇENEK SEKMELERİ */}
                  <div className="px-3 sm:px-4 py-2.5 bg-[#07151a] border-b border-emerald-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)]" />
                      <h4 className="font-extrabold text-xs tracking-wide text-white uppercase">
                        {meal?.name || `ÖĞÜN ${mealIdx + 1}`}
                      </h4>
                      {meal?.time && (
                        <span className="flex items-center gap-1 text-[10px] font-mono font-semibold text-emerald-300 bg-emerald-950/70 px-2 py-0.5 rounded border border-emerald-800/40">
                          <Clock className="w-2.5 h-2.5 text-emerald-400" />
                          {meal.time}
                        </span>
                      )}
                    </div>

                    {/* ÇOKLU SEÇENEK/OPSİYON BUTONLARI */}
                    {hasMultipleOptions && (
                      <div className="flex items-center gap-1 bg-[#020709] p-0.5 rounded-lg border border-slate-800 self-start sm:self-auto flex-wrap">
                        <span className="text-[9px] uppercase font-bold text-slate-400 px-1 hidden sm:inline-block">
                          SEÇENEKLER:
                        </span>
                        {meal.options.map((opt, optIdx) => {
                          const isOptSelected = currentOptionIdx === optIdx;
                          return (
                            <button
                              key={optIdx}
                              onClick={() => handleOptionChange(mealIdx, optIdx)}
                              className={`px-2.5 py-0.5 rounded text-[11px] font-bold transition-all duration-150 flex items-center gap-1 ${
                                isOptSelected
                                  ? "bg-emerald-500 text-slate-950 shadow-sm font-black"
                                  : "text-slate-400 hover:text-white hover:bg-slate-800/70"
                              }`}
                            >
                              <Layers className="w-2.5 h-2.5" />
                              {opt?.name || `Seçenek ${optIdx + 1}`}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ÖĞÜN İÇERİĞİ VE BESİN LİSTESİ */}
                  <div className="p-2.5 sm:p-3 space-y-2">
                    {itemsToShow.length === 0 ? (
                      <p className="text-[11px] text-slate-400 italic text-center py-2">
                        Bu seçeneğe henüz besin içeriği eklenmemiş.
                      </p>
                    ) : (
                      itemsToShow.map((item, itemIdx) => (
                        <div
                          key={itemIdx}
                          className="flex flex-col lg:flex-row lg:items-center justify-between p-2.5 rounded-lg bg-[#071115] border border-slate-800/80 hover:border-emerald-500/30 transition-all gap-2"
                        >
                          {/* Besin Adı */}
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/80 flex-shrink-0" />
                            <span className="text-xs font-semibold text-slate-100">
                              {item?.foodName || item?.name || "Besin Adı Belirtilmedi"}
                            </span>
                          </div>

                          {/* Miktar, Kalori ve Makro Rozetleri */}
                          <div className="flex items-center flex-wrap gap-1.5 text-[10px]">
                            {/* Miktar */}
                            <span className="bg-emerald-950/50 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded-md font-mono font-bold">
                              {item?.amount || 100} {item?.unit || "g"}
                            </span>

                            {/* Kalori */}
                            <span className="bg-slate-900/90 text-amber-300 border border-amber-500/20 px-2 py-0.5 rounded-md font-mono font-bold">
                              {Math.round(parseFloat(item?.calories) || 0)} kcal
                            </span>

                            {/* Makro Detayları */}
                            <div className="bg-[#020709] text-slate-300 border border-slate-800 px-2 py-0.5 rounded-md font-mono flex items-center gap-1.5">
                              <span className="text-emerald-400 font-bold">
                                P: <span className="text-white">{Math.round(parseFloat(item?.protein) || 0)}g</span>
                              </span>
                              <span className="text-slate-700">|</span>
                              <span className="text-cyan-400 font-bold">
                                K: <span className="text-white">{Math.round(parseFloat(item?.carbs) || 0)}g</span>
                              </span>
                              <span className="text-slate-700">|</span>
                              <span className="text-amber-400 font-bold">
                                Y: <span className="text-white">{Math.round(parseFloat(item?.fat) || 0)}g</span>
                              </span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  {/* ÖĞÜN ÖZET MİKTAR BARI */}
                  {itemsToShow.length > 0 && (
                    <div className="px-3 sm:px-4 py-2 bg-[#020709]/80 border-t border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-400 font-mono gap-1">
                      <span className="flex items-center gap-1.5 font-sans font-bold text-slate-300">
                        <PieChart className="w-3 h-3 text-emerald-400" />
                        Öğün Toplamı
                      </span>
                      <div className="flex items-center flex-wrap gap-2.5">
                        <span className="text-amber-400 font-bold">{Math.round(mealTotals.kcal)} kcal</span>
                        <span className="text-slate-400">P: <strong className="text-emerald-300">{Math.round(mealTotals.p)}g</strong></span>
                        <span className="text-slate-400">K: <strong className="text-cyan-300">{Math.round(mealTotals.k)}g</strong></span>
                        <span className="text-slate-400">Y: <strong className="text-amber-300">{Math.round(mealTotals.y)}g</strong></span>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}