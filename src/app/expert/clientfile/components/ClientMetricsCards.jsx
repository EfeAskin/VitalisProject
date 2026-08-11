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
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* 1. Mevcut Kilo */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase">
              KİLO GELİŞİMİ
            </p>
            <h4 className="text-2xl font-black text-white mt-1">
              {client.current_weight || client.weight || 82}{" "}
              <span className="text-xs text-slate-400 font-normal">kg</span>
            </h4>
          </div>
          <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
            <Scale size={20} />
          </div>
        </div>
      </div>

      {/* 2. Hedef Kilo */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-[10px] font-extrabold text-slate-500 uppercase">
              HEDEF KİLO
            </p>
            {targetWeight ? (
              <h4 className="text-2xl font-black text-white mt-1">
                {targetWeight}{" "}
                <span className="text-xs text-slate-400 font-normal">kg</span>
              </h4>
            ) : (
              <div className="mt-1">
                <span className="text-xs text-amber-400 font-bold block">
                  Belirlenmedi (Uzman)
                </span>
                <span className="text-[11px] text-slate-400">
                  İdeal:{" "}
                  <strong className="text-white">
                    {client.ideal_weight || "74"} kg
                  </strong>
                </span>
              </div>
            )}
          </div>
          <div className="p-2.5 bg-[#EA580C]/10 text-[#EA580C] rounded-2xl border border-[#EA580C]/20">
            <Target size={20} />
          </div>
        </div>
        <button
          onClick={onOpenWeightModal}
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
        >
          <Plus size={12} />{" "}
          {targetWeight ? "Hedefi Güncelle" : "Hedef Kilo Belirle"}
        </button>
      </div>

      {/* 3. Günlük Kalori Hedefi */}
      <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-1.5">
              <p className="text-[10px] font-extrabold text-slate-500 uppercase">
                GÜNLÜK HEDEF
              </p>
              <span
                className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                  isExpertCalorieSet
                    ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {isExpertCalorieSet ? "UZMAN" : "SİSTEM AUTO"}
              </span>
            </div>
            <h4 className="text-2xl font-black text-white mt-1">
              {dailyCalorieTarget}{" "}
              <span className="text-xs text-slate-400 font-normal">kcal</span>
            </h4>
          </div>
          <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Flame size={20} />
          </div>
        </div>
        <button
          onClick={onOpenCalorieModal}
          className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
        >
          <Edit3 size={12} /> Kalori Hedefini Değiştir
        </button>
      </div>
    </div>
  );
}