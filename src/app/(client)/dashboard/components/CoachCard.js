"use client";
import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function CoachCard() {
  return (
    /* 
      Dış Kapsayıcı:
      - #11142D (Lacivert) arka plandan tam ayrışan Kristal Beyaz zemin (bg-white/95).
      - Neon Zümrüt border (border-emerald-500/30) ve hover durumunda Kehribar/Altın ışıltısı.
      - En kötü projeksiyonda dahi kolayca seçilebilir yüksek kontrastlı gölgelendirme.
    */
    <div className="bg-white/95 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-emerald-500/30 hover:border-amber-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-between relative">
      {/* Sol Alan: Koç Profil Bilgileri */}
      <div className="flex items-center gap-3.5">
        {/* 
          Koç Avatar Güncellemesi:
          - bg-slate-900 yerine Derin Zümrüt Yeşili (#0A3A25) ve Obsidyen tabanlı degrade.
          - Asil parıltısıyla Mat Kehribar/Altın (text-amber-300) harfler ve neon altın kenarlık.
        */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-amber-300 flex items-center justify-center font-black text-xs shadow-md border border-amber-400/40 tracking-wider flex-shrink-0">
          AŞ
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-950 tracking-tight drop-shadow-xs">Arda Şen</h4>
          <div className="flex items-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-black border border-emerald-200/80 tracking-wider uppercase">
              Aktif Programda
            </span>
          </div>
        </div>
      </div>

      {/* Sağ Alan: Chat Butonu */}
      <button 
        /* 
          --- FASTAPI CHAT ENTEGRASYON REHBERİ ---
          Yarın canlı mesajlaşma veya WebSocket tabanlı bir chat penceresi açmak istediğinde:
          1. Buraya bir onClick prop'u ekleyebilirsin: onClick={() => onOpenChat('arda_sen_id')}
          2. Veya bir state yardımıyla chat modalını görünür kılabilirsin.
        */
        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/30 cursor-pointer"
      >
        <MessageSquare size={13} className="text-amber-300 fill-amber-300/20" /> Chat
      </button>
    </div>
  );
}