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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Headphones className="w-5 h-5 text-purple-500" /> Destek Talepleri (Ticket)
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Teknik, üyelik veya sistemle ilgili karşılaştığınız tüm durumlar için 7/24 admin desteği alın.
          </p>
        </div>
        <button
          onClick={() => setIsTicketModalOpen(true)}
          className="px-5 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-purple-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> YENİ TICKET OLUŞTUR
        </button>
      </div>

      {/* Ticket Listesi Tablosu */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-[10px] font-black text-slate-500 uppercase tracking-wider">
                <th className="pb-4 px-4">TICKET ID</th>
                <th className="pb-4 px-4">KONU</th>
                <th className="pb-4 px-4">KATEGORİ</th>
                <th className="pb-4 px-4">ÖNCELİK</th>
                <th className="pb-4 px-4">TARİH</th>
                <th className="pb-4 px-4">DURUM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {tickets.map((t) => (
                <tr key={t.id} className="hover:bg-slate-950/40 transition-all">
                  <td className="py-4 px-4 font-mono font-bold text-purple-400">{t.id}</td>
                  <td className="py-4 px-4 font-bold text-white">{t.subject}</td>
                  <td className="py-4 px-4 text-slate-300">{t.category}</td>
                  <td className="py-4 px-4">
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      t.priority === "Yüksek" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" : "bg-blue-500/10 text-blue-400 border border-blue-500/20"
                    }`}>
                      {t.priority}
                    </span>
                  </td>
                  <td className="py-4 px-4 text-slate-400">{t.date}</td>
                  <td className="py-4 px-4">
                    <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${
                      t.status === "Çözüldü" 
                        ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30" 
                        : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                    }`}>
                      {t.status === "Çözüldü" ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-500" /> Destek Talebi Oluştur
              </h3>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">KONU BAŞLIĞI</label>
                <input 
                  type="text"
                  required
                  placeholder="Yaşadığınız durumu özetleyin..."
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">KATEGORİ</label>
                  <select 
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Teknik Destek">Teknik Destek</option>
                    <option value="Fatura & Üyelik">Fatura & Üyelik</option>
                    <option value="Antrenman/Diyet">Antrenman/Diyet</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">ÖNCELİK SEVİYESİ</label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Düşük">Düşük</option>
                    <option value="Normal">Normal</option>
                    <option value="Yüksek">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">DETAYLI AÇIKLAMA</label>
                <textarea 
                  rows="4"
                  required
                  placeholder="Lütfen sistem hatasını veya talebinizi detaylıca yazın..."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition-all"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-purple-600 hover:bg-purple-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-purple-600/30"
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