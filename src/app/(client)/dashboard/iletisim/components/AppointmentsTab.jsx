"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, Plus, CheckCircle2, AlertCircle, User, Sparkles, X } from "lucide-react";

export default function AppointmentsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [appointments, setAppointments] = useState([
    {
      id: 1,
      expertName: "Dr. Melis Kaya",
      expertRole: "Baş Diyetisyen & Beslenme Uzmanı",
      date: "25 Temmuz 2026",
      time: "14:00 - 14:45",
      type: "Birebir Video Konferans",
      status: "confirmed", // confirmed, pending, completed
      meetUrl: "https://zoom.us/j/vitalis-session-1"
    },
    {
      id: 2,
      expertName: "Berkant Demir",
      expertRole: "Kıdemli Fitness & Performans Koçu",
      date: "28 Temmuz 2026",
      time: "16:30 - 17:15",
      type: "Form & Antrenman Analizi",
      status: "pending",
      meetUrl: ""
    }
  ]);

  // Yeni Randevu Form State
  const [newAppt, setNewAppt] = useState({
    expert: "Dr. Melis Kaya",
    date: "",
    time: "14:00",
    note: ""
  });

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      expertName: newAppt.expert,
      expertRole: newAppt.expert.includes("Melis") ? "Baş Diyetisyen" : "Fitness Koçu",
      date: newAppt.date || "30 Temmuz 2026",
      time: `${newAppt.time} - 45 dk`,
      type: "Birebir Online Seans",
      status: "pending",
      meetUrl: "https://teams.microsoft.com/l/meetup-join/vitalis"
    };
    setAppointments([created, ...appointments]);
    setIsModalOpen(false);
    setNewAppt({ expert: "Dr. Melis Kaya", date: "", time: "14:00", note: "" });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      
      {/* Üst Bilgi & Yeni Randevu Al Butonu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-slate-900/60 border border-slate-800 p-6 rounded-3xl shadow-xl">
        <div>
          <h3 className="text-lg font-black text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-500" /> Aktif Randevularım
          </h3>
          <p className="text-xs text-slate-400 mt-0.5">
            Uzmanlarımızla rezerve ettiğiniz görüntülü seansları buradan yönetebilirsiniz.
          </p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-5 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30 flex items-center gap-2 shrink-0"
        >
          <Plus className="w-4 h-4" /> YENİ RANDEVU OLUŞTUR
        </button>
      </div>

      {/* Randevu Listesi */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {appointments.map((appt) => (
          <div key={appt.id} className="bg-slate-900/90 border border-slate-800/80 rounded-3xl p-6 shadow-2xl flex flex-col justify-between space-y-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className={`text-[10px] font-black tracking-widest px-3 py-1 rounded-full uppercase border ${
                  appt.status === "confirmed" 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30" 
                    : "bg-amber-500/10 text-amber-400 border-amber-500/30"
                }`}>
                  {appt.status === "confirmed" ? "✓ ONAYLANDI & HAZIR" : "⏳ ONAY BEKLİYOR"}
                </span>
                <span className="text-xs font-bold text-slate-400">{appt.type}</span>
              </div>

              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 font-black text-lg">
                  {appt.expertName.charAt(3)}
                </div>
                <div>
                  <h4 className="text-base font-black text-white">{appt.expertName}</h4>
                  <p className="text-xs text-slate-400">{appt.expertRole}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-blue-400 shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-extrabold">TARİH</p>
                    <p className="text-xs font-bold text-slate-200">{appt.date}</p>
                  </div>
                </div>
                <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-emerald-400 shrink-0" />
                  <div>
                    <p className="text-[9px] text-slate-500 font-extrabold">SAAT</p>
                    <p className="text-xs font-bold text-slate-200">{appt.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Katılım / Aksiyon Butonu */}
            <div className="pt-2">
              {appt.status === "confirmed" ? (
                <a
                  href={appt.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl tracking-wider transition-all shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2"
                >
                  <Video className="w-4 h-4" /> GÖRÜŞMEYE KATIL (ZOOM / TEAMS)
                </a>
              ) : (
                <div className="w-full py-3 bg-slate-950 border border-slate-800 text-slate-400 font-bold text-xs rounded-2xl text-center">
                  Uzman onayı bekleniyor (24 saat içinde atanır)
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* 🚀 YENİ RANDEVU OLUŞTURMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">
            
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-black text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-blue-500" /> Yeni Randevu Talebi
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">UZMAN SEÇİMİ</label>
                <select 
                  value={newAppt.expert}
                  onChange={(e) => setNewAppt({...newAppt, expert: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                >
                  <option value="Dr. Melis Kaya">Dr. Melis Kaya (Baş Diyetisyen)</option>
                  <option value="Berkant Demir">Berkant Demir (Fitness Koçu)</option>
                  <option value="Selin Arslan">Selin Arslan (Klinik Psikolog)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">TERCİH EDİLEN TARİH</label>
                  <input 
                    type="date"
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">SEANS SAATİ</label>
                  <select 
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-blue-500 font-bold"
                  >
                    <option value="10:00">10:00 - 10:45</option>
                    <option value="14:00">14:00 - 14:45</option>
                    <option value="16:30">16:30 - 17:15</option>
                    <option value="19:00">19:00 - 19:45</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">GÖRÜŞME NOTU / HEDEF</label>
                <textarea 
                  rows="3"
                  placeholder="Kısaca görüşmek istediğiniz konuyu belirtin..."
                  value={newAppt.note}
                  onChange={(e) => setNewAppt({...newAppt, note: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-blue-500 resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition-all"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-2xl transition-all shadow-lg shadow-blue-600/30"
                >
                  RANDEVUYU ONAYLA
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}