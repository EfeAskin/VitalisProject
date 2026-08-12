"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WelcomeCard({ name = "Kamil" }) {
  return (
    <div className="bg-[#0B1E16]/80 backdrop-blur-xl border border-emerald-500/30 hover:border-emerald-400/60 rounded-3xl p-6 shadow-[0_10px_30px_rgba(4,36,22,0.6)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] transition-all duration-300 relative overflow-hidden group">
      
      {/* Arka planda parlak neon altın/zümrüt dekoratif ışıltı */}
      <div className="absolute right-[-20px] bottom-[-20px] text-amber-400/15 group-hover:text-amber-400/25 group-hover:scale-110 transition-all duration-500 pointer-events-none">
        <Sparkles size={130} />
      </div>

      <div className="relative z-10">
        <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
          Merhaba <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-300 to-amber-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.4)]">{name}</span>,
        </h2>
        
        <p className="text-amber-400 text-xs font-extrabold tracking-wide mt-1 drop-shadow-[0_0_10px_rgba(245,158,11,0.4)]">
          bugün harika bir gün!
        </p>
      </div>
      
      <p className="text-xs text-emerald-100/90 font-medium italic mt-4 leading-relaxed border-t border-emerald-500/20 pt-3 relative z-10">
        "Disiplin, hedefler ile başarı arasındaki köprüdür. Bugün o köprüyü inşa etmeye devam et."
      </p>
    </div>
  );
}