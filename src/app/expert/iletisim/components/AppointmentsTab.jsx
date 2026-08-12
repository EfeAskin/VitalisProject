"use client";

import React, { useState, useMemo } from "react";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Check,
  X,
  User,
  Sparkles,
  AlertCircle,
  Filter,
  CheckCircle2,
  Clock3,
  ChevronRight,
  ExternalLink,
} from "lucide-react";

export default function AppointmentsTab() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'confirmed' | 'pending'

  const [appointments, setAppointments] = useState([
    {
      id: 1,
      clientName: "Ahmet Yılmaz",
      clientGoal: "Kilo Verme & Kas Kazanımı (VIP Üye)",
      date: "2026-07-25",
      displayDate: "25 Temmuz 2026",
      time: "14:00 - 14:45",
      type: "Birebir Video Konferans",
      status: "confirmed", // confirmed, pending
      meetUrl: "https://zoom.us/j/vitalis-session-1",
      note: "Haftalık form kontrolü ve beslenme makro güncellemeleri konuşulacak.",
    },
    {
      id: 2,
      clientName: "Ayşe Çelik",
      clientGoal: "Ketojenik Beslenme & Form Analizi",
      date: "2026-07-28",
      displayDate: "28 Temmuz 2026",
      time: "16:30 - 17:15",
      type: "Form & Antrenman Analizi",
      status: "pending",
      meetUrl: "",
      note: "Ketojenik diyete geçiş sonrası ilk değerlendirme seansı teklifi.",
    },
  ]);

  // Yeni Randevu/Seans Formu State
  const [newAppt, setNewAppt] = useState({
    clientName: "Ahmet Yılmaz",
    date: "",
    time: "14:00 - 14:45",
    type: "Birebir Online Seans",
    note: "",
  });

  // Filtrelenmiş Randevular
  const filteredAppointments = useMemo(() => {
    if (filter === "confirmed") return appointments.filter((a) => a.status === "confirmed");
    if (filter === "pending") return appointments.filter((a) => a.status === "pending");
    return appointments;
  }, [appointments, filter]);

  // Bekleyen Randevuyu Onaylama
  const handleApprove = (id) => {
    setAppointments((prev) =>
      prev.map((appt) =>
        appt.id === id
          ? {
              ...appt,
              status: "confirmed",
              meetUrl: "https://teams.microsoft.com/l/meetup-join/vitalis",
            }
          : appt
      )
    );
  };

  // Bekleyen Randevuyu Reddetme/Silme
  const handleReject = (id) => {
    setAppointments((prev) => prev.filter((appt) => appt.id !== id));
  };

  // Yeni Randevu Tanımlama
  const handleCreateAppointment = (e) => {
    e.preventDefault();

    let formattedDate = "30 Temmuz 2026";
    if (newAppt.date) {
      const d = new Date(newAppt.date);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toLocaleDateString("tr-TR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        });
      }
    }

    const created = {
      id: Date.now(),
      clientName: newAppt.clientName,
      clientGoal: "Uzman Tarafından Planlandı",
      date: newAppt.date || "2026-07-30",
      displayDate: formattedDate,
      time: newAppt.time,
      type: newAppt.type || "Birebir Online Seans",
      status: "confirmed",
      meetUrl: "https://teams.microsoft.com/l/meetup-join/vitalis",
      note: newAppt.note || "Uzman tarafından doğrudan planlanan seans.",
    };

    setAppointments([created, ...appointments]);
    setIsModalOpen(false);
    setNewAppt({
      clientName: "Ahmet Yılmaz",
      date: "",
      time: "14:00 - 14:45",
      type: "Birebir Online Seans",
      note: "",
    });
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Banner / Header */}
      <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-blue-500/25 rounded-3xl p-6 shadow-[0_0_25px_rgba(59,130,246,0.08)] hover:border-blue-400/40 hover:shadow-[0_0_35px_rgba(59,130,246,0.13)] transition-all duration-500">
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-blue-500/10 rounded-full blur-[90px] pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-cyan-500/10 rounded-full blur-[90px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-2 ring-blue-400/30 shrink-0">
              <Calendar size={28} className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
            </div>
            <div>
              <p className="text-[10px] font-heading font-black tracking-[0.2em] text-blue-400/90 uppercase">
                Seans & Randevu Yönetimi
              </p>
              <h2 className="text-xl font-heading font-black text-white mt-0.5">
                Danışan Randevu Takvimi
              </h2>
              <p className="text-xs font-medium text-slate-400 mt-1 max-w-lg leading-relaxed">
                Danışanlarınızın rezerve ettiği seansları onaylayın, canlı görüşme linklerini yönetin veya doğrudan yeni bir seans planlayın.
              </p>
            </div>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-5 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-black text-xs tracking-wider rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            YENİ SEANS PLANLA
          </button>
        </div>
      </div>

      {/* Filtre Barı & İstatistik Özeti */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          {[
            { id: "all", label: "Tüm Seanslar", count: appointments.length },
            {
              id: "confirmed",
              label: "Onaylananlar",
              count: appointments.filter((a) => a.status === "confirmed").length,
            },
            {
              id: "pending",
              label: "Bekleyenler",
              count: appointments.filter((a) => a.status === "pending").length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              className={`text-xs font-heading font-extrabold px-4 py-2.5 rounded-2xl border transition-all duration-300 active:scale-95 flex items-center gap-2 ${
                filter === tab.id
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-blue-400/50 shadow-[0_0_18px_rgba(37,99,235,0.35)]"
                  : "bg-slate-900/80 backdrop-blur-md text-slate-400 border-slate-800 hover:border-slate-700 hover:text-slate-200"
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-black ${
                  filter === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-slate-800 text-slate-400"
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <div className="text-right hidden sm:block">
          <p className="text-[11px] font-bold text-slate-400">
            Aktif Görüşme Odası: <span className="text-emerald-400">Entegre (Zoom / Teams)</span>
          </p>
        </div>
      </div>

      {/* Randevu Listesi */}
      {filteredAppointments.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center backdrop-blur-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-500 flex items-center justify-center mx-auto">
            <Calendar size={22} />
          </div>
          <p className="text-sm font-heading font-extrabold text-slate-300">
            Seçilen filtreye uygun randevu bulunamadı.
          </p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Yeni bir randevu oluşturabilir veya diğer seans filtrelerini kontrol edebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {filteredAppointments.map((appt) => {
            const isConfirmed = appt.status === "confirmed";

            return (
              <div
                key={appt.id}
                className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 hover:border-blue-500/40 rounded-3xl p-6 shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col justify-between group"
              >
                {/* Kart Arka Plan Işığı */}
                <div
                  className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
                    isConfirmed ? "bg-emerald-500/10 opacity-70 group-hover:opacity-100" : "bg-amber-500/10 opacity-70 group-hover:opacity-100"
                  }`}
                />

                <div className="space-y-5 relative z-10">
                  {/* Status & Type Bar */}
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-heading font-black tracking-wider px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 ${
                        isConfirmed
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      }`}
                    >
                      {isConfirmed ? (
                        <>
                          <CheckCircle2 size={12} /> ONAYLANDI & HAZIR
                        </>
                      ) : (
                        <>
                          <Clock3 size={12} /> ONAY BEKLİYOR
                        </>
                      )}
                    </span>
                    <span className="text-[11px] font-bold text-slate-400 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800/80">
                      {appt.type}
                    </span>
                  </div>

                  {/* Danışan Bilgileri */}
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-heading font-black text-lg shrink-0 shadow-inner">
                      {appt.clientName.charAt(0)}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-heading font-extrabold text-white truncate">
                        {appt.clientName}
                      </h4>
                      <p className="text-xs font-medium text-blue-400/90 truncate mt-0.5">
                        {appt.clientGoal}
                      </p>
                    </div>
                  </div>

                  {/* Tarih & Saat Kartçıkları */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 shrink-0">
                        <Calendar className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-heading font-black text-slate-500 tracking-wider">
                          TARİH
                        </p>
                        <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                          {appt.displayDate || appt.date}
                        </p>
                      </div>
                    </div>

                    <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/90 flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <Clock className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-[9px] font-heading font-black text-slate-500 tracking-wider">
                          SAAT SEÇENEĞİ
                        </p>
                        <p className="text-xs font-bold text-slate-200 truncate mt-0.5">
                          {appt.time}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Notlar (Varsa) */}
                  {appt.note && (
                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3 text-xs text-slate-400 leading-relaxed">
                      <span className="font-bold text-slate-300">Gündem / Not:</span> {appt.note}
                    </div>
                  )}
                </div>

                {/* Katılım / Aksiyon Butonu */}
                <div className="pt-5 relative z-10">
                  {isConfirmed ? (
                    <a
                      href={appt.meetUrl || "#"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs rounded-2xl tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-98 flex items-center justify-center gap-2"
                    >
                      <Video className="w-4 h-4" />
                      <span>GÖRÜŞMEYİ BAŞLAT (ZOOM / TEAMS)</span>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        onClick={() => handleReject(appt.id)}
                        className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 font-heading font-extrabold text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <X className="w-4 h-4" /> REDDET
                      </button>
                      <button
                        onClick={() => handleApprove(appt.id)}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-xs rounded-2xl transition-all duration-300 shadow-[0_0_18px_rgba(16,185,129,0.3)] hover:shadow-[0_0_22px_rgba(16,185,129,0.45)] flex items-center justify-center gap-1.5 active:scale-95"
                      >
                        <Check className="w-4 h-4" /> ONAYLA
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🚀 YENİ SEANS PLANLAMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl space-y-6 overflow-hidden">
            {/* Modal Arka Plan Parıltıları */}
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-heading font-black text-white">
                    Danışan İçin Seans Planla
                  </h3>
                  <p className="text-[11px] text-slate-400 font-medium">
                    Takviminize özel bir danışan seansı ekleyin.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4 relative z-10">
              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1.5 block">
                  DANIŞAN SEÇİMİ
                </label>
                <select
                  value={newAppt.clientName}
                  onChange={(e) => setNewAppt({ ...newAppt, clientName: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold transition-all"
                >
                  <option value="Ahmet Yılmaz">Ahmet Yılmaz</option>
                  <option value="Ayşe Çelik">Ayşe Çelik</option>
                  <option value="Mehmet Öz">Mehmet Öz</option>
                  <option value="Canan Demir">Canan Demir</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1.5 block">
                    PLANLANAN TARİH
                  </label>
                  <input
                    type="date"
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({ ...newAppt, date: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1.5 block">
                    SEANS SAATİ
                  </label>
                  <select
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({ ...newAppt, time: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold transition-all"
                  >
                    <option value="10:00 - 10:45">10:00 - 10:45</option>
                    <option value="14:00 - 14:45">14:00 - 14:45</option>
                    <option value="16:30 - 17:15">16:30 - 17:15</option>
                    <option value="19:00 - 19:45">19:00 - 19:45</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1.5 block">
                  SEANS TÜRÜ
                </label>
                <input
                  type="text"
                  value={newAppt.type}
                  onChange={(e) => setNewAppt({ ...newAppt, type: e.target.value })}
                  placeholder="Örn: Birebir Online Seans, Beslenme Analizi..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                />
              </div>

              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1.5 block">
                  GÖRÜŞME NOTU / GÜNDEM
                </label>
                <textarea
                  rows="3"
                  placeholder="Danışanınızla yapacağınız görüşmenin konusunu yazın..."
                  value={newAppt.note}
                  onChange={(e) => setNewAppt({ ...newAppt, note: e.target.value })}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl p-4 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-heading font-extrabold text-xs rounded-2xl transition-all"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-black text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95"
                >
                  SEANSI KAYDET
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}