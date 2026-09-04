"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Check,
  X,
  Clock,
  Mail,
  Phone,
  Target,
  Inbox,
  Sparkles,
  Loader2,
} from "lucide-react";

export default function NewRequests({ requests = [], onAccept, onReject }) {
  const [fetchedRequests, setFetchedRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // LocalStorage üzerinden Specialist / User ID'sini alma
  const getStoredSpecialistId = () => {
    if (typeof window === "undefined") return null;
    try {
      const directId =
        localStorage.getItem("user_id") ||
        localStorage.getItem("specialist_id") ||
        localStorage.getItem("id");
      if (directId) return directId;

      const userStr = localStorage.getItem("user");
      if (userStr) {
        const userObj = JSON.parse(userStr);
        return userObj.id || userObj.user_id || userObj.specialist_id || null;
      }
    } catch (e) {
      console.error("LocalStorage okunurken hata oluştu:", e);
    }
    return null;
  };

  // Parent'tan istek gelmediyse API'den otomatik bekleyen başvuruları çek
  useEffect(() => {
    const fetchRequestsIfNeeded = async () => {
      const specId = getStoredSpecialistId();
      if (!specId) return;

      setIsLoading(true);
      try {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        let res;
        try {
          res = await fetch(`${baseUrl}/api/expert-clients/dashboard/${specId}`);
        } catch {
          res = await fetch(`/api/expert-clients/dashboard/${specId}`);
        }

        if (res && res.ok) {
          const data = await res.json();
          const pendingList =
            data.pending_requests ||
            data.requests ||
            data.pending ||
            (Array.isArray(data) ? data : []);
          setFetchedRequests(pendingList);
        }
      } catch (err) {
        console.error("Başvurular otomatik çekilirken hata:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (!requests || requests.length === 0) {
      fetchRequestsIfNeeded();
    }
  }, [requests]);

  // Props'tan gelen listeyi öncelikli kullan, yoksa fetch edilen listeyi al
  const dataSource = useMemo(() => {
    return Array.isArray(requests) && requests.length > 0
      ? requests
      : fetchedRequests;
  }, [requests, fetchedRequests]);

  // Kabul Et Mantığı (Parent callback yoksa API'ye istek atar ve listeden kaldırır)
  const handleAccept = async (req) => {
    const reqId = req.request_id || req.id;
    setActionLoadingId(reqId);

    try {
      if (typeof onAccept === "function") {
        await onAccept(req);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        await fetch(`${baseUrl}/api/expert-clients/accept/${reqId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      // Kabul edildikten sonra listeden anında kaldır
      setFetchedRequests((prev) =>
        prev.filter((r) => (r.request_id || r.id) !== reqId)
      );
    } catch (err) {
      console.error("Başvuru kabul edilirken hata oluştu:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

  // Reddet Mantığı (Parent callback yoksa API'ye istek atar ve listeden kaldırır)
  const handleReject = async (reqId) => {
    setActionLoadingId(reqId);

    try {
      if (typeof onReject === "function") {
        await onReject(reqId);
      } else {
        const baseUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
        await fetch(`${baseUrl}/api/expert-clients/reject/${reqId}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        });
      }
      // Reddedildikten sonra listeden anında kaldır
      setFetchedRequests((prev) =>
        prev.filter((r) => (r.request_id || r.id) !== reqId)
      );
    } catch (err) {
      console.error("Başvuru reddedilirken hata oluştu:", err);
    } finally {
      setActionLoadingId(null);
    }
  };

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

  // Yükleme Durumu
  if (isLoading && (!dataSource || dataSource.length === 0)) {
    return (
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4 backdrop-blur-2xl shadow-xl flex flex-col items-center justify-center min-h-[220px]">
        <Loader2 size={36} className="text-orange-500 animate-spin" />
        <p className="text-sm font-heading font-bold text-slate-300">
          Bekleyen Başvurular Yükleniyor...
        </p>
      </div>
    );
  }

  // Boş Durum
  if (!dataSource || dataSource.length === 0) {
    return (
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-4 backdrop-blur-2xl shadow-xl">
        <div className="w-16 h-16 bg-slate-950 text-slate-500 rounded-2xl border border-slate-800 flex items-center justify-center mx-auto shadow-inner">
          <Inbox size={32} className="text-slate-400" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-black text-white">
            Bekleyen Yeni Başvuru Yok
          </h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto font-medium">
            Danışanlar paket satın aldıklarında veya abone olduklarında
            başvurular buraya düşecektir.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {dataSource.map((req) => {
        const reqId = req.request_id || req.id;
        const fullName = `${req.first_name || "Danışan"} ${
          req.last_name || ""
        }`.trim();
        const fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
          fullName
        )}&background=ea580c&color=fff&bold=true`;

        // Mesaj temizleme mantığı
        const rawMessage = req.message ? String(req.message).trim() : "";
        const cleanMessage = rawMessage.replace(/^["'\s]+|["'\s]+$/g, "");
        const displayMessage =
          cleanMessage.length > 0
            ? cleanMessage
            : "Birebir koçluk ve danışmanlık talebi.";

        const isProcessing = actionLoadingId === reqId;

        return (
          <div
            key={reqId}
            className="group relative bg-slate-900/60 border border-slate-800/80 hover:border-slate-700/80 rounded-3xl p-6 space-y-5 backdrop-blur-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex flex-col justify-between"
          >
            <div className="space-y-4">
              {/* Üst Bilgi: Profil & Tarih */}
              <div className="flex justify-between items-start gap-3">
                <div className="flex items-center gap-3.5 min-w-0">
                  <div className="relative shrink-0">
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
                      className="w-14 h-14 rounded-2xl object-cover border border-slate-700/80 bg-slate-950 shadow-md"
                    />
                    <span className="absolute -bottom-1 -right-1 w-4 h-4 bg-orange-500 border-2 border-slate-900 rounded-full flex items-center justify-center">
                      <Sparkles className="w-2.5 h-2.5 text-white" />
                    </span>
                  </div>

                  <div className="truncate">
                    <h3 className="text-base font-heading font-black text-white truncate group-hover:text-orange-400 transition-colors">
                      {fullName}
                    </h3>
                    <p className="text-xs font-semibold text-orange-400/90 truncate mt-0.5">
                      {req.requested_package || req.package_name || "Online Danışmanlık"}
                    </p>
                  </div>
                </div>

                <span className="text-[10px] font-mono font-bold text-slate-400 flex items-center gap-1.5 bg-slate-950/80 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                  <Clock size={12} className="text-orange-500" />
                  {formatDate(req.request_date || req.created_at)}
                </span>
              </div>

              {/* Detay & Mesaj Kutusu */}
              <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800/80 space-y-3.5 shadow-inner">
                {/* Seçilen Hedef Gösterimi */}
                {req.goal && (
                  <div className="text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-xl flex items-center gap-2">
                    <Target size={14} className="shrink-0 text-emerald-400" />
                    <span className="text-emerald-300 font-semibold">
                      Hedef:
                    </span>
                    <span className="text-slate-200 font-medium truncate">
                      {req.goal}
                    </span>
                  </div>
                )}

                {/* Kullanıcı Mesajı */}
                <p className="text-xs text-slate-300 italic leading-relaxed bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
                  "{displayMessage}"
                </p>

                {/* Yaş / Cinsiyet / Boy / Kilo Metrik Kartları */}
                <div className="grid grid-cols-3 gap-2 text-[11px] pt-1 text-slate-400 font-mono">
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-sans font-semibold">
                      Yaş / Cins
                    </span>
                    <span className="text-slate-200 font-bold mt-0.5">
                      {req.age || "-"} / {req.gender || "-"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-sans font-semibold">
                      Boy
                    </span>
                    <span className="text-slate-200 font-bold mt-0.5">
                      {req.height ? `${req.height} cm` : "-"}
                    </span>
                  </div>
                  <div className="bg-slate-900/60 p-2 rounded-xl border border-slate-800/50 flex flex-col items-center">
                    <span className="text-[10px] text-slate-500 font-sans font-semibold">
                      Kilo
                    </span>
                    <span className="text-slate-200 font-bold mt-0.5">
                      {req.weight ? `${req.weight} kg` : "-"}
                    </span>
                  </div>
                </div>
              </div>

              {/* İletişim Bilgileri */}
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 px-1 gap-2">
                <span className="flex items-center gap-1.5 truncate text-slate-300">
                  <Mail size={13} className="shrink-0 text-slate-500" />{" "}
                  {req.email || "-"}
                </span>
                <span className="flex items-center gap-1.5 truncate text-slate-300">
                  <Phone size={13} className="shrink-0 text-slate-500" />{" "}
                  {req.phone || "-"}
                </span>
              </div>
            </div>

            {/* Eylem Butonları */}
            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-800/60">
              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleReject(reqId)}
                className="py-2.5 px-4 bg-slate-950 hover:bg-rose-950/40 text-slate-400 hover:text-rose-400 font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 border border-slate-800 hover:border-rose-500/30 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <X size={15} />
                )}
                <span>Reddet</span>
              </button>

              <button
                type="button"
                disabled={isProcessing}
                onClick={() => handleAccept(req)}
                className="py-2.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all duration-200 shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30 cursor-pointer disabled:opacity-50"
              >
                {isProcessing ? (
                  <Loader2 size={15} className="animate-spin text-white" />
                ) : (
                  <Check size={15} />
                )}
                <span>Kabul Et</span>
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}