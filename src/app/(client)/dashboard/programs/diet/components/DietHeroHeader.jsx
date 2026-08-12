"use client";

import React from "react";
import { Sparkles, UserCheck, ExternalLink } from "lucide-react";

export default function DietHeroHeader({ profile, onOpenDietitianNotice }) {
  return (
    <div className="p-8 rounded-[2rem] bg-emerald-950/25 border border-emerald-500/30 backdrop-blur-2xl shadow-[0_0_40px_rgba(16,185,129,0.15)] relative overflow-hidden transition-all duration-500 hover:border-emerald-500/50">
      {/* Dekoratif Glow Arka Plan */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8 relative z-10">
        <div>
          <div className="flex items-center gap-3 mb-3">
            <span className="text-[10px] font-black tracking-widest text-emerald-300 bg-emerald-500/20 px-3.5 py-1.5 rounded-full border border-emerald-500/40 uppercase shadow-[0_0_12px_rgba(16,185,129,0.3)]">
              BİYOMETRİK DİYET PROTOKOLÜ
            </span>
            <span className="text-[10px] font-black text-slate-300 flex items-center gap-1.5 uppercase tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400 drop-shadow-[0_0_6px_rgba(250,204,21,0.8)]" /> AKILLI MOTOR
            </span>
          </div>
          <h3 className="text-4xl font-black text-white tracking-tight drop-shadow-sm">
            Beslenme & Kalori Yönetimi
          </h3>
          <p className="text-emerald-100/70 text-xs mt-3 max-w-xl leading-relaxed font-medium">
            Biyometrik verilerine göre hesaplanmış makro hedeflerini takip et, 1 porsiyon besin kalorilerini sorgula veya onaylı diyetisyeninden sana özel reçete talep et.
          </p>
        </div>

        {/* Diyetisyen İle Çalış CTA Kartı */}
        <div className="bg-emerald-950/50 border border-emerald-500/40 p-6 rounded-3xl backdrop-blur-xl w-full lg:w-auto min-w-[300px] shadow-[0_0_30px_rgba(16,185,129,0.1)] hover:shadow-[0_0_40px_rgba(16,185,129,0.2)] transition-all">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <UserCheck className="w-6 h-6 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
            </div>
            <div>
              <p className="text-[11px] font-black text-white tracking-widest">UZMAN DİYETİSYEN DESTEĞİ</p>
              <p className="text-[10px] text-emerald-300 font-bold uppercase">Birebir Özel Beslenme Reçetesi</p>
            </div>
          </div>
          <p className="text-[11px] text-emerald-100/70 mb-5 leading-relaxed font-medium">
            Makro dengelerini kan tahliline özel %100 kişiselleştirmek için diyetisyen kiralayabilirsin.
          </p>
          <button 
            onClick={onOpenDietitianNotice}
            className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black text-[11px] rounded-xl tracking-widest transition-all shadow-[0_0_20px_rgba(16,185,129,0.4)] hover:shadow-[0_0_30px_rgba(16,185,129,0.6)] flex items-center justify-center gap-2"
          >
            <span>DİYETİSYEN SEÇ & BİREBİR BAŞLA</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Biyometrik Profil Kartları */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-emerald-500/20">
        <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-emerald-500/10 backdrop-blur-md">
          <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-1">BOY</span>
          <span className="text-lg font-black text-white">{profile.height} cm</span>
        </div>
        <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-emerald-500/10 backdrop-blur-md">
          <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-1">GÜNCEL KİLO</span>
          <span className="text-lg font-black text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.4)]">{profile.weight} kg</span>
        </div>
        <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-emerald-500/10 backdrop-blur-md">
          <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-1">CİNSİYET</span>
          <span className="text-lg font-black text-white">{profile.gender}</span>
        </div>
        <div className="bg-[#11142D]/50 p-4 rounded-2xl border border-emerald-500/10 backdrop-blur-md">
          <span className="text-[10px] font-black text-emerald-400/60 uppercase tracking-widest block mb-1">ANA HEDEF</span>
          <span className="text-xs font-black text-yellow-400 truncate block mt-1 drop-shadow-[0_0_8px_rgba(250,204,21,0.3)]">{profile.goal}</span>
        </div>
      </div>
    </div>
  );
}