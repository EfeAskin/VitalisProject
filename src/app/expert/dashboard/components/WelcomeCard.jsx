import React from 'react';
import { ShieldCheck, Sparkles } from 'lucide-react';

export default function WelcomeCard({ user }) {
  const name = user?.name || "Uzman";
  const roleTitle = user?.role === 'dietitian' ? "Uzman Diyetisyen" : "Kıdemli Baş Antrenör & Koç";
  
  return (
    <div className="relative bg-gradient-to-r from-[#171c48] via-[#11142D] to-[#1c183d] border border-orange-500/40 rounded-3xl p-6 backdrop-blur-2xl shadow-[0_0_30px_rgba(249,115,22,0.2)] overflow-hidden group hover:border-orange-500/70 transition-all duration-300">
      <div className="absolute -right-10 -top-10 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl group-hover:bg-orange-500/20 transition-all"></div>
      
      <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="px-3 py-0.5 bg-orange-500/15 border border-orange-500/40 text-orange-300 text-[10px] font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.2)]">
              <ShieldCheck className="w-3 h-3 text-orange-400" /> VITALIS EXPERT COMMAND
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Hoş Geldin, {name} <span className="animate-bounce">👋</span>
          </h1>
          <p className="text-xs text-slate-300 font-medium">
            {roleTitle} • Günlük danışan performans takibi aktif ve senkronize.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 rounded-2xl shadow-[0_0_15px_rgba(249,115,22,0.1)]">
          <Sparkles className="w-4 h-4 text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
          <span className="text-xs font-bold text-orange-300">Sistem Durumu: Mükemmel</span>
        </div>
      </div>
    </div>
  );
}