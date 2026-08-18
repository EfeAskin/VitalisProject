"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Calendar,
  Clock,
  Video,
  Plus,
  Sparkles,
  X,
  UserCheck,
  MapPin,
  Loader2,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  XCircle,
} from "lucide-react";

// Sabit Seans Saatleri
const SESSION_TIMES = [
  "09:00 - 09:45",
  "10:00 - 10:45",
  "11:15 - 12:00",
  "14:00 - 14:45",
  "15:15 - 16:00",
  "16:30 - 17:15",
  "19:00 - 19:45",
];

export default function AppointmentsTab() {
  // ============================================================
  // API BASE & AUTH HELPERS
  // ============================================================

  const API_BASE =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:8000";

  const getAuthHeaders = () => {
    const headers = {
      Accept: "application/json",
      "Content-Type": "application/json",
    };

    if (typeof window !== "undefined") {
      const token =
        localStorage.getItem("access_token") ||
        localStorage.getItem("token");

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
    }

    return headers;
  };

  // ============================================================
  // STATE
  // ============================================================

  const [currentUser, setCurrentUser] = useState(null);
  const [appointments, setAppointments] = useState([]);
  const [experts, setExperts] = useState([]);

  const [isLoadingUser, setIsLoadingUser] = useState(true);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);
  const [isLoadingExperts, setIsLoadingExperts] = useState(false);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingAppointmentId, setDeletingAppointmentId] = useState(null);

  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const [newAppt, setNewAppt] = useState({
    expertId: "",
    date: "",
    time: "",
    appointmentType: "online",
    note: "",
  });

  // ============================================================
  // BODY SCROLL LOCK WHEN MODAL IS OPEN
  // ============================================================

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isModalOpen]);

  // ============================================================
  // AUTHENTICATED USER ID
  // ============================================================

  const authenticatedUserId = useMemo(() => {
    if (!currentUser) return null;

    const id =
      currentUser.id ??
      currentUser.user_id ??
      currentUser.userId;

    if (id === undefined || id === null || id === "") {
      return null;
    }

    const numericId = Number(id);
    return Number.isFinite(numericId) ? numericId : null;
  }, [currentUser]);

  // ============================================================
  // TODAY
  // ============================================================

  const today = useMemo(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }, []);

  // ============================================================
  // INITIAL LOAD
  // ============================================================

  useEffect(() => {
    loadCurrentUser();
  }, []);

  useEffect(() => {
    if (!authenticatedUserId) return;
    loadAppointments(authenticatedUserId);
    loadExperts();
  }, [authenticatedUserId]);

  // ============================================================
  // API ERROR PARSER
  // ============================================================

  const parseApiError = async (response, fallbackMessage) => {
    try {
      const data = await response.json();
      if (typeof data?.detail === "string") return data.detail;
      if (typeof data?.message === "string") return data.message;
      if (Array.isArray(data?.detail) && data.detail.length > 0) {
        return data.detail
          .map((item) => (typeof item === "string" ? item : item?.msg || ""))
          .filter(Boolean)
          .join(", ");
      }
      return fallbackMessage;
    } catch {
      return fallbackMessage;
    }
  };

  // ============================================================
  // GET CURRENT USER
  // ============================================================

  const loadCurrentUser = async () => {
    setIsLoadingUser(true);
    setError("");

    try {
      const response = await fetch(`${API_BASE}/api/auth/me`, {
        method: "GET",
        credentials: "include",
        headers: getAuthHeaders(),
        cache: "no-store",
      });

      if (!response.ok) {
        const message = await parseApiError(
          response,
          response.status === 401
            ? "Oturumunuz bulunamadı. Lütfen tekrar giriş yapın."
            : "Kullanıcı bilgileri alınamadı."
        );
        throw new Error(message);
      }

      const data = await response.json();
      const normalizedUser =
        data?.user && typeof data.user === "object" ? data.user : data;

      if (!normalizedUser || typeof normalizedUser !== "object") {
        throw new Error("Geçersiz kullanıcı bilgisi alındı.");
      }

      const userId =
        normalizedUser.id ?? normalizedUser.user_id ?? normalizedUser.userId;

      if (userId === undefined || userId === null || userId === "") {
        throw new Error("Doğrulanmış kullanıcı kimliği bulunamadı.");
      }

      setCurrentUser(normalizedUser);
    } catch (err) {
      console.error("Appointments current user error:", err);
      setCurrentUser(null);
      setAppointments([]);
      setExperts([]);
      setError(err?.message || "Kullanıcı bilgileri alınarken bir hata oluştu.");
    } finally {
      setIsLoadingUser(false);
    }
  };

  // ============================================================
  // GET CLIENT APPOINTMENTS
  // ============================================================

  const loadAppointments = async (clientId = authenticatedUserId) => {
    if (!clientId) {
      setAppointments([]);
      return;
    }

    setIsLoadingAppointments(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/appointments/client/${encodeURIComponent(clientId)}`,
        {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const message = await parseApiError(response, "Randevular getirilemedi.");
        throw new Error(message);
      }

      const data = await response.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Appointments load error:", err);
      setAppointments([]);
      setError(err?.message || "Randevular yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingAppointments(false);
    }
  };

  // ============================================================
  // GET ACTIVE SUBSCRIBED EXPERTS (UNIQUE BY EXPERT_ID)
  // ============================================================

  const loadExperts = async () => {
    setIsLoadingExperts(true);

    try {
      const response = await fetch(
        `${API_BASE}/api/appointments/client/experts`,
        {
          method: "GET",
          credentials: "include",
          headers: getAuthHeaders(),
          cache: "no-store",
        }
      );

      if (!response.ok) {
        const message = await parseApiError(response, "Aktif uzmanlar getirilemedi.");
        throw new Error(message);
      }

      const data = await response.json();
      const rawExperts = Array.isArray(data) ? data : [];

      const uniqueExpertsMap = new Map();
      rawExperts.forEach((expert) => {
        if (expert && expert.expert_id && !uniqueExpertsMap.has(expert.expert_id)) {
          uniqueExpertsMap.set(expert.expert_id, expert);
        }
      });
      const uniqueExperts = Array.from(uniqueExpertsMap.values());

      setExperts(uniqueExperts);

      setNewAppt((previous) => {
        if (!previous.expertId) return previous;
        const selectedExists = uniqueExperts.some(
          (expert) => String(expert?.expert_id) === String(previous.expertId)
        );
        return {
          ...previous,
          expertId: selectedExists ? previous.expertId : "",
        };
      });
    } catch (err) {
      console.error("Experts load error:", err);
      setExperts([]);
      setError(err?.message || "Aktif uzmanlar yüklenirken bir hata oluştu.");
    } finally {
      setIsLoadingExperts(false);
    }
  };

  // ============================================================
  // REFRESH ALL DATA
  // ============================================================

  const refreshData = async () => {
    setError("");
    setSuccessMessage("");

    if (!authenticatedUserId) {
      await loadCurrentUser();
      return;
    }

    await Promise.all([loadAppointments(authenticatedUserId), loadExperts()]);
  };

  // ============================================================
  // OPEN & CLOSE MODAL
  // ============================================================

  const openAppointmentModal = async () => {
    setError("");
    setSuccessMessage("");
    setNewAppt({
      expertId: "",
      date: "",
      time: "",
      appointmentType: "online",
      note: "",
    });
    setIsModalOpen(true);
    await loadExperts();
  };

  const closeAppointmentModal = () => {
    if (isSubmitting) return;
    setIsModalOpen(false);
    setNewAppt({
      expertId: "",
      date: "",
      time: "",
      appointmentType: "online",
      note: "",
    });
  };

  // ============================================================
  // UTILS
  // ============================================================

  const getInitials = (fullName) => {
    if (!fullName) return "U";
    return (
      String(fullName)
        .trim()
        .split(/\s+/)
        .filter((part) => !["dr", "dr.", "uzm", "uzm."].includes(part.toLowerCase()))
        .map((part) => part.charAt(0))
        .join("")
        .toUpperCase()
        .slice(0, 2) || "U"
    );
  };

  const formatTurkishDate = (rawDate) => {
    if (!rawDate) return "-";
    const parsed = new Date(rawDate);
    if (Number.isNaN(parsed.getTime())) return String(rawDate);
    return parsed.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatTimeSlot = (timeSlot) => {
    if (!timeSlot) return "-";
    const raw = String(timeSlot).trim();
    if (raw.includes("-")) return raw;
    const start = raw.slice(0, 5);
    if (!/^\d{2}:\d{2}$/.test(start)) return raw;
    const [hour, minute] = start.split(":").map(Number);
    if (!Number.isInteger(hour) || !Number.isInteger(minute)) return raw;
    const totalMinutes = hour * 60 + minute + 45;
    const endHour = Math.floor(totalMinutes / 60) % 24;
    const endMinute = totalMinutes % 60;
    return `${start} - ${String(endHour).padStart(2, "0")}:${String(endMinute).padStart(2, "0")}`;
  };

  const getStatusInfo = (status) => {
    switch (status) {
      case "approved":
      case "confirmed":
        return { label: "✓ Onaylandı", className: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/30" };
      case "pending":
        return { label: "⏳ Onay Bekliyor", className: "bg-amber-500/15 text-amber-400 border border-amber-500/30" };
      case "rejected":
        return { label: "✕ Reddedildi", className: "bg-red-500/15 text-red-400 border border-red-500/30" };
      case "cancelled":
        return { label: "İptal Edildi", className: "bg-slate-500/15 text-slate-400 border border-slate-500/30" };
      case "completed":
        return { label: "Tamamlandı", className: "bg-blue-500/15 text-blue-400 border border-blue-500/30" };
      default:
        return { label: status || "Bilinmiyor", className: "bg-slate-500/15 text-slate-400 border border-slate-500/30" };
    }
  };

  const getAppointmentTypeInfo = (type) => {
    if (type === "online") return { label: "Online Görüşme", icon: Video };
    if (type === "in_person") return { label: "Yüz Yüze Görüşme", icon: MapPin };
    return { label: type || "Görüşme", icon: Calendar };
  };

  // ============================================================
  // CREATE APPOINTMENT
  // ============================================================

  const handleCreateAppointment = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    if (!authenticatedUserId) {
      setError("Kullanıcı oturumu doğrulanamadı. Lütfen tekrar giriş yapın.");
      return;
    }
    if (!newAppt.expertId) return setError("Lütfen bir uzman seçin.");
    if (!newAppt.date) return setError("Lütfen randevu tarihi seçin.");
    if (!newAppt.time) return setError("Lütfen seans saatini seçin.");
    if (!newAppt.appointmentType) return setError("Lütfen görüşme türünü seçin.");

    const expertExists = experts.some(
      (expert) => String(expert?.expert_id) === String(newAppt.expertId)
    );
    if (!expertExists) {
      setError("Seçilen uzman artık aktif abonelik listenizde bulunmuyor.");
      return;
    }

    if (newAppt.date < today) {
      setError("Geçmiş bir tarih için randevu oluşturamazsınız.");
      return;
    }

    setIsSubmitting(true);

    try {
      const formattedTimeSlot = newAppt.time.includes("-") 
        ? newAppt.time.split("-")[0].trim() 
        : newAppt.time;

      const payload = {
        expert_id: Number(newAppt.expertId),
        title: "Birebir Görüşme",
        appointment_date: newAppt.date,
        time_slot: formattedTimeSlot,
        appointment_type: newAppt.appointmentType,
        notes: newAppt.note?.trim() || null,
      };

      const response = await fetch(`${API_BASE}/api/appointments/client/create`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders(),
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const message = await parseApiError(response, "Randevu oluşturulamadı.");
        throw new Error(message);
      }

      const data = await response.json();
      setSuccessMessage(data?.message || "Randevu talebiniz başarıyla oluşturuldu.");
      setIsModalOpen(false);
      setNewAppt({ expertId: "", date: "", time: "", appointmentType: "online", note: "" });
      await loadAppointments(authenticatedUserId);
    } catch (err) {
      console.error("Create appointment error:", err);
      setError(err?.message || "Randevu oluşturulurken bir hata oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // DELETE APPOINTMENT
  // ============================================================

  const handleDeleteAppointment = async (appointmentId) => {
    if (!appointmentId) return;
    if (!window.confirm("Bu randevuyu silmek istediğinize emin misiniz?")) return;

    setError("");
    setSuccessMessage("");
    setDeletingAppointmentId(appointmentId);

    try {
      const response = await fetch(
        `${API_BASE}/api/appointments/${encodeURIComponent(appointmentId)}`,
        {
          method: "DELETE",
          credentials: "include",
          headers: getAuthHeaders(),
        }
      );

      if (!response.ok) {
        const message = await parseApiError(response, "Randevu silinemedi.");
        throw new Error(message);
      }

      const data = await response.json();
      setSuccessMessage(data?.message || "Randevu başarıyla silindi.");
      if (authenticatedUserId) await loadAppointments(authenticatedUserId);
    } catch (err) {
      console.error("Delete appointment error:", err);
      setError(err?.message || "Randevu silinirken bir hata oluştu.");
    } finally {
      setDeletingAppointmentId(null);
    }
  };

  // ============================================================
  // RENDER
  // ============================================================

  if (isLoadingUser) {
    return (
      <div className="bg-[#181D45]/80 border border-slate-700/60 rounded-2xl p-10 flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
        <p className="text-sm text-slate-400 mt-3">Kullanıcı bilgileriniz yükleniyor...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-[#181D45]/90 border border-slate-700/60 p-5 sm:p-6 rounded-2xl shadow-lg backdrop-blur-md">
        <div>
          <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-400" /> Aktif Randevularım
          </h3>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Aboneliğiniz bulunan uzmanlarla oluşturduğunuz seansları buradan takip edebilirsiniz.
          </p>
        </div>
        <div className="flex w-full sm:w-auto gap-2">
          <button
            type="button"
            onClick={refreshData}
            disabled={isLoadingAppointments || isLoadingExperts}
            className="px-3.5 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            title="Yenile"
          >
            <RefreshCw className={`w-4 h-4 ${isLoadingAppointments || isLoadingExperts ? "animate-spin" : ""}`} />
          </button>
          <button
            type="button"
            onClick={openAppointmentModal}
            className="flex-1 sm:flex-none px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shrink-0 cursor-pointer shadow-md"
          >
            <Plus className="w-4 h-4 stroke-[2.5]" /> Yeni Randevu Oluştur
          </button>
        </div>
      </div>

      {/* MESSAGES */}
      {successMessage && (
        <div className="flex items-start gap-3 bg-emerald-500/10 border border-emerald-500/25 rounded-xl p-4 text-emerald-300">
          <CheckCircle2 className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{successMessage}</p>
          <button type="button" onClick={() => setSuccessMessage("")} className="ml-auto text-emerald-400 hover:text-emerald-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {error && (
        <div className="flex items-start gap-3 bg-red-500/10 border border-red-500/25 rounded-xl p-4 text-red-300">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <p className="text-sm font-medium">{error}</p>
          <button type="button" onClick={() => setError("")} className="ml-auto text-red-400 hover:text-red-300 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* APPOINTMENT LIST */}
      {isLoadingAppointments ? (
        <div className="bg-[#181D45]/80 border border-slate-700/60 rounded-2xl p-10 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-400 animate-spin" />
          <p className="text-sm text-slate-400 mt-3">Randevularınız yükleniyor...</p>
        </div>
      ) : appointments.length === 0 ? (
        <div className="bg-[#181D45]/80 border border-slate-700/60 rounded-2xl p-8 sm:p-12 flex flex-col items-center justify-center text-center">
          <div className="w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
            <Calendar className="w-7 h-7 text-indigo-400" />
          </div>
          <h4 className="text-base sm:text-lg font-bold text-white mt-4">Henüz randevunuz bulunmuyor</h4>
          <p className="text-xs sm:text-sm text-slate-400 max-w-md mt-2">
            Aktif aboneliğiniz bulunan uzmanlardan biriyle yeni bir seans talebi oluşturabilirsiniz.
          </p>
          <button
            type="button"
            onClick={openAppointmentModal}
            className="mt-5 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Yeni Randevu Oluştur
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {appointments.map((appt) => {
            const statusInfo = getStatusInfo(appt?.status);
            const typeInfo = getAppointmentTypeInfo(appt?.appointment_type);
            const TypeIcon = typeInfo.icon;
            const expertName = appt?.expert_name || [appt?.first_name, appt?.last_name].filter(Boolean).join(" ").trim() || "Uzman";
            const expertRole = appt?.expert_title || "Vitalis Uzmanı";
            const expertPhoto = appt?.expert_profile_photo || appt?.profile_photo || null;
            const isApproved = appt?.status === "approved" || appt?.status === "confirmed";
            const isRejected = appt?.status === "rejected";
            const isOnline = appt?.appointment_type === "online";
            const isInPerson = appt?.appointment_type === "in_person";

            return (
              <div key={appt?.id} className="bg-[#181D45]/80 border border-slate-700/60 hover:border-slate-500 rounded-2xl p-5 sm:p-6 shadow-md transition-all duration-200 flex flex-col justify-between space-y-5">
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className={`text-[10px] font-bold px-3 py-1 rounded-md uppercase tracking-wider ${statusInfo.className}`}>
                      {statusInfo.label}
                    </span>
                    <span className="text-xs font-medium text-slate-400 truncate flex items-center gap-1.5">
                      <TypeIcon className="w-3.5 h-3.5 shrink-0" /> {typeInfo.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-3.5 pt-1">
                    <div className="w-11 h-11 rounded-xl bg-slate-800 border border-slate-600 text-indigo-300 font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden">
                      {expertPhoto ? (
                        <img src={expertPhoto} alt={expertName} className="w-full h-full object-cover" onError={(e) => { e.currentTarget.style.display = "none"; }} />
                      ) : (
                        getInitials(expertName)
                      )}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-base font-bold text-white truncate">{expertName}</h4>
                      <p className="text-xs text-slate-400 truncate">{expertRole}</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div className="bg-[#11142D]/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                      <Calendar className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Tarih</p>
                        <p className="text-xs font-semibold text-slate-200 truncate">{formatTurkishDate(appt?.appointment_date)}</p>
                      </div>
                    </div>
                    <div className="bg-[#11142D]/80 p-3 rounded-xl border border-slate-800 flex items-center gap-2.5">
                      <Clock className="w-4 h-4 text-indigo-400 shrink-0" />
                      <div className="overflow-hidden">
                        <p className="text-[10px] text-slate-400 font-semibold uppercase">Saat</p>
                        <p className="text-xs font-semibold text-slate-200 truncate">{formatTimeSlot(appt?.time_slot)}</p>
                      </div>
                    </div>
                  </div>

                  {appt?.notes && (
                    <div className="bg-[#11142D]/60 border border-slate-800 rounded-xl px-3.5 py-3">
                      <p className="text-[10px] text-slate-500 font-semibold uppercase mb-1">Görüşme Notu</p>
                      <p className="text-xs text-slate-300 line-clamp-2">{appt.notes}</p>
                    </div>
                  )}

                  {/* RED SEBEBİ BÖLÜMÜ */}
                  {isRejected && (
                    <div className="bg-red-500/10 border border-red-500/25 rounded-xl px-3.5 py-3">
                      <p className="text-[10px] text-red-400 font-semibold uppercase mb-1 flex items-center gap-1">
                        <XCircle className="w-3 h-3" /> Red Nedeni
                      </p>
                      <p className="text-xs text-red-200 font-medium">
                        {appt?.rejection_reason || "Belirtilen bir neden bulunmuyor."}
                      </p>
                    </div>
                  )}
                </div>

                <div className="pt-2 space-y-2">
                  {isApproved && isOnline && appt?.meeting_link && (
                    <a href={appt.meeting_link} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                      <Video className="w-4 h-4" /> Görüşmeye Katıl
                    </a>
                  )}
                  {isApproved && isInPerson && appt?.location_link && (
                    <a href={appt.location_link} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-sm">
                      <MapPin className="w-4 h-4" /> Konuma Git
                    </a>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDeleteAppointment(appt?.id)}
                    disabled={deletingAppointmentId === appt?.id}
                    className="w-full py-2.5 bg-slate-900/50 hover:bg-red-500/10 border border-slate-800 hover:border-red-500/25 text-slate-500 hover:text-red-400 font-medium text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {deletingAppointmentId === appt?.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                    Randevuyu Sil
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* NEW APPOINTMENT MODAL */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto top-0 left-0 right-0 bottom-0 m-0"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) closeAppointmentModal();
          }}
        >
          <div
            className="bg-[#181D45] border border-slate-700 shadow-2xl rounded-2xl max-w-lg w-full p-5 sm:p-7 relative space-y-5 text-slate-100 my-auto max-h-[90vh] overflow-y-auto"
            onMouseDown={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-slate-700/80 pb-4">
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" /> Yeni Randevu Talebi
              </h3>
              <button
                type="button"
                onClick={closeAppointmentModal}
                disabled={isSubmitting}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-600 flex items-center justify-center text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAppointment} className="space-y-4">
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1.5 block">Uzman Seçimi</label>
                {isLoadingExperts ? (
                  <div className="w-full bg-[#11142D] border border-slate-700 rounded-xl px-3.5 py-3 text-sm text-slate-400 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Aktif uzmanlar yükleniyor...
                  </div>
                ) : experts.length === 0 ? (
                  <div className="w-full bg-[#11142D] border border-amber-500/20 rounded-xl px-3.5 py-3 text-xs text-amber-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>Aktif aboneliğiniz bulunan bir uzman bulunmuyor.</span>
                  </div>
                ) : (
                  <select
                    required
                    value={newAppt.expertId}
                    onChange={(e) => setNewAppt((prev) => ({ ...prev, expertId: e.target.value }))}
                    className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium outline-none transition-all cursor-pointer [color-scheme:dark]"
                  >
                    <option value="" className="bg-[#11142D] text-slate-400">Uzman seçin</option>
                    {experts.map((expert) => (
                      <option key={expert.expert_id} value={expert.expert_id} className="bg-[#11142D] text-slate-200">
                        {expert.full_name || [expert.first_name, expert.last_name].filter(Boolean).join(" ") || "Uzman"}
                        {expert.expert_title ? ` (${expert.expert_title})` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="appointment-date" className="text-xs font-semibold text-slate-300 mb-1.5 block">Tercih Edilen Tarih</label>
                  <input
                    id="appointment-date"
                    type="date"
                    required
                    min={today}
                    value={newAppt.date}
                    onChange={(e) => setNewAppt((prev) => ({ ...prev, date: e.target.value }))}
                    className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium outline-none [color-scheme:dark]"
                  />
                </div>
                <div>
                  <label htmlFor="appointment-time" className="text-xs font-semibold text-slate-300 mb-1.5 block">Seans Saati</label>
                  <select
                    id="appointment-time"
                    required
                    value={newAppt.time}
                    onChange={(e) => setNewAppt((prev) => ({ ...prev, time: e.target.value }))}
                    className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 font-medium outline-none transition-all cursor-pointer [color-scheme:dark]"
                  >
                    <option value="" className="bg-[#11142D] text-slate-400">Seans Saati Seçin</option>
                    {SESSION_TIMES.map((timeSlot) => (
                      <option key={timeSlot} value={timeSlot} className="bg-[#11142D] text-slate-200">
                        {timeSlot}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-300 mb-2 block">Görüşme Türü</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setNewAppt((prev) => ({ ...prev, appointmentType: "online" }))}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${newAppt.appointmentType === "online" ? "bg-indigo-500/10 border-indigo-500/50 text-white" : "bg-[#11142D] border-slate-700 text-slate-400"}`}
                  >
                    <div className="flex items-center gap-2">
                      <Video className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold">Online</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewAppt((prev) => ({ ...prev, appointmentType: "in_person" }))}
                    className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all ${newAppt.appointmentType === "in_person" ? "bg-indigo-500/10 border-indigo-500/50 text-white" : "bg-[#11142D] border-slate-700 text-slate-400"}`}
                  >
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-indigo-400" />
                      <span className="text-xs font-semibold">Yüz Yüze</span>
                    </div>
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="appointment-note" className="text-xs font-semibold text-slate-300 mb-1.5 block">Görüşme Notu / Hedef</label>
                <textarea
                  id="appointment-note"
                  rows={3}
                  maxLength={2000}
                  placeholder="Kısaca görüşmek istediğiniz konuyu belirtin..."
                  value={newAppt.note}
                  onChange={(e) => setNewAppt((prev) => ({ ...prev, note: e.target.value }))}
                  className="w-full bg-[#11142D] border border-slate-700 focus:border-indigo-500 rounded-xl p-3 text-sm text-slate-200 font-medium outline-none resize-none"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button type="button" onClick={closeAppointmentModal} disabled={isSubmitting} className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-600 text-slate-300 font-semibold text-xs sm:text-sm rounded-xl transition-all cursor-pointer">
                  Vazgeç
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || isLoadingExperts || experts.length === 0 || !authenticatedUserId}
                  className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs sm:text-sm rounded-xl shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer transition-all"
                >
                  {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Calendar className="w-4 h-4" />}
                  Randevu Talebi Gönder
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}