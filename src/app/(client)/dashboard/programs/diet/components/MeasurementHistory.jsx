"use client";

import React from "react";
import { Scale, Plus } from "lucide-react";

export default function MeasurementHistory({ onOpenDietitianNotice }) {
  return (
    <div className="bg-amber-950/25 border border-amber-500/40 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-2xl shadow-[0_0_35px_rgba(245,158,11,0.18)] hover:border-amber-400/70 hover:shadow-[0_0_45px_rgba(245,158,11,0.3)] transition-all duration-500">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-400 flex items-center justify-center border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
            <Scale className="w-6 h-6 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
          </div>
          <div>
            <h4 className="font-black text-base text-white tracking-wide">Ölçüm Geçmişi</h4>
            <p className="text-xs text-amber-100/70 font-medium">Haftalık kilo & yağ oranı değişimi</p>
          </div>
        </div>

        <div className="space-y-2.5 text-xs">
          <div className="flex justify-between items-center p-3.5 bg-[#11142D]/80 rounded-2xl border border-amber-500/20 backdrop-blur-md shadow-inner">
            <span className="text-amber-200/70 font-bold">1. Hafta (Başlangıç)</span>
            <span className="font-black text-white tracking-wide">80.2 kg / %16 Yağ</span>
          </div>
          <div className="flex justify-between items-center p-3.5 bg-[#11142D]/80 rounded-2xl border border-amber-500/20 backdrop-blur-md shadow-inner">
            <span className="text-amber-200/70 font-bold">2. Hafta</span>
            <span className="font-black text-white tracking-wide">79.1 kg / %15.2 Yağ</span>
          </div>
          <div className="flex justify-between items-center p-3.5 bg-[#11142D]/90 rounded-2xl border border-emerald-500/50 backdrop-blur-md shadow-[0_0_15px_rgba(16,185,129,0.2)]">
            <span className="text-emerald-400 font-extrabold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_8px_rgba(52,211,153,1)]"></span>
              3. Hafta (Güncel)
            </span>
            <span className="font-black text-emerald-300 tracking-wide">78.5 kg / %14.2 Yağ</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onOpenDietitianNotice}
        className="mt-5 w-full py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black rounded-2xl text-xs transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(245,158,11,0.5)] hover:shadow-[0_0_30px_rgba(245,158,11,0.8)] active:scale-95"
      >
        <Plus className="w-4 h-4 stroke-[3]" /> Yeni Ölçüm Ekle
      </button>
    </div>
  );
}