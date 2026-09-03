import React from 'react';
import { Calendar, Video, MapPin, Clock } from 'lucide-react';
import Link from 'next/link';

export default function AppointmentsSidebar({ appointments, role }) {
  const isTrainer = role === 'trainer';
  const themeColor = isTrainer ? 'bg-[#EA580C]' : 'bg-emerald-500';
  const glowColor = isTrainer ? 'shadow-[0_0_20px_rgba(234,88,12,0.15)]' : 'shadow-[0_0_20px_rgba(16,185,129,0.15)]';

  if (!appointments || appointments.length === 0) {
    return (
      <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 text-center">
        <div className="w-12 h-12 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-3">
          <Calendar className="text-slate-500" size={24} />
        </div>
        <h4 className="text-slate-300 font-semibold mb-1">Randevunuz Yok</h4>
        <p className="text-slate-500 text-xs">Bugün için planlanmış bir görüşmeniz bulunmuyor.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between px-1">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Clock size={16} className={isTrainer ? 'text-[#EA580C]' : 'text-emerald-500'} />
          Bugünkü Randevular
        </h3>
        <span className="text-xs bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full">{appointments.length} Seans</span>
      </div>

      <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
        {appointments.map((apt, index) => {
          const isNext = index === 0; // İlk randevuyu sıradaki seans olarak vurgula
          
          return (
            <div key={apt.id} className={`relative rounded-2xl border p-5 transition-all ${isNext ? `bg-slate-900/80 border-${isTrainer ? 'orange' : 'emerald'}-500/30 ${glowColor}` : 'bg-slate-900/40 border-slate-800 hover:border-slate-700'}`}>
              
              {isNext && (
                <div className="flex justify-between items-center mb-3">
                  <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${isTrainer ? 'text-[#EA580C] border-[#EA580C]/30 bg-[#EA580C]/10' : 'text-emerald-400 border-emerald-400/30 bg-emerald-400/10'}`}>
                    Sıradaki Seans
                  </span>
                  <Calendar size={16} className="text-slate-400" />
                </div>
              )}

              <h4 className="text-white font-bold text-base mb-2">{apt.title || "Birebir Görüşme"}</h4>
              
              <div className="flex items-center gap-2 mb-4">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <p className="text-slate-300 text-sm font-medium">Bugün, {apt.time_slot}</p>
              </div>

              {apt.appointment_type === 'online' && apt.meeting_link ? (
                <Link href={apt.meeting_link} target="_blank" className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-bold text-white transition-all ${isTrainer ? 'bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-400' : 'bg-gradient-to-r from-emerald-600 to-emerald-500 hover:from-emerald-500 hover:to-emerald-400'}`}>
                  <Video size={16} /> Görüşmeye Katıl
                </Link>
              ) : apt.appointment_type === 'in_person' && apt.location_link ? (
                <Link href={apt.location_link} target="_blank" className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-sm font-bold text-white transition-all">
                  <MapPin size={16} /> Konumu Aç
                </Link>
              ) : (
                <button disabled className="w-full py-2.5 rounded-xl bg-slate-800/50 text-slate-500 text-sm font-bold cursor-not-allowed">
                  Link Bekleniyor
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}