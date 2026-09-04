"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
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
  CheckCircle2,
  Clock3,
  ExternalLink,
  Loader2,
  RefreshCw,
  MapPin,
  XCircle,
  MessageSquare,
} from "lucide-react";

// JWT Token Decode Yardımcısı
const decodeJwt = (token) => {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

export default function AppointmentsTab() {
  const [appointments, setAppointments] = useState([]);
  const [clients, setClients] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [error, setError] = useState(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState("all"); // 'all' | 'approved' | 'pending' | 'rejected'

  // Onay Modalı State'i
  const [approveModal, setApproveModal] = useState({
    isOpen: false,
    appt: null,
    meetingLink: "",
    locationLink: "",
  });

  // Reddet Modalı State'i
  const [rejectModal, setRejectModal] = useState({
    isOpen: false,
    appt: null,
    rejectionReason: "",
  });

  // Modal Açıldığında Arka Plan Kaydırmasını Kilitler
  useEffect(() => {
    if (isModalOpen || approveModal.isOpen || rejectModal.isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen, approveModal.isOpen, rejectModal.isOpen]);

  // Yeni Randevu Formu State
  const [newAppt, setNewAppt] = useState({
    client_id: "",
    title: "Birebir Görüşme",
    appointment_date: "",
    time_slot: "14:00 - 14:45",
    appointment_type: "online", // 'online' veya 'in_person'
    notes: "",
    meeting_link: "",
    location_link: "",
  });

  const getAuthHeaders = () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token")
        : null;

    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };
  };

  // Uzman ID'sini Çok Aşamalı Güvenli Çekme
  const getExpertId = useCallback(() => {
    if (typeof window === "undefined") return null;

    try {
      // 1. LocalStorage User Kontrolü
      const userStr = localStorage.getItem("user");

      if (userStr) {
        const user = JSON.parse(userStr);

        if (user.id) return user.id;
        if (user.user_id) return user.user_id;
      }

      // 2. JWT Token Decode Kontrolü
      const token = localStorage.getItem("token");

      if (token) {
        const decoded = decodeJwt(token);

        if (decoded?.id) return decoded.id;
        if (decoded?.user_id) return decoded.user_id;

        if (decoded?.sub && !isNaN(decoded.sub)) {
          return parseInt(decoded.sub, 10);
        }
      }
    } catch (e) {
      console.error("Kullanıcı bilgisi okunamadı:", e);
    }

    return null;
  }, []);

  const formatDisplayDate = (dateString) => {
    if (!dateString) return "";

    const d = new Date(dateString);

    if (isNaN(d.getTime())) return dateString;

    return d.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  // Veritabanından Randevuları ve Danışan Aboneliklerini Çekme
  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let expertId = getExpertId();
    const headers = getAuthHeaders();

    if (!expertId) {
      try {
        const authRes = await fetch("/api/auth/me", {
          headers,
        });

        if (authRes.ok) {
          const userData = await authRes.json();

          expertId =
            userData.id ||
            userData.user_id ||
            userData.user?.id ||
            userData.user?.user_id;

          if (expertId) {
            localStorage.setItem(
              "user",
              JSON.stringify(userData.user || userData)
            );
          }
        }
      } catch (e) {
        console.error("Auth doğrulama hatası:", e);
      }
    }

    if (!expertId) {
      setError("Oturum açmış uzman kimliği bulunamadı.");
      setIsLoading(false);
      return;
    }

    try {
      const [apptsRes, clientsRes] = await Promise.all([
        fetch(`/api/appointments/expert/${expertId}`, {
          headers,
        }),
        fetch("/api/appointments/expert/clients", {
          headers,
        }),
      ]);

      if (!apptsRes.ok) {
        throw new Error(
          "Randevular sunucudan çekilirken bir sorun oluştu."
        );
      }

      const apptsData = await apptsRes.json();

      setAppointments(
        Array.isArray(apptsData) ? apptsData : []
      );

      if (clientsRes.ok) {
        const clientsData = await clientsRes.json();

        const clientList = Array.isArray(clientsData)
          ? clientsData
          : [];

        const uniqueClientsMap = new Map();

        clientList.forEach((client) => {
          const clientId =
            client.client_id ??
            client.id ??
            client.user_id;

          if (
            clientId === null ||
            clientId === undefined ||
            clientId === ""
          ) {
            return;
          }

          const normalizedClientId = String(clientId);

          if (!uniqueClientsMap.has(normalizedClientId)) {
            uniqueClientsMap.set(
              normalizedClientId,
              {
                ...client,
                client_id: clientId,
              }
            );
          } else {
            const existingClient =
              uniqueClientsMap.get(
                normalizedClientId
              );

            uniqueClientsMap.set(
              normalizedClientId,
              {
                ...existingClient,
                ...Object.fromEntries(
                  Object.entries(client).filter(
                    ([key, value]) =>
                      (existingClient[key] === null ||
                        existingClient[key] === undefined ||
                        existingClient[key] === "") &&
                      value !== null &&
                      value !== undefined &&
                      value !== ""
                  )
                ),
                client_id: clientId,
              }
            );
          }
        });

        const uniqueClientList = Array.from(
          uniqueClientsMap.values()
        );

        setClients(uniqueClientList);

        if (uniqueClientList.length > 0) {
          const firstClientId =
            uniqueClientList[0].client_id ||
            uniqueClientList[0].id;

          setNewAppt((prev) => ({
            ...prev,
            client_id:
              prev.client_id &&
              uniqueClientList.some(
                (client) =>
                  String(
                    client.client_id ||
                      client.id
                  ) ===
                  String(prev.client_id)
              )
                ? prev.client_id
                : firstClientId || "",
          }));
        } else {
          setNewAppt((prev) => ({
            ...prev,
            client_id: "",
          }));
        }
      } else {
        setClients([]);
        setNewAppt((prev) => ({
          ...prev,
          client_id: "",
        }));
      }
    } catch (err) {
      console.error(
        "Randevu verisi yükleme hatası:",
        err
      );

      setError(
        err.message || "Bir hata oluştu."
      );
    } finally {
      setIsLoading(false);
    }
  }, [getExpertId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filteredAppointments = useMemo(() => {
    if (filter === "approved") {
      return appointments.filter(
        (a) => a.status === "approved"
      );
    }

    if (filter === "pending") {
      return appointments.filter(
        (a) => a.status === "pending"
      );
    }

    if (filter === "rejected") {
      return appointments.filter(
        (a) => a.status === "rejected"
      );
    }

    return appointments;
  }, [appointments, filter]);

  // --- ONAYLAMA MODALI AÇMA ---
  const handleOpenApproveModal = (appt) => {
    setApproveModal({
      isOpen: true,
      appt,
      meetingLink:
        appt.meeting_link ||
        (appt.appointment_type === "online"
          ? `https://meet.google.com/vitalis-${appt.id}`
          : ""),
      locationLink: appt.location_link || "",
    });
  };

  // --- ONAYLAMA İŞLEMİNİ TAMAMLAMA ---
  const handleConfirmApprove = async (e) => {
    e.preventDefault();
    if (!approveModal.appt) return;

    const apptId = approveModal.appt.id;
    setActionLoadingId(apptId);

    try {
      const payload = {
        status: "approved",
        meeting_link:
          approveModal.appt.appointment_type === "online"
            ? approveModal.meetingLink
            : null,
        location_link:
          approveModal.appt.appointment_type === "in_person"
            ? approveModal.locationLink
            : null,
      };

      const res = await fetch(
        `/api/appointments/${apptId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Randevu onaylanamadı."
        );
      }

      const responseData = await res.json();
      const updatedAppt = responseData.appointment || responseData;

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId
            ? {
                ...appt,
                ...updatedAppt,
                status: "approved",
                meeting_link: payload.meeting_link,
                location_link: payload.location_link,
              }
            : appt
        )
      );

      setApproveModal({
        isOpen: false,
        appt: null,
        meetingLink: "",
        locationLink: "",
      });
    } catch (err) {
      alert(
        err.message || "Onaylama işlemi sırasında bir hata oluştu."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // --- REDDETME MODALI AÇMA ---
  const handleOpenRejectModal = (appt) => {
    setRejectModal({
      isOpen: true,
      appt,
      rejectionReason: "",
    });
  };

  // --- REDDETME İŞLEMİNİ TAMAMLAMA (SİLME YOK, STATÜ REJECTED) ---
  const handleConfirmReject = async (e) => {
    e.preventDefault();
    if (!rejectModal.appt) return;

    const apptId = rejectModal.appt.id;
    setActionLoadingId(apptId);

    try {
      const payload = {
        status: "rejected",
        rejection_reason: rejectModal.rejectionReason || "Uzman tarafından uygun görülmedi.",
      };

      const res = await fetch(
        `/api/appointments/${apptId}/status`,
        {
          method: "PUT",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.detail || "Randevu reddedilemedi."
        );
      }

      const responseData = await res.json();
      const updatedAppt = responseData.appointment || responseData;

      setAppointments((prev) =>
        prev.map((appt) =>
          appt.id === apptId
            ? {
                ...appt,
                ...updatedAppt,
                status: "rejected",
                rejection_reason: payload.rejection_reason,
              }
            : appt
        )
      );

      setRejectModal({
        isOpen: false,
        appt: null,
        rejectionReason: "",
      });
    } catch (err) {
      alert(
        err.message || "Reddetme işlemi sırasında bir hata oluştu."
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  // Yeni Seans Oluşturma Submit
  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!newAppt.client_id) {
        throw new Error(
          "Lütfen bir danışan seçiniz."
        );
      }

      const payload = {
        client_id: parseInt(
          newAppt.client_id,
          10
        ),
        title:
          newAppt.title ||
          "Uzman Tarafından Planlanan Seans",
        appointment_date:
          newAppt.appointment_date,
        time_slot:
          newAppt.time_slot,
        appointment_type:
          newAppt.appointment_type,
        notes:
          newAppt.notes || null,
        meeting_link:
          newAppt.appointment_type ===
          "online"
            ? newAppt.meeting_link ||
              `https://meet.google.com/vitalis-${Date.now()}`
            : null,
        location_link:
          newAppt.appointment_type ===
          "in_person"
            ? newAppt.location_link ||
              null
            : null,
      };

      const res = await fetch(
        "/api/appointments/expert/create",
        {
          method: "POST",
          headers: getAuthHeaders(),
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) {
        const errorData =
          await res.json().catch(() => ({}));

        throw new Error(
          errorData.detail ||
            "Yeni seans kaydı oluşturulamadı."
        );
      }

      const responseData =
        await res.json();

      const createdAppt =
        responseData.appointment;

      setAppointments((prev) => [
        createdAppt,
        ...prev,
      ]);

      setIsModalOpen(false);

      const defaultClientId =
        clients[0]?.client_id ||
        clients[0]?.id ||
        "";

      setNewAppt({
        client_id: defaultClientId,
        title: "Birebir Görüşme",
        appointment_date: "",
        time_slot:
          "14:00 - 14:45",
        appointment_type:
          "online",
        notes: "",
        meeting_link: "",
        location_link: "",
      });
    } catch (err) {
      alert(
        err.message ||
          "Seans oluşturulurken bir hata meydana geldi."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Banner / Header */}
      <div className="relative overflow-hidden bg-slate-800/40 backdrop-blur-2xl border border-blue-500/25 rounded-3xl p-4 sm:p-5 shadow-[0_0_25px_rgba(59,130,246,0.08)] hover:border-blue-400/40 hover:shadow-[0_0_35px_rgba(59,130,246,0.13)] transition-all duration-500">
        <div className="absolute -top-20 -left-20 w-60 h-60 bg-blue-500/10 rounded-full blur-[80px] pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-60 h-60 bg-cyan-500/10 rounded-full blur-[80px] pointer-events-none" />

        <div className="relative z-10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-2 ring-blue-400/30 shrink-0">
              <Calendar
                size={23}
                className="text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
              />
            </div>

            <div>
              <p className="text-[9px] font-heading font-black tracking-[0.2em] text-blue-400/90 uppercase">
                Seans & Randevu Yönetimi
              </p>

              <h2 className="text-lg font-heading font-black text-white mt-0.5">
                Danışan Randevu Takvimi
              </h2>

              <p className="text-[11px] font-medium text-slate-400 mt-0.5 max-w-lg leading-relaxed">
                Danışanlarınızın rezerve ettiği seansları onaylayın, canlı görüşme linklerini yönetin veya doğrudan yeni bir seans planlayın.
              </p>
            </div>
          </div>

          <button
            onClick={() =>
              setIsModalOpen(true)
            }
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-black text-[11px] tracking-wider rounded-2xl transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 flex items-center gap-2 shrink-0 self-stretch sm:self-auto justify-center"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            YENİ SEANS PLANLA
          </button>
        </div>
      </div>

      {/* Filtre Barı */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
          {[
            {
              id: "all",
              label: "Tüm Seanslar",
              count: appointments.length,
            },
            {
              id: "approved",
              label: "Onaylananlar",
              count: appointments.filter(
                (a) => a.status === "approved"
              ).length,
            },
            {
              id: "pending",
              label: "Bekleyenler",
              count: appointments.filter(
                (a) => a.status === "pending"
              ).length,
            },
            {
              id: "rejected",
              label: "Reddedilenler",
              count: appointments.filter(
                (a) => a.status === "rejected"
              ).length,
            },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() =>
                setFilter(tab.id)
              }
              className={`text-xs font-heading font-extrabold px-4 py-2.5 rounded-2xl border transition-all duration-300 active:scale-95 flex items-center gap-2 shrink-0 ${
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

        <div className="text-right hidden sm:block shrink-0">
          <p className="text-[11px] font-bold text-slate-400">
            Entegrasyon Durumu:{" "}
            <span className="text-emerald-400">
              Aktif (REST API)
            </span>
          </p>
        </div>
      </div>

      {/* Yüklenme ve Hata Durumları */}
      {isLoading ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center backdrop-blur-xl space-y-4 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />

          <p className="text-xs font-heading font-bold text-slate-400">
            Randevu verileri veritabanından yükleniyor...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-950/30 border border-rose-500/30 rounded-3xl p-8 text-center backdrop-blur-xl space-y-3">
          <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />

          <p className="text-sm font-heading font-bold text-rose-300">
            {error}
          </p>

          <button
            onClick={fetchData}
            className="px-4 py-2 bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-200 rounded-xl text-xs font-bold transition-all inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Tekrar Deneyin
          </button>
        </div>
      ) : filteredAppointments.length === 0 ? (
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-3xl p-12 text-center backdrop-blur-xl space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-800/80 border border-slate-700/50 text-slate-500 flex items-center justify-center mx-auto">
            <Calendar size={22} />
          </div>

          <p className="text-sm font-heading font-extrabold text-slate-300">
            Seçilen filtreye uygun randevu bulunamadı.
          </p>

          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Yeni bir randevu oluşturabilir veya filtrelerinizi değiştirebilirsiniz.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filteredAppointments.map((appt) => {
            const isApproved = appt.status === "approved";
            const isRejected = appt.status === "rejected";
            const isActionBusy = actionLoadingId === appt.id;

            return (
              <div
                key={appt.id}
                className="relative overflow-hidden bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 hover:border-blue-500/40 rounded-3xl p-5 shadow-2xl transition-all duration-300 hover:shadow-[0_0_30px_rgba(59,130,246,0.1)] flex flex-col justify-between group"
              >
                <div
                  className={`absolute top-0 right-0 w-36 h-36 rounded-full blur-3xl pointer-events-none transition-opacity duration-500 ${
                    isApproved
                      ? "bg-emerald-500/10 opacity-70 group-hover:opacity-100"
                      : isRejected
                      ? "bg-rose-500/10 opacity-70 group-hover:opacity-100"
                      : "bg-amber-500/10 opacity-70 group-hover:opacity-100"
                  }`}
                />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between gap-2">
                    <span
                      className={`text-[10px] font-heading font-black tracking-wider px-3 py-1 rounded-full uppercase border flex items-center gap-1.5 ${
                        isApproved
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-[0_0_12px_rgba(16,185,129,0.15)]"
                          : isRejected
                          ? "bg-rose-500/10 text-rose-400 border-rose-500/30 shadow-[0_0_12px_rgba(244,63,94,0.15)]"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/30 shadow-[0_0_12px_rgba(245,158,11,0.15)]"
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 size={12} />
                          ONAYLANDI
                        </>
                      ) : isRejected ? (
                        <>
                          <XCircle size={12} />
                          REDDEDİLDİ
                        </>
                      ) : (
                        <>
                          <Clock3 size={12} />
                          ONAY BEKLİYOR
                        </>
                      )}
                    </span>

                    <span className="text-[11px] font-bold text-slate-400 bg-slate-950/60 px-3 py-1 rounded-xl border border-slate-800/80 uppercase">
                      {appt.appointment_type === "online"
                        ? "Online Seans"
                        : "Yüz Yüze"}
                    </span>
                  </div>

                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600/20 to-indigo-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400 font-heading font-black text-lg shrink-0 shadow-inner">
                      {appt.client_name
                        ? appt.client_name.charAt(0).toUpperCase()
                        : "D"}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-base font-heading font-extrabold text-white truncate">
                        {appt.client_name || `Danışan #${appt.client_id}`}
                      </h4>

                      <p className="text-xs font-medium text-blue-400/90 truncate mt-0.5">
                        {appt.title || "Birebir Görüşme"}
                      </p>
                    </div>
                  </div>

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
                          {formatDisplayDate(appt.appointment_date)}
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
                          {appt.time_slot}
                        </p>
                      </div>
                    </div>
                  </div>

                  {appt.notes && (
                    <div className="bg-slate-950/40 border border-slate-800/60 rounded-2xl p-3 text-xs text-slate-400 leading-relaxed">
                      <span className="font-bold text-slate-300">
                        Gündem / Not:
                      </span>{" "}
                      {appt.notes}
                    </div>
                  )}

                  {isRejected && appt.rejection_reason && (
                    <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-3 text-xs text-rose-300 leading-relaxed">
                      <span className="font-bold text-rose-200">
                        Red Sebebi:
                      </span>{" "}
                      {appt.rejection_reason}
                    </div>
                  )}
                </div>

                <div className="pt-4 relative z-10">
                  {isApproved ? (
                    appt.appointment_type === "online" ? (
                      <a
                        href={appt.meeting_link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs rounded-2xl tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:shadow-[0_0_25px_rgba(16,185,129,0.45)] active:scale-98 flex items-center justify-center gap-2"
                      >
                        <Video className="w-4 h-4" />
                        <span>ONLINE GÖRÜŞMEYİ BAŞLAT</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    ) : (
                      <a
                        href={appt.location_link || "#"}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-black text-xs rounded-2xl tracking-wider transition-all duration-300 shadow-[0_0_20px_rgba(37,99,235,0.3)] hover:shadow-[0_0_25px_rgba(37,99,235,0.45)] active:scale-98 flex items-center justify-center gap-2"
                      >
                        <MapPin className="w-4 h-4" />
                        <span>KONUMA GİT (YÜZ YÜZE)</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    )
                  ) : isRejected ? (
                    <div className="py-2.5 bg-slate-950 border border-slate-800 text-slate-500 text-xs font-bold rounded-2xl text-center">
                      Bu seans iptal edildi/reddedildi.
                    </div>
                  ) : (
                    <div className="flex gap-3">
                      <button
                        disabled={isActionBusy}
                        onClick={() => handleOpenRejectModal(appt)}
                        className="flex-1 py-3 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 hover:border-rose-500/50 text-rose-400 font-heading font-extrabold text-xs rounded-2xl transition-all duration-300 flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isActionBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <X className="w-4 h-4" />
                            REDDET
                          </>
                        )}
                      </button>

                      <button
                        disabled={isActionBusy}
                        onClick={() => handleOpenApproveModal(appt)}
                        className="flex-1 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-extrabold text-xs rounded-2xl transition-all duration-300 shadow-[0_0_18px_rgba(16,185,129,0.3)] hover:shadow-[0_0_22px_rgba(16,185,129,0.45)] flex items-center justify-center gap-1.5 active:scale-95 disabled:opacity-50"
                      >
                        {isActionBusy ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <>
                            <Check className="w-4 h-4" />
                            ONAYLA & LİNK EKLE
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* --- ONAYLAMA VE LİNK EKLEME MODALI --- */}
      {approveModal.isOpen && approveModal.appt && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  <Check className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-sm font-heading font-black text-white">
                    Randevuyu Onayla
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Danışana gönderilecek görüşme bilgilerini ekleyin.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setApproveModal({
                    isOpen: false,
                    appt: null,
                    meetingLink: "",
                    locationLink: "",
                  })
                }
                className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleConfirmApprove} className="space-y-3.5">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <p className="text-white font-bold">
                  {approveModal.appt.client_name || `Danışan #${approveModal.appt.client_id}`}
                </p>
                <p className="text-slate-400">
                  {formatDisplayDate(approveModal.appt.appointment_date)} • {approveModal.appt.time_slot}
                </p>
                <p className="text-blue-400 font-bold uppercase text-[10px]">
                  Tür: {approveModal.appt.appointment_type === "online" ? "Online Görüşme" : "Yüz Yüze Görüşme"}
                </p>
              </div>

              {approveModal.appt.appointment_type === "online" ? (
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                    ONLINE TOPLANTI LİNKİ
                  </label>

                  <input
                    type="url"
                    required
                    placeholder="https://meet.google.com/... veya https://teams.microsoft.com/..."
                    value={approveModal.meetingLink}
                    onChange={(e) =>
                      setApproveModal({
                        ...approveModal,
                        meetingLink: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none font-medium"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                    KONUM / HARİTA LİNKİ
                  </label>

                  <input
                    type="url"
                    required
                    placeholder="https://maps.google.com/..."
                    value={approveModal.locationLink}
                    onChange={(e) =>
                      setApproveModal({
                        ...approveModal,
                        locationLink: e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none font-medium"
                  />
                </div>
              )}

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setApproveModal({
                      isOpen: false,
                      appt: null,
                      meetingLink: "",
                      locationLink: "",
                    })
                  }
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-heading font-extrabold text-xs rounded-2xl"
                >
                  VAZGEÇ
                </button>

                <button
                  type="submit"
                  disabled={actionLoadingId === approveModal.appt.id}
                  className="flex-1 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-heading font-black text-xs rounded-2xl shadow-[0_0_18px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                >
                  {actionLoadingId === approveModal.appt.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "ONAYLA VE BİLDİR"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- REDDETME VE SEBEP BİLDİRME MODALI --- */}
      {rejectModal.isOpen && rejectModal.appt && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
                  <X className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-sm font-heading font-black text-white">
                    Seansı Reddet
                  </h3>

                  <p className="text-[10px] text-slate-400">
                    Danışana gösterilmek üzere red sebebi belirtin.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setRejectModal({
                    isOpen: false,
                    appt: null,
                    rejectionReason: "",
                  })
                }
                className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form onSubmit={handleConfirmReject} className="space-y-3.5">
              <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800 text-xs space-y-1">
                <p className="text-white font-bold">
                  {rejectModal.appt.client_name || `Danışan #${rejectModal.appt.client_id}`}
                </p>
                <p className="text-slate-400">
                  {formatDisplayDate(rejectModal.appt.appointment_date)} • {rejectModal.appt.time_slot}
                </p>
              </div>

              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                  REDDETME SEBEBİ
                </label>

                <textarea
                  required
                  rows="3"
                  placeholder="Örn: Belirtilen saat diliminde önceden planlanmış bir seansım bulunuyor..."
                  value={rejectModal.rejectionReason}
                  onChange={(e) =>
                    setRejectModal({
                      ...rejectModal,
                      rejectionReason: e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500 rounded-2xl p-3 text-xs text-white focus:outline-none resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex gap-2.5">
                <button
                  type="button"
                  onClick={() =>
                    setRejectModal({
                      isOpen: false,
                      appt: null,
                      rejectionReason: "",
                    })
                  }
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-heading font-extrabold text-xs rounded-2xl"
                >
                  VAZGEÇ
                </button>

                <button
                  type="submit"
                  disabled={actionLoadingId === rejectModal.appt.id}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 text-white font-heading font-black text-xs rounded-2xl shadow-[0_0_18px_rgba(225,29,72,0.3)] flex items-center justify-center gap-2"
                >
                  {actionLoadingId === rejectModal.appt.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "SEANSI REDDET"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* YENİ SEANS PLANLAMA MODALI */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 pt-20 animate-fadeIn overflow-hidden">
          <div className="relative bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-4 sm:p-5 shadow-2xl flex flex-col max-h-[70vh] overflow-hidden my-auto">
            <div className="absolute -top-20 -right-20 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-20 -left-20 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex items-center justify-between relative z-10 shrink-0 mb-3 pb-2 border-b border-slate-800/80">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Sparkles className="w-4 h-4" />
                </div>

                <div>
                  <h3 className="text-base font-heading font-black text-white">
                    Danışan İçin Seans Planla
                  </h3>

                  <p className="text-[10px] text-slate-400 font-medium">
                    Takviminize özel bir danışan seansı ekleyin.
                  </p>
                </div>
              </div>

              <button
                onClick={() =>
                  setIsModalOpen(false)
                }
                className="w-7 h-7 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:border-slate-700 transition-colors shrink-0"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateAppointment
              }
              className="space-y-3.5 relative z-10 flex-1 overflow-y-auto pr-1.5 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-slate-900"
            >
              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1.5 block">
                  1. DANIŞAN SEÇİN
                </label>

                {clients.length > 0 ? (
                  <div className="space-y-2 max-h-32 overflow-y-auto pr-1">
                    {clients.map(
                      (client) => {
                        const clientIdVal =
                          client.client_id ||
                          client.id;

                        const isSelected =
                          String(
                            newAppt.client_id
                          ) ===
                          String(
                            clientIdVal
                          );

                        const clientName =
                          client.full_name ||
                          client.client_name ||
                          client.name ||
                          `Danışan #${clientIdVal}`;

                        const pkgName =
                          client.package_name ||
                          "Aktif Abonelik";

                        const goalText =
                          client.goal
                            ? ` • ${client.goal}`
                            : "";

                        return (
                          <div
                            key={String(
                              clientIdVal
                            )}
                            onClick={() =>
                              setNewAppt(
                                {
                                  ...newAppt,
                                  client_id:
                                    clientIdVal,
                                }
                              )
                            }
                            className={`p-2.5 rounded-2xl border cursor-pointer transition-all duration-300 flex items-center gap-2.5 ${
                              isSelected
                                ? "bg-blue-600/15 border-blue-500 shadow-[0_0_15px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/50"
                                : "bg-slate-950/80 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/60"
                            }`}
                          >
                            <div
                              className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-colors ${
                                isSelected
                                  ? "border-blue-400 bg-blue-500 text-white"
                                  : "border-slate-700 bg-slate-900"
                              }`}
                            >
                              {isSelected && (
                                <div className="w-1.5 h-1.5 rounded-full bg-white" />
                              )}
                            </div>

                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-heading font-extrabold text-white truncate">
                                {
                                  clientName
                                }
                              </p>

                              <p className="text-[10px] font-medium text-slate-400 truncate mt-0.5">
                                {
                                  pkgName
                                }
                                {
                                  goalText
                                }
                              </p>
                            </div>
                          </div>
                        );
                      }
                    )}
                  </div>
                ) : (
                  <div className="bg-slate-950/60 border border-amber-500/30 rounded-2xl p-3 text-center space-y-1">
                    <p className="text-xs font-bold text-amber-400">
                      Aktif Aboneliği Olan Danışan Bulunamadı
                    </p>

                    <p className="text-[10px] text-slate-400">
                      Önce bir danışanla aktif aboneliğiniz olmalıdır.
                    </p>
                  </div>
                )}
              </div>

              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                  SEANS BAŞLIĞI
                </label>

                <input
                  type="text"
                  required
                  placeholder="Örn: Birebir Beslenme Danışmanlığı"
                  value={
                    newAppt.title
                  }
                  onChange={(e) =>
                    setNewAppt({
                      ...newAppt,
                      title:
                        e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                    PLANLANAN TARİH
                  </label>

                  <input
                    type="date"
                    required
                    value={
                      newAppt.appointment_date
                    }
                    onChange={(e) =>
                      setNewAppt({
                        ...newAppt,
                        appointment_date:
                          e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>

                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                    SEANS SAATİ
                  </label>

                  <select
                    value={
                      newAppt.time_slot
                    }
                    onChange={(e) =>
                      setNewAppt({
                        ...newAppt,
                        time_slot:
                          e.target.value,
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold transition-all"
                  >
                    <option value="09:00 - 09:45">
                      09:00 - 09:45
                    </option>
                    <option value="10:00 - 10:45">
                      10:00 - 10:45
                    </option>
                    <option value="11:15 - 12:00">
                      11:15 - 12:00
                    </option>
                    <option value="14:00 - 14:45">
                      14:00 - 14:45
                    </option>
                    <option value="15:15 - 16:00">
                      15:15 - 16:00
                    </option>
                    <option value="16:30 - 17:15">
                      16:30 - 17:15
                    </option>
                    <option value="19:00 - 19:45">
                      19:00 - 19:45
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                  SEANS TÜRÜ
                </label>

                <select
                  value={
                    newAppt.appointment_type
                  }
                  onChange={(e) =>
                    setNewAppt({
                      ...newAppt,
                      appointment_type:
                        e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-bold transition-all"
                >
                  <option value="online">
                    Online Görüşme
                  </option>

                  <option value="in_person">
                    Yüz Yüze Görüşme
                  </option>
                </select>
              </div>

              {newAppt.appointment_type ===
              "online" ? (
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                    ONLINE TOPLANTI LİNKİ (OPSİYONEL)
                  </label>

                  <input
                    type="url"
                    value={
                      newAppt.meeting_link
                    }
                    onChange={(e) =>
                      setNewAppt({
                        ...newAppt,
                        meeting_link:
                          e.target.value,
                      })
                    }
                    placeholder="https://meet.google.com/... veya https://zoom.us/j/..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>
              ) : (
                <div>
                  <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                    KONUM / HARİTA LİNKİ (OPSİYONEL)
                  </label>

                  <input
                    type="url"
                    value={
                      newAppt.location_link
                    }
                    onChange={(e) =>
                      setNewAppt({
                        ...newAppt,
                        location_link:
                          e.target.value,
                      })
                    }
                    placeholder="https://maps.google.com/..."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl px-3.5 py-2 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 font-medium transition-all"
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] font-heading font-black text-slate-400 tracking-wider uppercase mb-1 block">
                  GÖRÜŞME NOTU / GÜNDEM
                </label>

                <textarea
                  rows="2"
                  placeholder="Danışanınızla yapacağınız görüşmenin konusunu veya notlarını yazın..."
                  value={
                    newAppt.notes
                  }
                  onChange={(e) =>
                    setNewAppt({
                      ...newAppt,
                      notes:
                        e.target.value,
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 focus:border-blue-500 rounded-2xl p-2.5 text-xs text-white focus:outline-none focus:ring-1 focus:ring-blue-500 resize-none transition-all"
                />
              </div>

              <div className="pt-2 flex gap-2.5 sticky bottom-0 bg-slate-900 pb-1 z-20 border-t border-slate-800/80">
                <button
                  type="button"
                  onClick={() =>
                    setIsModalOpen(false)
                  }
                  className="flex-1 py-2 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-heading font-extrabold text-xs rounded-2xl transition-all"
                >
                  VAZGEÇ
                </button>

                <button
                  type="submit"
                  disabled={
                    isSubmitting ||
                    !newAppt.client_id
                  }
                  className="flex-1 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-heading font-black text-xs rounded-2xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.35)] hover:shadow-[0_0_25px_rgba(37,99,235,0.5)] active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "SEANSI KAYDET"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}