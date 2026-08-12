"use client";

import React from "react";
import { Scale, Target, Flame, Plus, Edit3 } from "lucide-react";

export default function ClientMetricsCards({
  client,
  targetWeight,
  dailyCalorieTarget,
  isExpertCalorieSet,
  onOpenWeightModal,
  onOpenCalorieModal,
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6">
      {/* 1. Mevcut Kilo */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 p-5 md:p-6 rounded-3xl backdrop-blur-2xl shadow-xl space-y-3 hover:border-emerald-500/30 transition-all duration-300 group flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <p className="text-[10px] font-heading font-black text-slate-300 uppercase tracking-widest">
              KİLO GELİŞİMİ
            </p>
            <h4 className="text-2xl md:text-3xl font-heading font-black text-white tracking-tight">
              {client.current_weight || client.weight || 82}{" "}
              <span className="text-xs text-slate-300 font-normal">kg</span>
            </h4>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-[0_0_15px_rgba(16,185,129,0.15)] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <Scale size={20} />
          </div>
        </div>
      </div>

      {/* 2. Hedef Kilo */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 p-5 md:p-6 rounded-3xl backdrop-blur-2xl shadow-xl space-y-4 hover:border-orange-500/30 transition-all duration-300 group flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <p className="text-[10px] font-heading font-black text-slate-300 uppercase tracking-widest">
              HEDEF KİLO
            </p>
            {targetWeight ? (
              <h4 className="text-2xl md:text-3xl font-heading font-black text-white tracking-tight">
                {targetWeight}{" "}
                <span className="text-xs text-slate-300 font-normal">kg</span>
              </h4>
            ) : (
              <div className="mt-1 space-y-0.5">
                <span className="text-xs text-amber-400 font-heading font-extrabold block">
                  Belirlenmedi (Uzman)
                </span>
                <span className="text-[11px] text-slate-300 font-medium">
                  İdeal:{" "}
                  <strong className="text-white font-mono font-bold">
                    {client.ideal_weight || "74"} kg
                  </strong>
                </span>
              </div>
            )}
          </div>
          <div className="p-3 bg-gradient-to-br from-orange-500/20 to-amber-500/10 text-orange-400 rounded-2xl border border-orange-500/30 shadow-[0_0_15px_rgba(249,115,22,0.15)] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <Target size={20} />
          </div>
        </div>
        <button
          onClick={onOpenWeightModal}
          className="w-full py-2 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 hover:text-white text-[11px] font-heading font-extrabold rounded-xl border border-slate-800/80 hover:border-orange-500/40 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-inner hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={14} className="text-orange-400" />{" "}
          <span>{targetWeight ? "Hedefi Güncelle" : "Hedef Kilo Belirle"}</span>
        </button>
      </div>

      {/* 3. Günlük Kalori Hedefi */}
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 p-5 md:p-6 rounded-3xl backdrop-blur-2xl shadow-xl space-y-4 hover:border-amber-500/30 transition-all duration-300 group flex flex-col justify-between">
        <div className="flex justify-between items-start gap-2">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <p className="text-[10px] font-heading font-black text-slate-300 uppercase tracking-widest">
                GÜNLÜK HEDEF
              </p>
              <span
                className={`text-[9px] px-2 py-0.5 rounded-full font-heading font-black uppercase tracking-wider ${
                  isExpertCalorieSet
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]"
                    : "bg-slate-950/80 text-slate-300 border border-slate-800"
                }`}
              >
                {isExpertCalorieSet ? "UZMAN" : "SİSTEM AUTO"}
              </span>
            </div>
            <h4 className="text-2xl md:text-3xl font-heading font-black text-white tracking-tight">
              {dailyCalorieTarget}{" "}
              <span className="text-xs text-slate-300 font-normal">kcal</span>
            </h4>
          </div>
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shadow-[0_0_15px_rgba(245,158,11,0.15)] group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
            <Flame size={20} />
          </div>
        </div>
        <button
          onClick={onOpenCalorieModal}
          className="w-full py-2 bg-slate-950/80 hover:bg-slate-800/80 text-slate-200 hover:text-white text-[11px] font-heading font-extrabold rounded-xl border border-slate-800/80 hover:border-amber-500/40 transition-all duration-300 flex items-center justify-center gap-1.5 shadow-inner hover:scale-[1.02] active:scale-[0.98]"
        >
          <Edit3 size={14} className="text-amber-400" />
          <span>Kalori Hedefini Değiştir</span>
        </button>
      </div>
    </div>
  );
}