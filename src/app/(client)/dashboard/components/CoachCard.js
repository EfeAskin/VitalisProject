"use client";
import React from 'react';
import { MessageSquare } from 'lucide-react';

export default function CoachCard() {
  return (
    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200/60 flex items-center justify-between transition-all hover:shadow-md">
      {/* Sol Alan: Koç Profil Bilgileri */}
      <div className="flex items-center gap-3">
        {/* 
          Koç Avatar Güncellemesi:
          - bg-slate-900 yerine Derin Zümrüt Yeşili (#0A3A25) taban.
          - text-emerald-400 yerine asil parıltısıyla Mat Altın (#C5A880) harfler ve çok ince altın kenarlık.
        */}
        <div className="w-10 h-10 rounded-full bg-[#0A3A25] text-[#C5A880] flex items-center justify-center font-bold text-sm shadow-inner border border-[#C5A880]/20">
          AŞ
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-900">Arda Şen</h4>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">Aktif Programda</p>
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
        className="flex items-center gap-1 bg-[#0A3A25]/10 text-[#0A3A25] px-3 py-1.5 rounded-xl text-xs font-bold hover:bg-[#0A3A25] hover:text-white active:scale-95 transition-all border border-[#0A3A25]/5"
      >
        <MessageSquare size={12} /> Chat
      </button>
    </div>
  );
}