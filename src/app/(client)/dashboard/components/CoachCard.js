"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MessageSquare, Loader2, UserX } from 'lucide-react';

export default function CoachCard({ onOpenChat }) {
  const router = useRouter();
  const [coachData, setCoachData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [imgError, setImgError] = useState(false);

  useEffect(() => {
    async function fetchCoach() {
      try {
        setLoading(true);
        const res = await fetch('/api/client/my-coach');
        if (res.ok) {
          const data = await res.json();
          if (data.assigned) {
            setCoachData(data.coach);
          }
        }
      } catch (error) {
        console.error("Uzman bilgisi alınamadı:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchCoach();
  }, []);

  const handleChatClick = () => {
    if (!coachData) return;
    
    if (onOpenChat) {
      onOpenChat(coachData.id);
    } else {
      // ✅ Yönlendirme adresi target_id ve tab=messages ile güncellendi
      router.push(`/dashboard/iletisim?tab=messages&target_id=${coachData.id}`);
    }
  };

  if (loading) {
    return (
      <div className="bg-white/95 rounded-3xl p-5 shadow-lg border border-emerald-500/30 flex items-center justify-center min-h-[80px]">
        <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (!coachData) {
    return (
      <div className="bg-white/95 rounded-3xl p-5 shadow-lg border border-emerald-500/30 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
          <UserX size={18} />
        </div>
        <div>
          <h4 className="text-xs font-black text-slate-900">Atanmış Uzman Yok</h4>
          <p className="text-[10px] text-slate-500 font-semibold">Aktif bir Koç/Diyetisyen programınız bulunmuyor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white/95 rounded-3xl p-5 shadow-[0_15px_35px_rgba(0,0,0,0.4)] border border-emerald-500/30 hover:border-amber-400/50 transition-all duration-300 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] flex items-center justify-between relative">
      {/* Profil Bilgileri */}
      <div className="flex items-center gap-3.5">
        {/* Avatar / Fotoğraf */}
        <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-900 text-amber-300 flex items-center justify-center font-black text-xs shadow-md border border-amber-400/40 tracking-wider flex-shrink-0 overflow-hidden">
          {coachData.profile_photo && !imgError ? (
            <img 
              src={coachData.profile_photo} 
              alt={coachData.full_name} 
              className="w-full h-full object-cover"
              onError={() => setImgError(true)}
            />
          ) : (
            <span>{coachData.initials}</span>
          )}
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-950 tracking-tight drop-shadow-xs">
            {coachData.full_name}
          </h4>
          
          <div className="flex items-center gap-1.5 mt-1 flex-wrap">
            {/* Unvan Rozeti */}
            <span className="text-[9px] bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-bold border border-slate-200">
              {coachData.title}
            </span>

            {/* Durum Rozeti */}
            <span className="flex items-center gap-1 text-[9px] bg-emerald-50 text-emerald-800 px-1.5 py-0.5 rounded font-black border border-emerald-200 uppercase">
              <span className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></span>
              {coachData.status}
            </span>
          </div>
        </div>
      </div>

      {/* Chat Butonu */}
      <button 
        onClick={handleChatClick}
        className="flex items-center gap-1.5 bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 hover:from-emerald-500 hover:to-teal-600 active:scale-95 text-white px-4 py-2 rounded-2xl text-xs font-black transition-all duration-200 shadow-[0_0_15px_rgba(16,185,129,0.3)] hover:shadow-[0_0_20px_rgba(16,185,129,0.5)] border border-emerald-400/30 cursor-pointer"
      >
        <MessageSquare size={13} className="text-amber-300 fill-amber-300/20" /> Chat
      </button>
    </div>
  );
}