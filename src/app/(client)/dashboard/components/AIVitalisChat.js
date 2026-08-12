"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function AIVitalisChat() {
  return (
    /* 
      Dış Kapsayıcı:
      - #11142D (Lacivert) arka plandan tam ayrışan Kristal Beyaz zemin (bg-white/95).
      - Neon Zümrüt border (border-emerald-500/30) ve hover durumunda Kehribar/Altın ışıltısı.
      - En kötü projeksiyonda dahi kolayca seçilebilir yüksek kontrastlı gölgelendirme.
    */
    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-emerald-500/30 hover:border-amber-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] relative">
      
      {/* Premium Header - Zümrüt Yeşil & Mat Altın Pırıltı */}
      <h3 className="text-xs font-black uppercase tracking-wider mb-3 flex items-center gap-2 text-slate-950">
        <Sparkles size={16} className="text-amber-400 fill-amber-300/40 animate-pulse drop-shadow-xs" /> 
        <span>Vitalis AI Asistan</span>
      </h3>
      
      {/* Öneri Kutusu - Fildişi/Bej Degrade Arka Plan & Zümrüt Vurgu */}
      <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-400/40 rounded-2xl p-3.5 mb-3.5 text-xs font-black text-amber-950 leading-relaxed shadow-xs">
        <span className="font-black text-emerald-700 uppercase tracking-wider block mb-1 drop-shadow-xs">Öneri:</span>
        "Bugün antrenmandan sonra kas onarımı için 150g tavuk göğsü yanına kompleks karbonhidrat eklemen ideal olacaktır."
      </div>
      
      {/* Girdi Alanı & Gönderme Butonu */}
      <div className="relative">
        <input 
          type="text" 
          placeholder="Bugün antrenmandan sonra ne yemeliyim?" 
          className="w-full text-xs bg-slate-50 border-2 border-slate-200 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 rounded-2xl pl-3.5 pr-10 py-3 outline-none transition-all text-slate-950 placeholder-slate-400 font-black shadow-xs"
        />
        <button className="absolute right-3 top-3 text-emerald-700 hover:text-emerald-500 active:scale-90 transition-all duration-150 cursor-pointer">
          <Sparkles size={16} className="fill-emerald-500/20 text-emerald-600 drop-shadow-xs" />
        </button>
      </div>
      
    </div>
  );
}