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
    // Kartın etrafına zarif bir altın ışıltısı efekti (hover durumunda) ve geçiş yumuşaklığı eklendi
    <div className="bg-[#0c2310] text-white rounded-2xl p-5 shadow-sm border border-emerald-500/15 transition-all duration-300 hover:border-[#C5A880]/30 hover:shadow-md hover:shadow-emerald-950/20 group">
      
      <div className="flex items-center justify-between mb-4">
        {/* Rozet kenarlıkları daha belirgin ve premium hale getirildi */}
        <span className="text-[9px] bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
          Sıradaki Seans
        </span>
        {/* Calendar ikonu üzerine gelindiğinde Mat Altın rengine yumuşakça geçiş yapıyor */}
        <Calendar size={14} className="text-slate-400 transition-colors duration-300 group-hover:text-[#C5A880]" />
      </div>

      {/* Başlık - Hover durumunda hafif altın tonuna bürünen asil bir vurgu */}
      <h4 className="text-xs font-bold leading-tight transition-colors duration-300 group-hover:text-[#C5A880]/90">
        Beslenme Uzmanı Elif Yılmaz ile Online Görüşme
      </h4>

      {/* Zaman Bilgisi - Soluna küçük, canlı hissettiren yeşil bir sinyal ışığı eklendi */}
      <p className="text-[11px] text-slate-400 mt-1.5 flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Yarın, 14:00
      </p>

      {/* Katılım Butonu - Tıklama hissini artıran active:scale etkisi ve premium kenarlık eklendi */}
      <button 
        className="w-full mt-4 bg-[#00A859] hover:bg-[#00944f] active:scale-[0.98] text-white text-xs font-bold py-2.5 rounded-xl transition-all flex items-center justify-center gap-1.5 shadow-md shadow-emerald-900/40 border border-emerald-400/15"
        onClick={() => {
          // Yarın API'den gelen gerçek linke yönlendirmek için:
          // window.open(sessionData.meetingUrl, '_blank');
          console.log("Seansa katılma linki tetiklendi.");
        }}
      >
        <Video size={14} /> Görüşmeye Katıl (Zoom/Teams)
      </button>
    </div>
  );
}