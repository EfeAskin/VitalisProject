"use client";

import React from "react";
import { User, Mail, Calendar, Ruler, Activity, CheckCircle2, Dumbbell } from "lucide-react";

export default function ClientProfileCard({ client }) {
  // Çoklu program desteği için düzleştirme ve benzersizleştirme
  const rawProgs = client.assigned_programs || client.programs || client.program_name || [];
  const programs = Array.from(
    new Set(
      (Array.isArray(rawProgs) ? rawProgs : [rawProgs])
        .flat(Infinity)
        .map((p) => {
          if (typeof p === "string") return p.trim();
          if (p && typeof p === "object") return (p.name || p.program_name || "").trim();
          return "";
        })
        .filter((p) => p && p !== "Henüz Program Atanmadı")
    )
  );

  return (
    <div className="lg:col-span-1 relative overflow-hidden bg-[#11142D]/95 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_0_35px_rgba(79,70,229,0.15)] space-y-6 h-fit transition-all duration-300">
      {/* PROFİL HEADER & AVATAR */}
      <div className="flex flex-col items-center text-center space-y-4">
        <div className="relative group">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-orange-500 to-amber-500 rounded-full blur opacity-50 group-hover:opacity-85 transition duration-300"></div>
          <img
            src={
              client.avatar ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
            }
            alt={client.first_name}
            className="relative w-24 h-24 rounded-full object-cover border-2 border-slate-700 p-1 bg-slate-950 shadow-inner"
          />
        </div>

        <div className="space-y-1 w-full">
          <h3 className="text-xl font-heading font-black text-white tracking-tight truncate drop-shadow-md">
            {client.first_name} {client.last_name}
          </h3>
          <div className="flex items-center justify-center gap-1.5 text-xs text-slate-300 font-medium truncate px-2">
            <Mail className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
            <span className="truncate">{client.email}</span>
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 text-[10px] font-heading font-black uppercase tracking-widest text-emerald-300 bg-emerald-500/20 border border-emerald-400/40 px-3.5 py-1.5 rounded-full shadow-[0_0_15px_rgba(16,185,129,0.25)]">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-300" />
          <span>
            {Array.isArray(client.active_packages) && client.active_packages.length > 0
              ? client.active_packages.join(", ")
              : client.active_package || "Aylık PT Danışmanlığı"}
          </span>
        </span>
      </div>

      {/* DETAY BİLGİLERİ */}
      <div className="space-y-4 border-t border-b border-slate-700/70 py-5 text-xs font-medium text-slate-200">
        <div className="flex justify-between items-center">
          <span className="text-slate-300 font-medium flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>Yaş / Cinsiyet:</span>
          </span>
          <span className="text-white font-heading font-bold font-mono bg-[#11142D] px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-inner">
            {client.age || 23} / {client.gender || "Erkek"}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-slate-300 font-medium flex items-center gap-2">
            <Ruler className="w-3.5 h-3.5 text-slate-400" />
            <span>Boy:</span>
          </span>
          <span className="text-white font-heading font-bold font-mono bg-[#11142D] px-2.5 py-1 rounded-lg border border-slate-700/80 shadow-inner">
            {client.height || 182} cm
          </span>
        </div>

        <div className="space-y-2 pt-1">
          <span className="text-slate-300 font-medium flex items-center gap-2">
            <Dumbbell className="w-3.5 h-3.5 text-amber-400" />
            <span>Atanan Programlar:</span>
          </span>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {programs.length > 0 ? (
              programs.map((prog, idx) => (
                <span
                  key={idx}
                  className="text-[11px] font-heading font-bold text-amber-300 bg-amber-500/20 px-2.5 py-1 rounded-lg border border-amber-400/40 shadow-[0_0_10px_rgba(245,158,11,0.2)]"
                >
                  {prog}
                </span>
              ))
            ) : (
              <span className="text-xs text-slate-400 italic">
                Henüz Program Atanmadı
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}