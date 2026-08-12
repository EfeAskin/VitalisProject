"use client";
import React from 'react';
import { Star, Award, CheckCircle2, ArrowUpRight, Layers, Sparkles } from 'lucide-react';

export default function ExpertCard({ expert, onInspect }) {
  const {
    name,
    title,
    category,
    avatarUrl,
    rating,
    reviewCount,
    experienceYears,
    minPrice,
    specialties,
    verified,
    listings
  } = expert;

  return (
    <div className="bg-gradient-to-b from-[#18231E] via-[#141C18] to-[#101713] rounded-3xl p-5 border border-emerald-500/30 hover:border-emerald-400/70 shadow-[0_0_25px_rgba(16,185,129,0.12)] hover:shadow-[0_0_35px_rgba(16,185,129,0.25)] transition-all duration-300 flex flex-col justify-between group relative overflow-hidden backdrop-blur-2xl">
      
      {/* Arka Plan Ambient Neon Işımaları */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none group-hover:bg-emerald-500/20 transition-all duration-300" />
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-amber-500/5 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10">
        {/* Üst Rozet & Profil */}
        <div className="flex items-start gap-3.5 mb-4">
          <div className="relative shrink-0">
            <img 
              src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} 
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-emerald-500/30 group-hover:border-amber-400/80 transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            />
            {verified && (
              <span className="absolute -bottom-1 -right-1 bg-emerald-500 text-black p-0.5 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.8)]" title="Onaylı Uzman">
                <CheckCircle2 size={12} className="fill-emerald-400 text-black" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md border flex items-center gap-1 shadow-sm ${
                category === 'trainer' 
                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30' 
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30'
              }`}>
                <Sparkles size={9} className={category === 'trainer' ? 'text-emerald-400' : 'text-amber-400 fill-amber-400'} />
                {category === 'trainer' ? 'Antrenör' : 'Diyetisyen'}
              </span>
              
              <div className="flex items-center gap-1 ml-auto bg-[#0D1410]/80 px-2 py-0.5 rounded-lg border border-amber-500/30 shadow-inner">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-black text-amber-300">{rating}</span>
                <span className="text-[10px] text-emerald-200/50 font-medium">({reviewCount})</span>
              </div>
            </div>

            <h4 className="text-sm font-black text-white group-hover:text-emerald-400 transition-colors truncate tracking-tight drop-shadow-[0_2px_8px_rgba(255,255,255,0.1)]">
              {name}
            </h4>
            <p className="text-[11px] text-emerald-100/70 font-medium truncate mt-0.5">{title}</p>
          </div>
        </div>

        {/* İstatistik Detayları */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-2xl bg-[#0D1410]/80 border border-emerald-500/20 text-[11px] shadow-inner">
          <div className="flex items-center gap-1.5 text-emerald-100/80 font-semibold truncate">
            <Award size={13} className="text-amber-400 shrink-0" />
            <span>{experienceYears || 5} Yıl Tecrübe</span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-100/80 font-semibold truncate">
            <Layers size={13} className="text-emerald-400 shrink-0" />
            <span>{listings?.length || 0} Aktif Paket</span>
          </div>
        </div>

        {/* Uzmanlık Etiketleri */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specialties?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] font-black text-amber-300 bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-lg shadow-[0_0_8px_rgba(251,191,36,0.08)]">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Fiyat ve İncele Butonu */}
      <div className="pt-3 border-t border-emerald-500/20 flex items-center justify-between gap-2 mt-auto relative z-10">
        <div>
          <span className="text-[9px] text-emerald-300/60 block font-black uppercase tracking-wider">Başlangıç</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-amber-300 drop-shadow-[0_0_8px_rgba(251,191,36,0.3)]">
              {minPrice > 0 ? `₺${minPrice.toLocaleString('tr-TR')}` : 'Teklif Alın'}
            </span>
            {minPrice > 0 && <span className="text-[9px] font-bold text-emerald-200/50">'den başlayan</span>}
          </div>
        </div>

        <button 
          onClick={() => onInspect && onInspect(expert)}
          className="bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-500 hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] active:scale-95 text-black text-xs font-black px-4 py-2 rounded-xl transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center gap-1 border border-emerald-300/40 cursor-pointer"
        >
          <span>İncele</span>
          <ArrowUpRight size={14} className="text-black stroke-[3]" />
        </button>
      </div>
    </div>
  );
}