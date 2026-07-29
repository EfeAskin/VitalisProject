"use client";

import React from "react";
import { Check, X, Clock, Mail, Phone, Ruler, Scale, UserCheck } from "lucide-react";

export default function NewRequests({ requests, onAccept, onReject }) {
  if (requests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <UserCheck size={32} />
        </div>
        <h3 className="text-lg font-bold text-white">Bekleyen Yeni Başvuru Yok</h3>
        <p className="text-xs text-slate-400">Danışanlar paket satın aldıklarında veya abone olduklarında buraya düşecekler.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {requests.map((req) => (
        <div
          key={req.id}
          className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl relative"
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-4">
              <img
                src={req.avatar}
                alt={req.first_name}
                className="w-14 h-14 rounded-2xl object-cover border border-slate-700 bg-slate-950"
              />
              <div>
                <h3 className="text-base font-black text-white">
                  {req.first_name} {req.last_name}
                </h3>
                <p className="text-xs text-slate-400">{req.requested_package}</p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-slate-500 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800">
              <Clock size={12} /> {req.request_date}
            </span>
          </div>

          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <p className="text-xs text-slate-300 italic">"{req.message}"</p>
            <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
              <span><strong>Yaş/Cins:</strong> {req.age} / {req.gender}</span>
              <span><strong>Boy:</strong> {req.height}cm</span>
              <span><strong>Kilo:</strong> {req.weight}kg</span>
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-slate-400 px-1">
            <span className="flex items-center gap-1"><Mail size={12} /> {req.email}</span>
            <span className="flex items-center gap-1"><Phone size={12} /> {req.phone}</span>
          </div>

          {/* Eylem Butonları */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => onReject(req.id)}
              className="py-3 bg-slate-800 hover:bg-rose-950/50 text-rose-400 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all border border-slate-700 hover:border-rose-800"
            >
              <X size={16} />
              <span>Başvuruyu Reddet</span>
            </button>

            <button
              onClick={() => onAccept(req)}
              className="py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-emerald-600/20"
            >
              <Check size={16} />
              <span>Kabul Et & Listeye Ekle</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}