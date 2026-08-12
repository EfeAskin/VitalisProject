"use client";

import React, { useState } from "react";
import { Headphones, Plus, AlertCircle, CheckCircle2, Clock, ShieldAlert, X } from "lucide-react";

export default function SupportTab() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [tickets, setTickets] = useState([
    {
      id: "VTS-8842",
      subject: "Neon DB Beslenme Verisi Senkronizasyon Sorunu",
      category: "Teknik Destek",
      priority: "Yüksek",
      status: "Çözüldü",
      date: "22 Temmuz 2026"
    },
    {
      id: "VTS-9104",
      subject: "Abonelik Planı Yükseltme Talebi",
      category: "Fatura & Üyelik",
      priority: "Orta",
      status: "İşleniyor",
      date: "23 Temmuz 2026"
    }
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Teknik Destek",
    priority: "Normal",
    message: ""
  });

  const handleCreateTicket = (e) => {
    e.preventDefault();
    const created = {
      id: `VTS-${Math.floor(1000 + Math.random() * 9000)}`,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "İşleniyor",
      date: "Bugün"
    };
    setTickets([created, ...tickets]);
    setIsTicketModalOpen(false);
    setNewTicket({ subject: "", category: "Teknik Destek", priority: "Normal", message: "" });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Üst Bilgi & Yeni Ticket Al Butonu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 bg-gradient-to-r from-[#1E192E] via-[#1B172B] to-[#1E192E] border border-purple-500/30 p-6 sm:p-7 rounded-3xl shadow-[0_0_30px_rgba(168,85,247,0.15)] backdrop-blur-xl relative overflow-hidden">
        {/* Ortam Ambient Glow */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-3 tracking-wide">
            <div className="p-2.5 rounded-2xl bg-purple-500/10 border border-purple-500/30 shadow-[0_0_15px_rgba(168,85,247,0.3)]">
              <Headphones className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
            </div>
            Destek Talepleri (Ticket)
          </h3>
          <p className="text-xs sm:text-sm text-purple-200/70 mt-2 font-medium max-w-xl">
            Teknik, üyelik veya sistemle ilgili karşılaştığınız tüm durumlar için 7/24 VIP admin desteği alın.
          </p>
        </div>

        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="relative z-10 px-6 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 shrink-0 cursor-pointer border border-purple-400/40"
        >
          <Plus className="w-4 h-4 stroke-[3]" /> YENİ TICKET OLUŞTUR
        </button>
      </div>

      {/* Ticket Listesi Tablosu Container */}
      <div className="bg-[#191726]/90 border border-fuchsia-500/20 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden relative">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-purple-500/20 text-[10px] font-black text-purple-300/80 uppercase tracking-widest bg-purple-950/20">
                <th className="pb-4 pt-2 px-4">TICKET ID</th>
                <th className="pb-4 pt-2 px-4">KONU</th>
                <th className="pb-4 pt-2 px-4">KATEGORİ</th>
                <th className="pb-4 pt-2 px-4">ÖNCELİK</th>
                <th className="pb-4 pt-2 px-4">TARİH</th>
                <th className="pb-4 pt-2 px-4">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-purple-500/10 text-xs">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-purple-500/10 transition-all duration-200 group">
                  <td className="py-4 px-4 font-mono font-bold text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.5)]">
                    {t.id}
                  </td>
                  <td className="py-4 px-4 font-bold text-white group-hover:text-purple-200 transition-colors">
                    {t.subject}
                  </td>
                  <td className="py-4 px-4 text-purple-200/80 font-medium">
                    {t.category}
                  </td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                      t.priority === "Yüksek" 
                        ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]" 
                        : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-purple-300/60 font-medium">{t.date}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3.5 py-1.5 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${
                      t.status === "Çözüldü" 
                        ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                    }`}>
                      {t.status === "Çözüldü" ? <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> : <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />}
                      {t.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 YENİ TICKET OLUŞTURMA MODALI */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#211A30] to-[#151726] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative space-y-6 text-slate-100">
            
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                </div>
                Destek Talebi Oluştur
              </h3>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#11121C] border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Formu */}
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                  KONU BAŞLIĞI
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Yaşadığınız durumu özetleyin..."
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-[#11121C] border border-purple-500/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-purple-300/40 font-medium outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                    KATEGORİ
                  </label>
                  <select 
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full bg-[#11121C] border border-purple-500/30 focus:border-purple-400 rounded-2xl px-4 py-3 text-xs text-white font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="Teknik Destek" className="bg-[#151726] text-white">Teknik Destek</option>
                    <option value="Fatura & Üyelik" className="bg-[#151726] text-white">Fatura & Üyelik</option>
                    <option value="Antrenman/Diyet" className="bg-[#151726] text-white">Antrenman/Diyet</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                    ÖNCELİK SEVİYESİ
                  </label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full bg-[#11121C] border border-purple-500/30 focus:border-purple-400 rounded-2xl px-4 py-3 text-xs text-white font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="Düşük" className="bg-[#151726] text-white">Düşük</option>
                    <option value="Normal" className="bg-[#151726] text-white">Normal</option>
                    <option value="Yüksek" className="bg-[#151726] text-white">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                  DETAYLI AÇIKLAMA
                </label>
                <textarea 
                  rows="4"
                  required
                  placeholder="Lütfen sistem hatasını veya talebinizi detaylıca yazın..."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  className="w-full bg-[#11121C] border border-purple-500/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 rounded-2xl p-4 text-xs text-white placeholder-purple-300/40 font-medium outline-none resize-none transition-all"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-3.5 bg-[#11121C] border border-purple-500/30 hover:bg-purple-950/40 text-purple-200 font-bold text-xs tracking-wider uppercase rounded-2xl transition-all cursor-pointer"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer border border-purple-400/40"
                >
                  TICKET GÖNDER
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}