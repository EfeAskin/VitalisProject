"use client";

import React from "react";
import { Scale, Plus } from "lucide-react";

export default function MeasurementHistory({ onOpenDietitianNotice }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl bg-yellow-500/10 text-yellow-400 flex items-center justify-center border border-yellow-500/20">
            <Scale className="w-5 h-5" />
          </div>
          <div>
            <h4 className="font-black text-base text-white">Ölçüm Geçmişi</h4>
            <p className="text-xs text-slate-400">Haftalık kilo & yağ oranı değişimi</p>
          </div>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">1. Hafta (Başlangıç)</span>
            <span className="font-black text-white">80.2 kg / %16 Yağ</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800">
            <span className="text-slate-400 font-bold">2. Hafta</span>
            <span className="font-black text-white">79.1 kg / %15.2 Yağ</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-emerald-500/30">
            <span className="text-emerald-400 font-bold">3. Hafta (Güncel)</span>
            <span className="font-black text-emerald-400">78.5 kg / %14.2 Yağ</span>
          </div>
        </div>
      </div>

      <button 
        onClick={onOpenDietitianNotice}
        className="mt-4 w-full py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-700 text-slate-300 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
      >
        <Plus className="w-3.5 h-3.5" /> Yeni Ölçüm Ekle
      </button>
    </div>
  );
}