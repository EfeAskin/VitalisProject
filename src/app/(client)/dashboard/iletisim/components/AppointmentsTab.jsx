"use client";

import React, { useState } from "react";
import { Calendar, Clock, Video, Plus, Sparkles, X, UserCheck } from "lucide-react";

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
      status: "confirmed", // confirmed, pending
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

  // İsimden Baş Harfleri Alma Fonksiyonu (Unvanları Filtreler)
  const getInitials = (fullName) => {
    if (!fullName) return "U";
    return fullName
      .split(" ")
      .filter((part) => !part.toLowerCase().includes("dr"))
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  // Tarih Dönüştürücü (2026-07-30 -> 30 Temmuz 2026)
  const formatTurkishDate = (rawDate) => {
    if (!rawDate) return "30 Temmuz 2026";
    const parsed = new Date(rawDate);
    if (isNaN(parsed.getTime())) return rawDate;
    return parsed.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  };

  const handleCreateAppointment = (e) => {
    e.preventDefault();
    const created = {
      id: Date.now(),
      expertName: newAppt.expert,
      expertRole: newAppt.expert.includes("Melis") ? "Baş Diyetisyen" : "Fitness Koçu",
      date: formatTurkishDate(newAppt.date),
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
    <div className="space-y-6">
      
      {/* Üst Bilgi & Yeni Randevu Al Butonu */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#181D45]/90 border border-slate-700/60 p-5 sm:p-6 rounded-2xl shadow-lg backdrop-blur-md">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Aktif Randevularım
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Uzmanlarımızla rezerve ettiğiniz görüntülü seansları buradan takip edebilirsiniz.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="w-full sm:w-auto px-5 py-3 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" /> Yeni Randevu Oluştur
        </button>
      </div>

      {/* Randevu Listesi Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {appointments.map((appt) => (
          <div 
            key={appt.id} 
            className="bg-[#181D45]/80 border border-slate-700/60 hover:border-slate-500 rounded-2xl p-5 sm:p-6 shadow-md transition-all duration-200 flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              {/* Statü ve Tür Rozetleri */}
              <div className="flex items-center justify-between gap-2">
                <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider ${
                  appt.status === "confirmed" 
                    ? "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" 
                    : "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                }`}>
                  {appt.status === "confirmed" ? "✓ Onaylandı" : "⏳ Onay Bekliyor"}
                </span>
                <span className="text-xs font-medium text-slate-400 truncate">{appt.type}</span>
              </div>

              {/* Uzman Profil Bilgisi */}
              <div className="flex items-center gap-3.5 pt-1">
                <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-600 text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0">
                  {getInitials(appt.expertName)}
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-base font-bold text-white truncate">{appt.expertName}</h4>
                  <p className="text-xs text-slate-400 truncate">{appt.expertRole}</p>
                </div>
              </div>

              {/* Tarih & Saat Kutuları */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="bg-[#11142D]/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Tarih</p>
                    <p className="text-xs font-semibold text-slate-200 truncate">{appt.date}</p>
                  </div>
                </div>
                <div className="bg-[#11142D]/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                  <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                  <div className="overflow-hidden">
                    <p className="text-[10px] text-slate-400 font-semibold uppercase">Saat</p>
                    <p className="text-xs font-semibold text-slate-200 truncate">{appt.time}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Aksiyon Butonu */}
            <div className="pt-2">
              {appt.status === "confirmed" ? (
                <a
                  href={appt.meetUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm"
                >
                  <Video className="w-4 h-4" /> Görüşmeye Katıl
                </a>
              ) : (
                <div className="w-full py-2.5 bg-slate-800/60 border border-slate-700/50 text-slate-400 font-medium text-xs rounded-xl text-center">
                  Uzman onayı bekleniyor (Yaklaşık 24 saat)
                </div>
              )}
            </div>

          </div>
        ))}
      </div>

      {/* YENİ RANDEVU OLUŞTURMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#181D45] border border-slate-700 shadow-2xl rounded-2xl max-w-lg w-full p-5 sm:p-7 relative space-y-5 text-slate-100">
            
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Yeni Randevu Talebi
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Formu */}
            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Uzman Seçimi</label>
                <select 
                  value={newAppt.expert}
                  onChange={(e) => setNewAppt({...newAppt, expert: e.target.value})}
                  className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium outline-none transition-all cursor-pointer"
                >
                  <option value="Dr. Melis Kaya">Dr. Melis Kaya (Baş Diyetisyen)</option>
                  <option value="Berkant Demir">Berkant Demir (Fitness Koçu)</option>
                  <option value="Selin Arslan">Selin Arslan (Klinik Psikolog)</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Tercih Edilen Tarih</label>
                  <input 
                    type="date"
                    required
                    value={newAppt.date}
                    onChange={(e) => setNewAppt({...newAppt, date: e.target.value})}
                    className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Seans Saati</label>
                  <select 
                    value={newAppt.time}
                    onChange={(e) => setNewAppt({...newAppt, time: e.target.value})}
                    className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium outline-none transition-all cursor-pointer"
                  >
                    <option value="10:00">10:00 - 10:45</option>
                    <option value="14:00">14:00 - 14:45</option>
                    <option value="16:30">16:30 - 17:15</option>
                    <option value="19:00">19:00 - 19:45</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Görüşme Notu / Hedef</label>
                <textarea 
                  rows="3"
                  placeholder="Kısaca görüşmek istediğiniz konuyu belirtin..."
                  value={newAppt.note}
                  onChange={(e) => setNewAppt({...newAppt, note: e.target.value})}
                  className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-200 font-medium outline-none resize-none transition-all placeholder-slate-500"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer"
                >
                  Vazgeç
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md cursor-pointer"
                >
                  Randevuyu Onayla
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}