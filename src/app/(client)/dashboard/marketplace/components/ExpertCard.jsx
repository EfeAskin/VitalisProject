"use client";
import React from 'react';
import { Star, Award, Calendar, CheckCircle2, ArrowUpRight } from 'lucide-react';

export default function ExpertCard({ expert, onBook }) {
  const {
    name,
    title,
    category, // 'trainer' | 'dietitian'
    avatarUrl,
    rating,
    reviewCount,
    experienceYears,
    monthlyPrice,
    weeklyPrice,
    specialties,
    verified
  } = expert;

  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200/70 hover:border-[#C5A880]/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
      
      {/* Üst Rozet & Görsel */}
      <div>
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
              <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
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

        {/* Tecrübe ve İstatistik Detayları */}
        <div className="grid grid-cols-2 gap-2 my-3 p-2.5 rounded-xl bg-[#F8FAF8] border border-slate-100 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Award size={13} className="text-[#C5A880]" />
            <span>{experienceYears} Yıl Tecrübe</span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-600 font-medium">
            <Calendar size={13} className="text-[#10B981]" />
            <span>Aktif Danışan</span>
          </div>
        </div>

        {/* Uzmanlık Etiketleri */}
        <div className="flex flex-wrap gap-1.5 mb-4">
          {specialties?.slice(0, 3).map((tag, idx) => (
            <span key={idx} className="text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      {/* Fiyat ve Randevu Butonu */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div>
          <span className="text-[9px] text-slate-400 block font-bold uppercase">Danışmanlık</span>
          <div className="flex items-baseline gap-1">
            <span className="text-base font-black text-slate-900">₺{monthlyPrice?.toLocaleString('tr-TR')}</span>
            <span className="text-[10px] font-semibold text-slate-400">/ Ay</span>
          </div>
        </div>

        <button 
          onClick={() => onBook && onBook(expert)}
          className="bg-[#0A3A25] hover:bg-[#10B981] active:scale-95 text-white text-xs font-bold px-3.5 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1 border border-[#C5A880]/15"
        >
          <span>İncele</span>
          <ArrowUpRight size={14} className="text-[#C5A880]" />
        </button>
      </div>
    </div>
  );
}