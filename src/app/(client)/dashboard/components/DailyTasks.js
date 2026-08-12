"use client";
import React from 'react';
import { CheckCircle2, Circle, Trophy } from 'lucide-react';

export default function DailyTasks({ tasks, setTasks }) {
  // Görev durumunu tersine çeviren ana fonksiyon - Orijinal mantık birebir korundu
  const toggleTask = (id) => {
    // --- FASTAPI & NEON DB ENTEGRASYON REHBERİ ---
    // Yarın kullanıcının görev durumunu veri tabanına kaydetmek istersen:
    // 1. Bu fonksiyonu 'async' yap.
    // 2. toggle yapmadan önce backend API'ye istek at:
    //    await fetch(`http://localhost:8000/api/tasks/${id}/toggle`, { method: 'PATCH' });
    // 3. Ardından aşağıdaki arayüz state güncellemesini çalıştır.
    setTasks(prev => prev.map(t => t.id === id ? { ...t, checked: !t.checked } : t));
  };

  const completedCount = tasks.filter(t => t.checked).length;
  const progressPercent = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    /* 
      Dış Kapsayıcı:
      - #11142D (Lacivert) arka plandan kolaylıkla ayrılan Kristal Beyaz zemin (bg-white/95).
      - Neon Zümrüt border (border-emerald-500/30) ve hover durumunda Kehribar/Altın ışıltısı.
      - En kötü projeksiyonda dahi kolayca fark edilebilir yüksek kontrastlı gölgelendirme.
    */
    <div className="bg-white/95 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-emerald-500/30 hover:border-amber-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.2)] relative">
      {/* Üst Başlık ve İlerleme Sınırı */}
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center justify-between w-full">
          <span>Bugünkü Görevlerim</span>
          {/* 
            Badge Güncellemesi:
            - Derin Obsidyen/Zümrüt dolgulu, Neon Zümrüt çerçeveli ve Altın dokunuşlu lüks görünüm.
          */}
          <span className="text-[10px] bg-emerald-950 text-emerald-300 px-3 py-1 rounded-full font-black border border-emerald-500/40 shadow-xs tracking-wider">
            {completedCount}/{tasks.length} Tamamlandı
          </span>
        </h3>
      </div>

      {/* İlerleme Çubuğu Bölümü */}
      <div className="mb-5 bg-slate-50/90 p-3.5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex justify-between items-center text-[11px] text-slate-800 font-extrabold mb-1.5">
          <span>Günlük İlerleme Skoru</span>
          {/* Skor yüzdesi Parlak Zümrüt rengi ve neon gölge ile vurgulandı */}
          <span className="text-emerald-600 font-black tracking-tight text-xs drop-shadow-xs">%{progressPercent}</span>
        </div>
        <div className="w-full bg-slate-200/80 h-2.5 rounded-full overflow-hidden p-0.5 border border-slate-300/50">
          {/* 
            İlerleme Barı: 
            - Zümrüt Yeşili'nden Kehribar/Altın tonuna kayan neon degrade geçişi.
          */}
          <div 
            className="bg-gradient-to-r from-emerald-600 via-teal-500 to-amber-400 h-full transition-all duration-500 rounded-full shadow-[0_0_12px_rgba(16,185,129,0.5)]" 
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Görev Listesi */}
      <div className="space-y-3">
        {tasks.map(task => (
          <div 
            key={task.id} 
            onClick={() => toggleTask(task.id)}
            /* 
              Görev Kartı Hover Efekti:
              - Projeksiyon uyumlu Slate-50 zemin ve kenarlıklar.
              - Tamamlandığında Zümrüt dokulu yumuşak ton.
            */
            className={`flex items-start gap-3 p-3.5 rounded-2xl cursor-pointer transition-all border shadow-xs ${
              task.checked 
                ? 'bg-emerald-50/60 border-emerald-300/70 hover:bg-emerald-100/60' 
                : 'bg-slate-50/90 hover:bg-slate-100/90 border-slate-200/80 hover:border-emerald-500/40 hover:shadow-md'
            }`}
          >
            {/* Durum İkonu */}
            <div className="mt-0.5">
              {task.checked ? (
                /* Tamamlanan görev ikonu Zümrüt Yeşili renginde parlar */
                <CheckCircle2 size={19} className="text-emerald-600 fill-emerald-100 flex-shrink-0 drop-shadow-xs" />
              ) : (
                /* Tamamlanmayan görev ikonu dairesi */
                <Circle size={19} className="text-slate-400 hover:text-emerald-600 transition-colors flex-shrink-0" />
              )}
            </div>
            
            {/* Görev İçeriği */}
            <div className="flex-1 flex justify-between items-center gap-2">
              <span className={`text-xs font-black transition-all block tracking-tight ${
                task.checked ? 'line-through text-slate-400 font-bold' : 'text-slate-900'
              }`}>
                {task.text}
              </span>
              
              {/* Öncelik Etiketleri */}
              <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border flex-shrink-0 ${
                task.priority === 'Yüksek' 
                  ? 'text-rose-600 bg-rose-50 border-rose-200/80' 
                  : task.priority === 'Orta' 
                    ? 'text-amber-600 bg-amber-50 border-amber-200/80' 
                    : 'text-slate-600 bg-slate-100 border-slate-200/80'
              }`}>
                {task.priority} Öncelik
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Başarı Motivasyonu - Tebrik Kartı */}
      {progressPercent === 100 && (
        /* 
          Tebrik Kutusu:
          - Altın & Zümrüt Lüks Temalı Parlak Bej/Fildişi Kart.
        */
        <div className="mt-5 p-3.5 bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-amber-500/10 border border-amber-400/50 rounded-2xl flex items-center gap-3 text-amber-950 text-xs font-black animate-bounce shadow-md">
          <Trophy size={18} className="text-amber-500 fill-amber-400 shrink-0 drop-shadow-xs" />
          <span>Tebrikler! Bugünün tüm görevlerini kusursuz tamamladın!</span>
        </div>
      )}
    </div>
  );
}