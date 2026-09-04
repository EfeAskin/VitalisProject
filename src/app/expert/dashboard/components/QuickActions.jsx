import React from 'react';
import { Zap, Dumbbell, Apple, Send, Tag } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function QuickActions({ role }) {
  const router = useRouter();
  const isTrainer = role === 'trainer' || role === 'pt';

  return (
    <div className="relative bg-gradient-to-b from-[#171c48] to-[#11142D] border border-orange-500/30 backdrop-blur-2xl rounded-3xl p-6 shadow-[0_0_30px_rgba(249,115,22,0.15)] hover:border-orange-500/50 transition-all flex flex-col justify-between h-full">
      <div>
        <h3 className="text-xs font-black tracking-widest text-orange-300 uppercase mb-4 flex items-center gap-2 drop-shadow">
          <Zap className="w-4 h-4 text-orange-400 animate-pulse" /> HIZLI YÖNETİM ARAÇLARI
        </h3>
        <div className="flex flex-col gap-3">
          {isTrainer ? (
            <button 
              /* Template Builder'a yönlendirir */
              onClick={() => router.push('/expert/workout-templates')}
              className="p-3 bg-[#121633] border border-orange-500/30 hover:border-orange-500 rounded-2xl text-left hover:bg-orange-500/10 transition-all group shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer"
            >
              <Dumbbell className="w-4 h-4 text-amber-400 mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black text-white">Yeni Antrenman Ata</p>
              <p className="text-[10px] text-slate-400 font-medium">Danışan programını yapılandır.</p>
            </button>
          ) : (
            <button 
              /* Diyet Şablonlarına yönlendirir */
              onClick={() => router.push('/expert/diet-templates')}
              className="p-3 bg-[#121633] border border-emerald-500/30 hover:border-emerald-500 rounded-2xl text-left hover:bg-emerald-500/10 transition-all group shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer"
            >
              <Apple className="w-4 h-4 text-emerald-400 mb-1 group-hover:scale-110 transition-transform" />
              <p className="text-xs font-black text-white">Makro & Diyet Düzenle</p>
              <p className="text-[10px] text-slate-400 font-medium">Kalori ve besin hedeflerini güncelle.</p>
            </button>
          )}
          
          <button 
            /* Mesajlar/Sohbet sekmesine yönlendirir */
            onClick={() => router.push('/expert/chat')}
            className="p-3 bg-[#121633] border border-blue-500/30 hover:border-blue-500 rounded-2xl text-left hover:bg-blue-500/10 transition-all group shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer"
          >
            <Send className="w-4 h-4 text-blue-400 mb-1 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-black text-white">Toplu Duyuru Gönder</p>
            <p className="text-[10px] text-slate-400 font-medium">Tüm aktif danışanlara bildirim at.</p>
          </button>

          <button 
            /* Pazaryeri / Vitrin Yönetimine yönlendirir */
            onClick={() => router.push('/expert/marketplace?tab=showcase')}
            className="p-3 bg-[#121633] border border-purple-500/30 hover:border-purple-500 rounded-2xl text-left hover:bg-purple-500/10 transition-all group shadow-[0_0_15px_rgba(0,0,0,0.3)] cursor-pointer"
          >
            <Tag className="w-4 h-4 text-purple-400 mb-1 group-hover:scale-110 transition-transform" />
            <p className="text-xs font-black text-white">Paket & Fiyat Güncelle</p>
            <p className="text-[10px] text-slate-400 font-medium">Vitrin ücretlerini ve ilanlarını düzenle.</p>
          </button>
        </div>
      </div>
    </div>
  );
}