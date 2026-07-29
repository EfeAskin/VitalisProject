"use client";

import React, { useState } from "react";
import { User, Phone, Ruler, Scale, Eye, X, ChevronRight, Target, Dumbbell } from "lucide-react";

export default function PtClientList({ clients, onSelectClient }) {
  const [selectedPopupClient, setSelectedPopupClient] = useState(null);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {clients.map((client) => (
          <div
            key={client.id}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 hover:border-slate-700 transition-all shadow-xl relative flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Profil Üst Başlığı */}
              <div className="flex items-center gap-4">
                <img
                  src={client.avatar}
                  alt={client.first_name}
                  className="w-16 h-16 rounded-2xl object-cover border border-[#EA580C]/40 p-0.5 bg-slate-950"
                />
                <div>
                  <h3 className="text-lg font-black text-white">
                    {client.first_name} {client.last_name}
                  </h3>
                  <span className="text-[10px] font-extrabold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-md border border-emerald-500/20">
                    {client.active_package}
                  </span>
                </div>
              </div>

              {/* Amaç ve Takip Ettiği Program */}
              <div className="space-y-2 bg-slate-950 p-4 rounded-2xl border border-slate-800/80">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Target size={14} className="text-[#EA580C] shrink-0" />
                  <span className="font-bold text-slate-400">Amaç:</span>
                  <span className="text-white truncate font-medium">{client.goal}</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <Dumbbell size={14} className="text-amber-400 shrink-0" />
                  <span className="font-bold text-slate-400">Program:</span>
                  <span className="text-amber-400 font-medium truncate">{client.program_name}</span>
                </div>
              </div>
            </div>

            {/* Butonlar */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setSelectedPopupClient(client)}
                className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all"
              >
                <Eye size={14} />
                <span>Hızlı Detay</span>
              </button>

              <button
                onClick={() => onSelectClient(client.id)}
                className="px-3 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all shadow-md shadow-[#EA580C]/20"
              >
                <span>Dosyaya Git</span>
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* --- POPUP / MODAL (Yaş, Boy, Kilo, Cinsiyet, Telefon) --- */}
      {selectedPopupClient && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 space-y-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedPopupClient(null)}
              className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800 rounded-full"
            >
              <X size={16} />
            </button>

            <div className="flex items-center gap-4">
              <img
                src={selectedPopupClient.avatar}
                alt={selectedPopupClient.first_name}
                className="w-16 h-16 rounded-full object-cover border-2 border-[#EA580C]"
              />
              <div>
                <h3 className="text-xl font-black text-white">
                  {selectedPopupClient.first_name} {selectedPopupClient.last_name}
                </h3>
                <p className="text-xs text-slate-400">{selectedPopupClient.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 bg-slate-950 p-4 rounded-2xl border border-slate-800 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Yaş / Cinsiyet:</span>
                <p className="text-white font-extrabold">{selectedPopupClient.age} Yaş / {selectedPopupClient.gender}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 font-bold">Telefon:</span>
                <p className="text-emerald-400 font-extrabold flex items-center gap-1">
                  <Phone size={12} /> {selectedPopupClient.phone}
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-bold">Boy:</span>
                <p className="text-white font-extrabold flex items-center gap-1">
                  <Ruler size={12} /> {selectedPopupClient.height} cm
                </p>
              </div>
              <div className="space-y-1 pt-2 border-t border-slate-800">
                <span className="text-slate-500 font-bold">Mevcut Kilo:</span>
                <p className="text-amber-400 font-extrabold flex items-center gap-1">
                  <Scale size={12} /> {selectedPopupClient.current_weight} kg
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                const id = selectedPopupClient.id;
                setSelectedPopupClient(null);
                onSelectClient(id);
              }}
              className="w-full py-3 bg-[#EA580C] hover:bg-orange-600 text-white font-bold text-xs rounded-xl transition-all"
            >
              Tam Danışan Dosyasını Aç
            </button>
          </div>
        </div>
      )}
    </div>
  );
}