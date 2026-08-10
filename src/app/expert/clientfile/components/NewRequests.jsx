"use client";

import React from "react";
import { Check, X, Clock, Mail, Phone, UserCheck, Target } from "lucide-react";

export default function NewRequests({ requests, onAccept, onReject }) {
  if (!requests || requests.length === 0) {
    return (
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center space-y-4">
        <div className="w-16 h-16 bg-slate-800 text-slate-500 rounded-full flex items-center justify-center mx-auto">
          <UserCheck size={32} />
        </div>
        <h3 className="text-lg font-bold text-white">Bekleyen Yeni Başvuru Yok</h3>
        <p className="text-xs text-slate-400">
          Danışanlar paket satın aldıklarında veya abone olduklarında buraya düşecekler.
        </p>
      </div>
    );
  }

  // Tarih Formatlama Yardımcısı
  const formatDate = (dateStr) => {
    if (!dateStr) return "Yeni";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString("tr-TR", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {requests.map((req) => {
        const reqId = req.request_id || req.id;
        const fullName = `${req.first_name || "Danışan"} ${req.last_name || ""}`.trim();
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fullName
        )}&background=ea580c&color=fff&bold=true`;

        // Mesaj temizleme logic
        const rawMessage = req.message ? String(req.message).trim() : "";
        const cleanMessage = rawMessage.replace(/^["'\s]+|["'\s]+$/g, "");
        const displayMessage =
          cleanMessage.length > 0
            ? cleanMessage
            : "Birebir koçluk ve antrenman takibi talebi.";

        return (
          <div
            key={reqId}
            className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-5 shadow-xl relative"
          >
            <div className="flex justify-between items-start gap-2">
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={
                    req.avatar && req.avatar.trim() !== ""
                      ? req.avatar
                      : fallbackAvatar
                  }
                  alt={fullName}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = fallbackAvatar;
                  }}
                  className="w-14 h-14 rounded-2xl object-cover border border-slate-700 bg-slate-950 shrink-0"
                />
                <div className="truncate">
                  <h3 className="text-base font-black text-white truncate">
                    {fullName}
                  </h3>
                  <p className="text-xs text-slate-400 truncate">
                    {req.requested_package || "Aylık Pt Danışmanlığı"}
                  </p>
                </div>
              </div>
              <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 bg-slate-950 px-2.5 py-1 rounded-full border border-slate-800 shrink-0">
                <Clock size={12} className="text-[#EA580C]" />{" "}
                {formatDate(req.request_date)}
              </span>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
              {/* Seçilen Hedef Gösterimi */}
              {req.goal && (
                <div className="text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1.5 rounded-xl flex items-center gap-1.5">
                  <Target size={13} className="shrink-0 text-emerald-400" />
                  <span>Hedef:</span>
                  <span className="text-slate-200 font-medium truncate">{req.goal}</span>
                </div>
              )}

              {/* Kullanıcı Mesajı */}
              <p className="text-xs text-slate-300 italic">"{displayMessage}"</p>
              
              <div className="grid grid-cols-3 gap-2 text-[11px] pt-2 border-t border-slate-800/80 text-slate-400">
                <span>
                  <strong>Yaş/Cins:</strong> {req.age || "-"} / {req.gender || "-"}
                </span>
                <span>
                  <strong>Boy:</strong> {req.height ? `${req.height}cm` : "-"}
                </span>
                <span>
                  <strong>Kilo:</strong> {req.weight ? `${req.weight}kg` : "-"}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 px-1">
              <span className="flex items-center gap-1 truncate">
                <Mail size={12} className="shrink-0" /> {req.email || "-"}
              </span>
              <span className="flex items-center gap-1 truncate">
                <Phone size={12} className="shrink-0" /> {req.phone || "-"}
              </span>
            </div>

            {/* Eylem Butonları */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => onReject(reqId)}
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
        );
      })}
    </div>
  );
}