"use client";

import React from "react";

export default function ClientProfileCard({ client }) {
  return (
    <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl h-fit">
      <div className="flex flex-col items-center text-center space-y-3">
        <img
          src={
            client.avatar ||
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
          }
          alt={client.first_name}
          className="w-24 h-24 rounded-full object-cover border-2 border-[#EA580C] p-1 bg-slate-950"
        />
        <div>
          <h3 className="text-lg font-black text-white">
            {client.first_name} {client.last_name}
          </h3>
          <p className="text-xs text-slate-400">{client.email}</p>
        </div>
        <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
          {client.active_package || "Aylık PT Danışmanlığı"}
        </span>
      </div>

      <div className="space-y-3 border-t border-b border-slate-800 py-4 text-xs font-medium text-slate-300">
        <div className="flex justify-between">
          <span className="text-slate-500">Yaş / Cinsiyet:</span>
          <span className="text-white font-bold">
            {client.age || 23} / {client.gender || "Erkek"}
          </span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Boy:</span>
          <span className="text-white font-bold">{client.height || 182} cm</span>
        </div>
        <div className="flex justify-between">
          <span className="text-slate-500">Mevcut Program:</span>
          <span className="text-emerald-400 font-bold truncate max-w-[140px]">
            {client.program_name || "Henüz Program Atanmadı"}
          </span>
        </div>
      </div>
    </div>
  );
}