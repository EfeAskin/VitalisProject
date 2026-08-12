"use client";

import React from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function DietPrecautions() {
  return (
    <div className="lg:col-span-2 bg-rose-950/25 border border-rose-500/40 rounded-3xl p-6 md:p-8 space-y-4 backdrop-blur-2xl shadow-[0_0_35px_rgba(244,63,94,0.18)] hover:border-rose-400/70 hover:shadow-[0_0_45px_rgba(244,63,94,0.3)] transition-all duration-500">
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 rounded-2xl bg-rose-500/20 text-rose-400 flex items-center justify-center border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
          <ShieldAlert className="w-6 h-6 drop-shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
        </div>
        <div>
          <h4 className="font-black text-lg text-white tracking-wide">Dikkat Edilmesi Gereken Hususlar</h4>
          <p className="text-xs text-rose-100/70 font-medium">Beslenme protokolünü uygularken kritik kurallar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-2">
        <div className="bg-[#11142D]/80 p-4.5 rounded-2xl border border-rose-500/25 backdrop-blur-md shadow-inner hover:border-rose-400/50 transition-all duration-300">
          <h6 className="text-xs font-black text-rose-300 flex items-center gap-2 mb-1.5 tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.8)]" /> İşlenmiş Şeker ve Katkı Maddeleri
          </h6>
          <p className="text-[11px] text-rose-100/70 leading-relaxed font-medium">
            Açlık krizlerini engellemek için paketli gıdalardan uzak durulmalı, tatlandırıcılar sınırlandırılmalıdır.
          </p>
        </div>
        <div className="bg-[#11142D]/80 p-4.5 rounded-2xl border border-rose-500/25 backdrop-blur-md shadow-inner hover:border-rose-400/50 transition-all duration-300">
          <h6 className="text-xs font-black text-rose-300 flex items-center gap-2 mb-1.5 tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.8)]" /> Yemek Esnasında Sıvı Tüketimi
          </h6>
          <p className="text-[11px] text-rose-100/70 leading-relaxed font-medium">
            Mide asidini seyreltmemek adına yemeklerden 30 dk önce ve sonra bol su içilmesi önerilir.
          </p>
        </div>
        <div className="bg-[#11142D]/80 p-4.5 rounded-2xl border border-rose-500/25 backdrop-blur-md shadow-inner hover:border-rose-400/50 transition-all duration-300">
          <h6 className="text-xs font-black text-rose-300 flex items-center gap-2 mb-1.5 tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.8)]" /> Uyku ve Elektrolit Dengesi
          </h6>
          <p className="text-[11px] text-rose-100/70 leading-relaxed font-medium">
            Günde en az 7 saat kaliteli uyku ve sodyum-potasyum dengesi için doğal kaya tuzu tercih edilmelidir.
          </p>
        </div>
        <div className="bg-[#11142D]/80 p-4.5 rounded-2xl border border-rose-500/25 backdrop-blur-md shadow-inner hover:border-rose-400/50 transition-all duration-300">
          <h6 className="text-xs font-black text-rose-300 flex items-center gap-2 mb-1.5 tracking-wide">
            <CheckCircle2 className="w-4 h-4 text-rose-400 drop-shadow-[0_0_6px_rgba(251,113,133,0.8)]" /> Diyetisyen Onayı ve Alerjenler
          </h6>
          <p className="text-[11px] text-rose-100/70 leading-relaxed font-medium">
            Gıda alerjiniz veya kronik rahatsızlığınız varsa diyetisyeninize bildirmeden değişim yapmayınız.
          </p>
        </div>
      </div>
    </div>
  );
}