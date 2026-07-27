"use client";
import React from 'react';
import { Star, ExternalLink, ShoppingBag, Zap } from 'lucide-react';

export default function ProductCard({ product }) {
  const {
    title,
    brand,
    category,
    imageUrl,
    rating,
    reviewCount,
    price,
    oldPrice,
    externalUrl,
    inStock,
    isPopular
  } = product;

  return (
    <div className="bg-white rounded-2xl p-4 border border-slate-200/70 hover:border-[#10B981]/50 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col justify-between group relative">
      
      {/* Ürün Görseli & Etiketler */}
      <div>
        <div className="relative w-full h-44 rounded-xl bg-slate-50 overflow-hidden mb-3 border border-slate-100 flex items-center justify-center p-3">
          <img 
            src={imageUrl || "https://images.unsplash.com/photo-1579722821273-0f6c7d44362f?auto=format&fit=crop&q=80&w=300"} 
            alt={title}
            className="h-full object-contain group-hover:scale-105 transition-transform duration-300"
          />
          
          {isPopular && (
            <span className="absolute top-2 left-2 bg-[#0A3A25] text-[#C5A880] text-[9px] font-black uppercase px-2 py-0.5 rounded-md flex items-center gap-1 border border-[#C5A880]/20 shadow-xs">
              <Zap size={10} className="fill-[#C5A880]" /> Çok Satan
            </span>
          )}

          <div className="absolute top-2 right-2 bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-lg border border-slate-200/80 flex items-center gap-1 shadow-xs">
            <Star size={11} className="text-amber-400 fill-amber-400" />
            <span className="text-[11px] font-bold text-slate-800">{rating}</span>
          </div>
        </div>

        {/* Marka ve Başlık */}
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#8C724D] block mb-1">
          {brand}
        </span>
        <h4 className="text-xs font-bold text-slate-800 group-hover:text-[#10B981] transition-colors line-clamp-2 min-h-[32px] mb-2">
          {title}
        </h4>
      </div>

      {/* Fiyat ve E-Ticaret Aksiyonu */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2 mt-auto">
        <div>
          {oldPrice && (
            <span className="text-[10px] text-slate-400 line-through block font-medium">
              ₺{oldPrice.toLocaleString('tr-TR')}
            </span>
          )}
          <span className="text-base font-black text-slate-900">
            ₺{price.toLocaleString('tr-TR')}
          </span>
        </div>

        <a 
          href={externalUrl || "#"} 
          target="_blank" 
          rel="noopener noreferrer"
          className="bg-slate-900 hover:bg-[#0A3A25] active:scale-95 text-white text-xs font-bold px-3 py-2.5 rounded-xl transition-all shadow-sm flex items-center gap-1.5"
        >
          <ShoppingBag size={13} className="text-[#C5A880]" />
          <span>Satın Al</span>
          <ExternalLink size={11} className="opacity-60" />
        </a>
      </div>
    </div>
  );
}