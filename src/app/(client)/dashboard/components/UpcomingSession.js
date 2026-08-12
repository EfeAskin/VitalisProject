"use client";
import React from 'react';
import { Calendar, Video } from 'lucide-react';

export default function UpcomingSession() {
  // --- NEON DB / API ENTEGRASYON REHBERİ ---
  // İlerleyen aşamalarda sıradaki seans bilgisini (Uzman adı, Tarih/Saat, Katılım linki vb.)
  // veritabanından dinamik çekmek istersen (örn. useEffect veya Server Component prop'u ile),
  // bu component'e verileri state olarak bağlayabilirsin.
  /*
  const [sessionData, setSessionData] = React.useState({
    title: "Beslenme Uzmanı Elif Yılmaz ile Online Görüşme",
    time: "Yarın, 14:00",
    meetingUrl: "https://zoom.us/j/..."
  });
  */

  return (
    // Dış Kutu: Zümrüt Obsidyen zemin + Cam efekti + Neon ışıltılı kenarlık ve gölge
    <div className="bg-[#0E1E17]/90 backdrop-blur-xl text-white rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.6)] border border-emerald-500/35 hover:border-amber-400/60 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] group relative">
      
      {/* Üst Rozet ve Takvim İkonu */}
      <div className="flex items-center justify-between mb-4">
        {/* Parlak Kehribar/Altın Neon Rozet */}
        <span className="text-[9px] bg-amber-500/20 text-amber-300 border border-amber-400/40 font-black px-2.5 py-1 rounded-lg uppercase tracking-widest shadow-[0_0_10px_rgba(245,158,11,0.3)]">
          Sıradaki Seans
        </span>
        
        {/* Calendar İkonu - Hover durumunda asil altın parlaklığı */}
        <Calendar size={16} className="text-emerald-300/60 transition-colors duration-300 group-hover:text-amber-300 group-hover:drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
      </div>

      {/* Başlık - Projeksiyonda Net Okunabilir Yüksek Kontrast Tipografi */}
      <h4 className="text-xs font-black leading-snug tracking-wide text-white transition-colors duration-300 group-hover:text-amber-200 drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
        Beslenme Uzmanı Elif Yılmaz ile Online Görüşme
      </h4>

      {/* Zaman Bilgisi & Neon Sinyal Işığı */}
      <p className="text-[11px] text-emerald-300/90 font-extrabold mt-2 flex items-center gap-2 tracking-wide">
        <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10B981] animate-pulse" />
        Yarın, 14:00
      </p>

      {/* Katılım Butonu - Neon Gradient & Parlama Efekti */}
      <button 
        className="w-full mt-4 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 hover:from-emerald-400 hover:to-teal-400 active:scale-[0.98] text-white text-xs font-black py-3 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.35)] hover:shadow-[0_0_25px_rgba(16,185,129,0.6)] border border-emerald-300/30 cursor-pointer"
        onClick={() => {
          // Yarın API'den gelen gerçek linke yönlendirmek için:
          // window.open(sessionData.meetingUrl, '_blank');
          console.log("Seansa katılma linki tetiklendi.");
        }}
      >
        <Video size={15} className="drop-shadow-[0_0_4px_rgba(255,255,255,0.8)]" /> 
        Görüşmeye Katıl (Zoom/Teams)
      </button>
    </div>
  );
}