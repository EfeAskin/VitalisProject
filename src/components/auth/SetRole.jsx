"use client";
import React from 'react';

export default function SetRole({ setView }) {
  return (
    <div className="bg-[#EAEAEA]/95 backdrop-blur-md rounded-[2.5rem] p-10 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.6)] border border-white/20 text-center">
      <h1 className="text-[21px] font-black tracking-wider text-[#1c1c1c] mb-12 uppercase">
        WELCOME TO <span className="text-[#00A859]">VITALIS</span><span className="text-[#0052B4]">-</span><span className="text-[#A80000]">OS</span>
      </h1>
      
      <div className="space-y-4 max-w-[260px] mx-auto">
        <button 
          onClick={() => setView('client-login')}
          className="w-full bg-[#00A859] hover:bg-[#00944f] text-white text-xs font-extrabold py-4 px-6 rounded-full tracking-widest uppercase transition-all shadow-md active:scale-95"
        >
          Client
        </button>
        <button 
          onClick={() => setView('admin-login')}
          className="w-full bg-[#A80000] hover:bg-[#8d0000] text-white text-xs font-extrabold py-4 px-6 rounded-full tracking-widest uppercase transition-all shadow-md active:scale-95"
        >
          Professional
        </button>
      </div>
    </div>
  );
}