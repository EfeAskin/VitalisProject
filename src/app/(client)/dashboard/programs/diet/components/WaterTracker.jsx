"use client";

import React from "react";
import { Droplets, Plus } from "lucide-react";

export default function WaterTracker({ waterMl, addWater, targetWaterMl }) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between">
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center border border-cyan-500/20">
              <Droplets className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-black text-base text-white">Su Tüketimi Hatırlatıcısı</h4>
              <p className="text-xs text-slate-400">Günlük hidrasyon seviyeni koru</p>
            </div>
          </div>
          <span className="text-xs font-black text-cyan-400 bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
            {(waterMl / 1000).toFixed(2)}L / {(targetWaterMl / 1000).toFixed(2)}L
          </span>
        </div>

        {/* İlerleme Çubuğu */}
        <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800 mb-4">
          <div 
            className="bg-gradient-to-r from-cyan-500 to-blue-500 h-full transition-all duration-500"
            style={{ width: `${(waterMl / targetWaterMl) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-800">
        <span className="text-xs text-slate-400 font-medium">1 Bardak = +250 ml</span>
        <button 
          onClick={addWater}
          disabled={waterMl >= targetWaterMl}
          className="px-4 py-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-50 active:scale-95 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-all"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>BARDAK EKLENEN (+250ml)</span>
        </button>
      </div>
    </div>
  );
}