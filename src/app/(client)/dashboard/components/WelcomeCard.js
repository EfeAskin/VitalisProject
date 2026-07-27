"use client";
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function WelcomeCard({ name = "Kamil" }) {
  return (
    /* 
      - Arka planı derin zümrüt yeşili kadife degradeye (Deep Velvet Emerald) çevirdik.
      - Kenarlara çok zarif ve hafif bir mat altın çerçeve (border-[#C5A880]/10) ekledik.
      - Hover durumunda lüks hissi pekiştiren hafif bir gölge ve sınır parlaması geçişi koyduk.
    */
    <div className="bg-gradient-to-br from-[#042416] to-[#0A3A25] text-white rounded-2xl p-6 shadow-md border border-[#C5A880]/10 relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-[#C5A880]/20">
      
      {/* Arka plandaki dev parıltı ikonu artık beyaz değil, asil mat altın tonunda parlıyor */}
      <div className="absolute right-[-20px] bottom-[-20px] opacity-10 text-[#C5A880]">
        <Sparkles size={120} />
      </div>
      
      <h2 className="text-lg font-bold tracking-tight">Merhaba {name},</h2>
      
      {/* Yeşil yerine mat altın rengi (#C5A880) ile vurgulanan elit alt metin */}
      <p className="text-[#C5A880] text-xs font-semibold mt-0.5 tracking-wide">bugün harika bir gün!</p>
      
      <p className="text-[11px] text-slate-300 italic mt-4 leading-relaxed border-t border-white/10 pt-3">
        "Disiplin, hedefler ile başarı arasındaki köprüdür. Bugün o köprüyü inşa etmeye devam et."
      </p>
    </div>
  );
}