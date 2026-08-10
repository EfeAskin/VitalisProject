"use client";
import React from 'react';
import { Star, Award, Calendar, CheckCircle2, ArrowUpRight, Layers } from 'lucide-react';

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
    <div className="bg-white rounded-3xl p-5 border border-slate-200/70 hover:border-[#C5A880]/60 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
      
      <div>
        {/* Üst Rozet & Profil */}
        <div className="flex items-start gap-4 mb-4">
          <div className="relative">
            <img 
              src={avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=250"} 
              alt={name}
              className="w-16 h-16 rounded-2xl object-cover border-2 border-slate-100 group-hover:border-[#10B981] transition-all shadow-sm"
            />
            {verified && (
              <span className="absolute -bottom-1 -right-1 bg-[#0A3A25] text-[#C5A880] p-1 rounded-full border-2 border-white shadow-xs" title="Onaylı Uzman">
                <CheckCircle2 size={12} className="fill-[#0A3A25]" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1">
              <span className={`text-[9px] font-black uppercase px-2 py-0.5 rounded-md ${
                category === 'trainer' 
                  ? 'bg-emerald-50 text-[#0A3A25] border border-emerald-100' 
                  : 'bg-amber-50 text-[#8C724D] border border-amber-100'
              }`}>
                {category === 'trainer' ? 'Antrenör' : 'Diyetisyen'}
              </span>
              
              <div className="flex items-center gap-1 ml-auto bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100">
                <Star size={11} className="text-amber-400 fill-amber-400" />
                <span className="text-xs font-bold text-slate-800">{rating}</span>
                <span className="text-[10px] text-slate-400 font-medium">({reviewCount})</span>
              </div>
            </div>

            <h4 className="text-sm font-bold text-slate-900 group-hover:text-[#10B981] transition-colors truncate">
              {name}
            </h4>
            <p className="text-[11px] text-slate-500 font-medium truncate">{title}</p>
          </div>
        </div>

        {/* İstatistik Detayları */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-2xl bg-[#F8FAF8] border border-slate-100 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
            <Award size={13} className="text-[#C5A880]" />
            <span>{experienceYears || 5} Yıl Tecrübe</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium truncate">
            <Layers size={13} className="text-[#10B981]" />
            <span>{listings?.length || 0} Aktif Paket</span>
          </div>
        </div>

        {/* Uzmanlık Etiketleri */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specialties?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] font-bold text-slate-500 bg-slate-100 px-2.5 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Fiyat ve İncele Butonu */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div>
          <span className="text-[9px] text-slate-400 block font-bold uppercase">Başlangıç</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-slate-900">
              {minPrice > 0 ? `₺${minPrice.toLocaleString('tr-TR')}` : 'Teklif Alın'}
            </span>
            {minPrice > 0 && <span className="text-[10px] font-semibold text-slate-400">'den başlayan</span>}
          </div>
        </div>

        <button 
          onClick={() => onInspect && onInspect(expert)}
          className="bg-[#0A3A25] hover:bg-[#10B981] active:scale-95 text-white text-xs font-extrabold px-4 py-2.5 rounded-2xl transition-all shadow-sm flex items-center gap-1.5 border border-[#C5A880]/15"
        >
          <span>İncele</span>
          <ArrowUpRight size={14} className="text-[#C5A880]" />
        </button>
      </div>
    </div>
  );
}