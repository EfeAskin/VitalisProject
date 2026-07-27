"use client";

import React from "react";
import { Sparkles, UserCheck, ExternalLink } from "lucide-react";

export default function DietHeroHeader({ profile, onOpenDietitianNotice }) {
  return (
    <div className="p-8 rounded-3xl bg-gradient-to-br from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/20 shadow-2xl relative overflow-hidden">
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="text-[10px] font-black tracking-widest text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/30 uppercase">
              BİYOMETRİK DİYET PROTOKOLÜ
            </span>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-yellow-500" /> AKILLI METABOLİZMA MOTORU
            </span>
          </div>
          <h3 className="text-3xl font-black text-white tracking-tight">
            Beslenme & Kalori Yönetimi
          </h3>
          <p className="text-slate-400 text-xs mt-2 max-w-xl leading-relaxed">
            Biyometrik verilerine göre hesaplanmış makro hedeflerini takip et, 1 porsiyon besin kalorilerini sorgula veya onaylı diyetisyeninden sana özel reçete talep et.
          </p>
        </div>

        {/* Diyetisyen İle Çalış CTA Kartı */}
        <div className="bg-slate-900/90 border border-emerald-500/30 p-5 rounded-2xl backdrop-blur-md w-full lg:w-auto min-w-[280px]">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/30">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-white">UZMAN DİYETİSYEN DESTEĞİ</p>
              <p className="text-[10px] text-emerald-400 font-semibold">Birebir Özel Beslenme Reçetesi</p>
            </div>
          </div>
          <p className="text-[11px] text-slate-400 mb-4 leading-normal">
            Makro dengelerini kan tahliline özel %100 kişiselleştirmek için diyetisyen kiralayabilirsin.
          </p>
          <button 
            onClick={onOpenDietitianNotice}
            className="w-full py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-black text-xs rounded-xl tracking-wider transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            <span>DİYETİSYEN SEÇ & BİREBİR BAŞLA</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Biyometrik Profil Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">BOY</span>
          <span className="text-lg font-black text-white">{profile.height} cm</span>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">GÜNCEL KİLO</span>
          <span className="text-lg font-black text-emerald-400">{profile.weight} kg</span>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">CİNSİYET</span>
          <span className="text-lg font-black text-white">{profile.gender}</span>
        </div>
        <div className="bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">ANA HEDEF</span>
          <span className="text-xs font-black text-yellow-500 truncate block mt-1">{profile.goal}</span>
        </div>
      </div>
    </div>
  );
}