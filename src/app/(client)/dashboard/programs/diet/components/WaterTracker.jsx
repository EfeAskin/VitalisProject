"use client";

import React from "react";
import { Droplets, Plus } from "lucide-react";

export default function WaterTracker({ waterMl, addWater, targetWaterMl }) {
  return (
    <div className="bg-emerald-950/25 border border-emerald-500/40 rounded-3xl p-6 flex flex-col justify-between backdrop-blur-2xl shadow-[0_0_35px_rgba(16,185,129,0.18)] hover:border-emerald-400/70 hover:shadow-[0_0_45px_rgba(16,185,129,0.3)] transition-all duration-500">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Droplets className="w-6 h-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div>
              <h4 className="font-black text-base text-white tracking-wide">Su Tüketimi Hatırlatıcısı</h4>
              <p className="text-xs text-emerald-100/70 font-medium">Günlük hidrasyon seviyeni koru</p>
            </div>
          </div>
          <span className="text-xs font-black text-emerald-300 bg-emerald-500/20 px-3.5 py-1.5 rounded-full border border-emerald-400/40 shadow-[0_0_12px_rgba(16,185,129,0.3)] backdrop-blur-md">
            {(waterMl / 1000).toFixed(2)}L / {(targetWaterMl / 1000).toFixed(2)}L
          </span>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="w-full bg-[#11142D] h-3.5 rounded-full overflow-hidden border border-emerald-500/30 mb-4 shadow-inner">
          <div 
            className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 h-full transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.6)]"
            style={{ width: `${(waterMl / targetWaterMl) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-emerald-500/20">
        <span className="text-xs text-emerald-200/80 font-semibold tracking-wide">1 Bardak = +250 ml</span>
        <button 
          onClick={addWater}
          disabled={waterMl >= targetWaterMl}
          className="px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 disabled:opacity-40 disabled:hover:from-emerald-500 disabled:hover:to-teal-500 active:scale-95 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)]"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>BARDAK EKLENEN (+250ml)</span>
        </button>
      </div>
    </div>
  );
}