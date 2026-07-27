"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIVitalisChat() {
  return (
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-[#C5A880]/15 transition-all hover:shadow-md hover:border-[#C5A880]/30">
      
      {/* Premium Header - Zümrüt Yeşil & Mat Altın Pırıltı */}
      <h3 className="text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5 text-[#0A3A25]">
        <Sparkles size={14} className="text-[#C5A880] fill-[#C5A880]/30 animate-pulse" /> Vitalis AI Asistan
      </h3>
      
      {/* Öneri Kutusu - Fildişi Bej Arka Plan & Zümrüt Vurgu */}
      <div className="bg-[#FCFAF7] rounded-xl p-3 border border-[#C5A880]/20 mb-3 text-[11px] text-[#8C724D] leading-relaxed">
        <span className="font-extrabold text-[#10B981] block mb-1">Öneri:</span>
        "Bugün antrenmandan sonra kas onarımı için 150g tavuk göğsü yanına kompleks karbonhidrat eklemen ideal olacaktır."
      </div>
      
      {/* Girdi Alanı & Gönderme Butonu */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Bugün antrenmandan sonra ne yemeliyim?" 
          className="w-full text-xs bg-[#F8FAF8] border border-slate-200/80 rounded-xl pl-3 pr-9 py-2.5 outline-none focus:border-[#10B981] focus:bg-white focus:ring-1 focus:ring-[#10B981]/10 transition-all text-slate-700 placeholder-slate-400 font-medium"
        />
        <button className="absolute right-3 top-2.5 text-[#0A3A25] hover:text-[#10B981] active:scale-90 transition-all duration-150">
          <Sparkles size={14} className="fill-current" />
        </button>
      </div>
      
    </div>
  );
}