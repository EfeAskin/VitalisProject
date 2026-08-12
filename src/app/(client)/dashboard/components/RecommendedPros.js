"use client";
import React from 'react';
import { Star } from 'lucide-react';

export default function RecommendedPros() {
  // --- NEON DB / API ENTEGRASYON REHBERİ ---
  // Yarın 'professionals' ya da 'experts' tablonuzdan verileri çekip buraya bağlamak istersen,
  // bu mock yapıyı bir useState/useEffect döngüsüne alıp .map() ile listeleyebilirsin.
  /*
  const [pros, setPros] = React.useState([
    { id: 1, name: "Melis Kaya", role: "Diyetisyen", rating: 4.9, initials: "MK" }
  ]);
  */

  return (
    <div className="bg-[#0E1E17]/90 backdrop-blur-xl rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-emerald-500/35 hover:border-amber-400/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-300">
      <h3 className="text-xs font-black uppercase tracking-wider text-emerald-400 mb-4 drop-shadow-[0_0_10px_rgba(16,185,129,0.6)]">
        Önerilen Profesyoneller
      </h3>
      
      <div className="space-y-4">
        {/* 
          Kart Tasarım Güncellemeleri:
          - Kartın üzerine gelindiğinde (hover) kehribar altın neon kenarlık ve gölge belirir.
          - Arka plan derin obsidyen zeminine geçiş yapar.
        */}
        <div className="p-3.5 bg-[#07130D]/90 rounded-2xl border border-emerald-500/25 flex items-center justify-between transition-all duration-300 hover:border-amber-400/50 hover:bg-[#07130D] hover:shadow-[0_0_20px_rgba(245,158,11,0.2)] group">
          <div className="flex items-center gap-3">
            {/* Avatar: Parlak kehribar/zümrüt gradyan çember, altın harfler ve neon ışıltı */}
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-amber-500/20 to-emerald-500/20 border border-amber-400/50 flex items-center justify-center text-xs font-black text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.3)] transition-transform duration-300 group-hover:scale-110">
              MK
            </div>
            
            <div>
              {/* İsim: Projeksiyonda ultra net okunabilir yüksek kontrast metin */}
              <h4 className="text-xs font-black text-white transition-colors duration-300 group-hover:text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
                Melis Kaya
              </h4>
              
              <p className="text-[10px] text-emerald-200/70 flex items-center gap-1.5 mt-0.5 font-bold">
                {/* Diyetisyen etiketi parlayan zümrüt yeşili renge büründürüldü */}
                <span className="text-emerald-400 font-extrabold drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]">Diyetisyen</span> • 
                {/* Yıldız ve Puanlama alanı neon Mat Altın renginde parlıyor */}
                <span className="text-amber-400 flex items-center gap-0.5 font-black drop-shadow-[0_0_6px_rgba(245,158,11,0.6)]">
                  <Star size={11} fill="currentColor" className="text-amber-400" /> 4.9
                </span>
              </p>
            </div>
          </div>

          {/* 
            Buton Tasarım Güncellemeleri:
            - Neon zümrüt gradyanı, parlama efekti ve active:scale-95 dokunmatik hissiyatı.
          */}
          <button className="text-[10px] bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white border border-emerald-300/30 active:scale-95 font-black px-3 py-2 rounded-xl transition-all duration-300 shadow-[0_0_12px_rgba(16,185,129,0.3)] hover:shadow-[0_0_18px_rgba(16,185,129,0.5)] cursor-pointer">
            Profili İncele
          </button>
        </div>
      </div>
    </div>
  );
}