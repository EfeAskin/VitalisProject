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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
        Önerilen Profesyoneller
      </h3>
      
      <div className="space-y-4">
        {/* 
          Kart Tasarım Güncellemeleri:
          - Kartın üzerine gelindiğinde (hover) zümrüt yeşili çok ince bir kenarlık belirir.
          - Arka plan düz gri yerine hafif saydamlaştırılmış fildişi tonuna geçiş yapar.
        */}
        <div className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 flex items-center justify-between transition-all hover:border-[#10B981]/25 hover:bg-white group">
          <div className="flex items-center gap-2.5">
            {/* Avatar: Eski soluk gri yuvarlak yerine Derin Zümrüt (#0A3A25) arka plan üzerine asil Mat Altın (#C5A880) harfler */}
            <div className="w-8 h-8 rounded-full bg-[#0A3A25] flex items-center justify-center text-xs font-bold text-[#C5A880] shadow-sm shadow-[#0A3A25]/10 transition-transform group-hover:scale-105">
              MK
            </div>
            
            <div>
              {/* İsim: Kartın üzerine gelindiğinde zümrüt rengine yumuşakça dönen yazı */}
              <h4 className="text-xs font-bold text-slate-900 transition-colors duration-300 group-hover:text-[#0A3A25]">
                Melis Kaya
              </h4>
              
              <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
                {/* Diyetisyen etiketi zümrüt yeşili renge büründürüldü */}
                <span className="text-[#10B981] font-semibold">Diyetisyen</span> • 
                {/* Yıldız ve Puanlama alanı artık premium Mat Altın renginde parlıyor */}
                <span className="text-[#C5A880] flex items-center gap-0.5 font-bold">
                  <Star size={10} fill="currentColor" className="text-[#C5A880]" /> 4.9
                </span>
              </p>
            </div>
          </div>

          {/* 
            Buton Tasarım Güncellemeleri:
            - Klasik gri border yerine, hover olunduğunda sınır çizgileri ve yazı rengi Zümrüt Yeşiline (#10B981) bürünür.
            - Mobil dokunmatik hassasiyeti için hafifçe dikey genişlik (py-1.5) kazandırıldı ve active:scale-95 tık efekti eklendi.
          */}
          <button className="text-[10px] bg-white border border-slate-200 hover:border-[#10B981] hover:text-[#10B981] active:scale-95 font-bold px-2.5 py-1.5 rounded-lg transition-all shadow-xs">
            Profili İncele
          </button>
        </div>
      </div>
    </div>
  );
}