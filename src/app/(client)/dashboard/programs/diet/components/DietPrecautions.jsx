"use client";

import React from "react";
import { ShieldAlert, CheckCircle2 } from "lucide-react";

export default function DietPrecautions() {
  return (
    <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-3xl p-6 md:p-8 space-y-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-black text-lg text-white">Dikkat Edilmesi Gereken Hususlar</h4>
          <p className="text-xs text-slate-400">Beslenme protokolünü uygularken kritik kurallar</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h6 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> İşlenmiş Şeker ve Katkı Maddeleri
          </h6>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Açlık krizlerini engellemek için paketli gıdalardan uzak durulmalı, tatlandırıcılar sınırlandırılmalıdır.
          </p>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h6 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Yemek Esnasında Sıvı Tüketimi
          </h6>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Mide asidini seyreltmemek adına yemeklerden 30 dk önce ve sonra bol su içilmesi önerilir.
          </p>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h6 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Uyku ve Elektrolit Dengesi
          </h6>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Günde en az 7 saat kaliteli uyku ve sodyum-potasyum dengesi için doğal kaya tuzu tercih edilmelidir.
          </p>
        </div>
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800">
          <h6 className="text-xs font-black text-emerald-400 flex items-center gap-1.5 mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Diyetisyen Onayı ve Alerjenler
          </h6>
          <p className="text-[11px] text-slate-400 leading-relaxed">
            Gıda alerjiniz veya kronik rahatsızlığınız varsa diyetisyeninize bildirmeden değişim yapmayınız.
          </p>
        </div>
      </div>
    </div>
  );
}