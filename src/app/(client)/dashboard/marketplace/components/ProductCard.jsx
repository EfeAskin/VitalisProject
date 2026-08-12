"use client";
import React from 'react';
import { Star, ExternalLink, ShoppingBag, Zap } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    title,
    brand,
    imageUrl,
    rating,
    price,
    oldPrice,
    externalUrl,
    isPopular
  } = product;

  return (
    <div className="bg-gradient-to-b from-[#221D17] via-[#1C1814] to-[#171410] rounded-3xl p-4 border border-amber-500/30 hover:border-amber-400/70 shadow-[0_0_20px_rgba(245,158,11,0.08)] hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-300 flex flex-col justify-between group relative backdrop-blur-xl">
      
      <div>
        {/* Ürün Görseli Kutusu */}
        <div className="relative w-full h-44 rounded-2xl bg-[#0F0D0B] overflow-hidden mb-3 border border-amber-500/20 flex items-center justify-center p-3 group-hover:border-amber-500/40 transition-colors">
          {/* Arka Plan Lüks Neon Işıma Efekti */}
          <div className="absolute inset-0 bg-gradient-to-tr from-amber-500/10 via-transparent to-emerald-500/5 opacity-50 group-hover:opacity-100 transition-opacity pointer-events-none" />

          <img 
            src={imageUrl || "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=300"} 
            alt={title}
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300 relative z-10 filter drop-shadow-[0_10px_15px_rgba(0,0,0,0.5)]"
          />
          
          {isPopular && (
            <span className="absolute top-2 left-2 z-20 bg-gradient-to-r from-amber-500 to-yellow-500 text-black text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-amber-300/40 shadow-[0_0_10px_rgba(245,158,11,0.4)]">
              <Zap size={10} className="fill-black text-black" /> Çok Satan
            </span>
          )}

          <div className="absolute top-2 right-2 z-20 bg-[#1A1612]/80 backdrop-blur-md px-2 py-0.5 rounded-lg border border-amber-500/30 flex items-center gap-1 shadow-[0_0_10px_rgba(0,0,0,0.3)]">
            <Star size={11} className="text-amber-400 fill-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.5)]" />
            <span className="text-[11px] font-black text-amber-300">{rating}</span>
          </div>
        </div>

        {/* Marka ve Başlık */}
        <span className="text-[10px] font-black uppercase tracking-widest text-amber-400/90 block mb-1 drop-shadow-[0_0_6px_rgba(245,158,11,0.2)]">
          {brand}
        </span>
        <h4 className="text-xs font-bold text-slate-100 group-hover:text-amber-300 transition-colors line-clamp-2 min-h-[32px] mb-2 leading-relaxed">
          {title}
        </h4>
      </div>

      {/* Fiyat ve Satın Al */}
      <div className="pt-3 border-t border-amber-500/20 flex items-center justify-between gap-2 mt-auto">
        <div>
          {oldPrice && (
            <span className="text-[10px] text-slate-400 line-through block font-medium">
              ₺{oldPrice.toLocaleString('tr-TR')}
            </span>
          )}
          <span className="text-base font-black text-amber-300 drop-shadow-[0_0_8px_rgba(245,158,11,0.25)]">
            ₺{price?.toLocaleString('tr-TR')}
          </span>
        </div>

        <a 
          href={externalUrl || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-500 hover:brightness-110 active:scale-95 text-black text-xs font-black px-3.5 py-2.5 rounded-2xl transition-all shadow-[0_0_15px_rgba(245,158,11,0.3)] hover:shadow-[0_0_22px_rgba(245,158,11,0.5)] flex items-center gap-1.5"
        >
          <ShoppingBag size={13} className="text-black fill-black/20" />
          <span>Satın Al</span>
          <ExternalLink size={11} className="opacity-80 stroke-[2.5]" />
        </a>
      </div>
    </div>
  );
}