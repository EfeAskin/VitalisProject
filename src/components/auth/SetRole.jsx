"use client";
import React from 'react';

export default function SetRole({ setView }) {
  return (
    <div className="bg-[#16161C] border border-[#D4AF37]/30 rounded-[2.5rem] p-10 shadow-[0_25px_60px_rgba(0,0,0,0.8)] backdrop-blur-2xl text-center relative overflow-hidden">
      {/* Arka Plan Işıltı Efekti */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-[#D4AF37]/10 blur-[100px] pointer-events-none"></div>

      <h1 className="text-[21px] font-black tracking-wider text-white mb-12 uppercase relative z-10">
        <span className="text-[#D4AF37]">VITALIS</span>-<span className="text-emerald-400">OS</span>&apos;E HOŞ GELDİNİZ
      </h1>
      
      <div className="space-y-4 max-w-[280px] mx-auto relative z-10">
        <button 
          onClick={() => setView('client-login')}
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 text-xs font-black py-4 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] active:scale-95 border border-emerald-400/40"
        >
          DANIŞAN GİRİŞİ
        </button>
        <button 
          onClick={() => setView('admin-login')}
          className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-[#E5BF47] hover:to-amber-500 text-slate-950 text-xs font-black py-4 px-6 rounded-2xl tracking-[0.2em] uppercase transition-all shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 border border-amber-400/40"
        >
          UZMAN GİRİŞİ
        </button>
      </div>
    </div>
  );
}