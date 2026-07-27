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
    <div className="bg-white rounded-2xl p-5 shadow-sm border border-slate-200/60 transition-all hover:shadow-md">
      {/* Üst Başlık ve İlerleme Sınırı */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between w-full">
          <span>Bugünkü Görevlerim</span>
          {/* 
            Badge Güncellemesi:
            - Klasik yeşil yerine Derin Zümrüt (#0A3A25) dolgulu, çok ince Mat Altın çerçeveli premium görünüm.
          */}
          <span className="text-[10px] bg-[#0A3A25]/5 text-[#0A3A25] px-2.5 py-0.5 rounded-full font-bold border border-[#0A3A25]/10">
            {completedCount}/{tasks.length} Tamamlandı
          </span>
        </h3>
      </div>

      {/* İlerleme Çubuğu Bölümü */}
      <div className="mb-4">
        <div className="flex justify-between items-center text-[11px] text-slate-500 font-semibold mb-1">
          <span>Günlük İlerleme Skoru</span>
          {/* Skor yüzdesi zümrüt rengi ile vurgulandı */}
          <span className="text-[#10B981] font-bold">%{progressPercent}</span>
        </div>
        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
          {/* 
            İlerleme Barı: 
            - Düz yeşil yerine Derin Zümrüt'ten (#0A3A25) Parlak Zümrüt Yeşiline (#10B981) akan yumuşak bir degrade geçişi.
          */}
          <div 
            className="bg-gradient-to-r from-[#0A3A25] to-[#10B981] h-full transition-all duration-500 rounded-full" 
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
              - Görevlerin üzerine gelindiğinde zümrüt yeşili yumuşak bir sınır çizgisi belirir.
              - Tamamlanmış olan görevlerin arka planı hafifçe soluklaşarak hiyerarşiyi korur.
            */
            className={`flex items-start gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent hover:border-[#10B981]/20 ${
              task.checked ? 'bg-slate-50/40 hover:bg-slate-50/60' : 'bg-white hover:bg-[#F8FAF8]'
            }`}
          >
            {/* Durum İkonu */}
            <div className="mt-0.5">
              {task.checked ? (
                /* Tamamlanan görev ikonu markamızın Zümrüt Yeşili (#10B981) renginde parlar */
                <CheckCircle2 size={18} className="text-[#10B981] flex-shrink-0" />
              ) : (
                /* Tamamlanmayan görev ikonu dairesi */
                <Circle size={18} className="text-slate-300 hover:text-[#10B981] transition-colors flex-shrink-0" />
              )}
            </div>
            
            {/* Görev İçeriği */}
            <div className="flex-1">
              <span className={`text-xs font-bold transition-all block ${
                task.checked ? 'line-through text-slate-400' : 'text-slate-700'
              }`}>
                {task.text}
              </span>
              
              {/* Öncelik Etiketleri */}
              <span className={`text-[9px] font-bold uppercase tracking-wider ${
                task.priority === 'Yüksek' ? 'text-rose-500' : task.priority === 'Orta' ? 'text-sky-500' : 'text-slate-400'
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
          - Sıradan sarı yerine Fildişi Beji (#FCFAF7) arka plan, Mat Altın (#C5A880) çerçeve.
          - Yazı rengi asil çikolata/altın tonu (#8C724D).
        */
        <div className="mt-4 p-3 bg-[#FCFAF7] border border-[#C5A880]/30 rounded-xl flex items-center gap-2.5 text-[#8C724D] text-[11px] font-bold animate-bounce shadow-xs">
          <Trophy size={16} className="text-[#C5A880] fill-[#C5A880] shrink-0" />
          Tebrikler! Bugünün tüm görevlerini kusursuz tamamladın!
        </div>
      )}
    </div>
  );
}