import React from 'react';
import { Flame, Trophy, TrendingUp } from 'lucide-react';

export default function ExpertMotivationCard() {
  return (
    <div className="relative bg-gradient-to-br from-[#171c48] via-[#121633] to-[#251538] border border-orange-500/30 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.15)] flex flex-col justify-between h-full group hover:border-orange-500/60 transition-all">
      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-xl"></div>
      <div>
        <div className="flex items-center justify-between mb-3">
          <span className="px-2.5 py-1 bg-amber-500/20 border border-amber-500/40 text-amber-300 text-[10px] font-black uppercase rounded-lg flex items-center gap-1 shadow-[0_0_10px_rgba(245,158,11,0.2)]">
            <Trophy className="w-3 h-3 text-amber-400" /> HAFTALIK HEDEF
          </span>
          <Flame className="w-5 h-5 text-orange-400 animate-pulse" />
        </div>
        <h4 className="text-sm font-black text-white">Performans İvmesi Yüksek 🚀</h4>
        <p className="text-xs text-slate-300 mt-1 font-medium leading-relaxed">
          Danışanlarınızın uyum oranları bu hafta %15 arttı. Harika iş çıkarıyorsunuz!
        </p>
      </div>
      <div className="pt-4 mt-4 border-t border-orange-500/15 flex items-center justify-between text-xs font-bold text-orange-300">
        <span className="flex items-center gap-1"><TrendingUp className="w-3.5 h-3.5" /> Aktif Geri Bildirim</span>
        <span className="text-emerald-400 font-mono">%94 Başarı</span>
      </div>
    </div>
  );
}