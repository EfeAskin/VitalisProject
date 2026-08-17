"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  Headphones, 
  Plus, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  ShieldAlert, 
  X, 
  Send, 
  Loader2, 
  User, 
  RefreshCw,
  Search,
  ChevronRight,
  PhoneCall
} from "lucide-react";

// =========================================================================
// AUTH HELPER FONKSİYONLARI
// =========================================================================
const getAuthToken = () => {
  if (typeof window === "undefined" || typeof document === "undefined") {
    return null;
  }

  const storageKeys = ["access_token", "token", "jwt", "accessToken", "auth_token"];
  for (const key of storageKeys) {
    const value = localStorage.getItem(key) || sessionStorage.getItem(key);
    if (value && value !== "undefined" && value !== "null" && value.trim() !== "") {
      return value.startsWith("Bearer ") ? value.replace(/^Bearer\s+/i, "").trim() : value.trim();
    }
  }

  const cookieNames = ["access_token", "token", "jwt", "auth_token", "accessToken"];
  for (const name of cookieNames) {
    const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
    if (match?.[1]) {
      let token = decodeURIComponent(match[1]).trim();
      if (token && token !== "undefined" && token !== "null") {
        return token.startsWith("Bearer ") ? token.replace(/^Bearer\s+/i, "").trim() : token;
      }
    }
  }

  return null;
};

const getAuthHeaders = (contentType = "application/json") => {
  const headers = {};
  if (contentType) {
    headers["Content-Type"] = contentType;
  }
  const token = getAuthToken();
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Tarih Formatlayıcı
const formatDate = (dateStr) => {
  if (!dateStr) return "Bugün";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString("tr-TR", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });
  } catch {
    return dateStr;
  }
};

// Saat Formatlayıcı
const formatTime = (dateStr) => {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return dateStr;
  }
};

export default function SupportTab({ currentUser, onCountChange }) {
  // Backend verileri
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Arama ve Filtreleme State'leri (Expert Tasarımındaki Yapı)
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all"); // 'all' | 'in_progress' | 'resolved'

  // Bilet Detay & Mesajlaşma Modal State'leri
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [ticketMessages, setTicketMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessageText, setNewMessageText] = useState("");
  const [sendingMessage, setSendingMessage] = useState(false);

  // Form State
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Teknik Destek",
    priority: "Normal",
    message: ""
  });

  // 1. TICKET LISTESINI BACKEND'DEN CEKME
  const fetchTickets = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/v1/tickets", {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : (data.tickets || []);
        setTickets(list);

        // Aktif (çözülmemiş) destek talebi sayısını üst componente aktarma
        if (onCountChange) {
          const openCount = list.filter((t) => t.status !== "Çözüldü").length;
          onCountChange(openCount);
        }
      } else {
        console.warn("Ticket listesi alınamadı:", res.status);
      }
    } catch (err) {
      console.error("Fetch tickets error:", err);
    } finally {
      setLoading(false);
    }
  }, [onCountChange]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // 2. YENI TICKET OLUSTURMA (POST /api/v1/tickets)
  const handleCreateTicket = async (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;

    setSubmitting(true);
    try {
      const res = await fetch("/api/v1/tickets", {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        credentials: "include",
        body: JSON.stringify(newTicket)
      });

      if (res.ok) {
        setIsTicketModalOpen(false);
        setNewTicket({
          subject: "",
          category: "Teknik Destek",
          priority: "Normal",
          message: ""
        });
        await fetchTickets();
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Destek talebi oluşturulurken bir hata meydana geldi.");
      }
    } catch (err) {
      console.error("Ticket create error:", err);
      alert("Sunucuya bağlanırken bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  // 3. TICKET DETAY & MESAJLARINI CEKME
  const fetchTicketMessages = async (ticketId) => {
    setLoadingMessages(true);
    try {
      const res = await fetch(`/api/v1/tickets/${ticketId}/messages`, {
        method: "GET",
        headers: getAuthHeaders(),
        credentials: "include",
        cache: "no-store"
      });

      if (res.ok) {
        const data = await res.json();
        setTicketMessages(Array.isArray(data) ? data : (data.messages || []));
      }
    } catch (err) {
      console.error("Fetch ticket messages error:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  const handleOpenTicketDetail = (ticket) => {
    setSelectedTicket(ticket);
    fetchTicketMessages(ticket.id);
  };

  // 4. TICKET'A MESAJ GÖNDERME
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMessageText.trim() || !selectedTicket) return;

    setSendingMessage(true);
    try {
      const res = await fetch(`/api/v1/tickets/${selectedTicket.id}/messages`, {
        method: "POST",
        headers: getAuthHeaders("application/json"),
        credentials: "include",
        body: JSON.stringify({ message_text: newMessageText })
      });

      if (res.ok) {
        setNewMessageText("");
        await fetchTicketMessages(selectedTicket.id);
      } else {
        alert("Mesaj gönderilemedi.");
      }
    } catch (err) {
      console.error("Send ticket message error:", err);
    } finally {
      setSendingMessage(false);
    }
  };

  const currentUserId = currentUser?.id || currentUser?._id || currentUser?.user_id;

  // Sayısal Hesaplamalar (Expert Görünümündeki İstatistik Kartları İçin)
  const inProgressCount = tickets.filter((t) => t.status !== "Çözüldü").length;
  const resolvedCount = tickets.filter((t) => t.status === "Çözüldü").length;
  const totalCount = tickets.length;

  // Arama ve Tab Filtreleme Mantığı
  const filteredTickets = tickets.filter((t) => {
    const ticketCode = t.ticket_code || `VTS-${t.id}`;
    const matchesSearch =
      ticketCode.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (t.subject && t.subject.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (t.category && t.category.toLowerCase().includes(searchTerm.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterStatus === "in_progress") return t.status !== "Çözüldü";
    if (filterStatus === "resolved") return t.status === "Çözüldü";
    return true;
  });

  return (
    <div className="space-y-6 animate-fadeIn font-sans text-slate-100">
      
      {/* 🚀 ÜST GRID SİSTEMİ (EXPERT PANELİ İLE BİREBİR AYNI DÜZEN) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* SOL BÖLÜM: VIP Destek Merkezi Kartı (Lg: 7 Kolon) */}
        <div className="lg:col-span-7 bg-[#141523]/80 border border-purple-500/20 rounded-3xl p-6 sm:p-7 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute -top-16 -left-16 w-40 h-40 bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />
          
          <div className="relative z-10 space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-300 text-[10px] font-black uppercase tracking-widest">
              <Headphones className="w-3.5 h-3.5 text-purple-400" />
              <span>VIP DESTEK MERKEZİ</span>
            </div>

            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Müşteri & Danışan Hizmetleri Desteği
            </h2>

            <p className="text-xs sm:text-sm text-purple-200/70 leading-relaxed max-w-xl font-medium">
              Teknik aksaklıklar, üyelik süreçleri ve randevular ile ilgili tüm taleplerinizi doğrudan VIP yönetici ve teknik ekibimize iletebilirsiniz.
            </p>
          </div>

          <div className="relative z-10 mt-6 pt-4 flex items-center gap-3">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="flex-1 sm:flex-initial px-6 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 active:scale-95 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(168,85,247,0.4)] hover:shadow-[0_0_35px_rgba(168,85,247,0.6)] flex items-center justify-center gap-2 cursor-pointer border border-purple-400/40"
            >
              <Plus className="w-4 h-4 stroke-[3]" /> YENİ DESTEK TALEBİ OLUŞTUR
            </button>

            <button
              onClick={fetchTickets}
              title="Listeyi Yenile"
              className="p-3.5 bg-[#0D0E17] border border-purple-500/30 hover:border-purple-400 text-purple-300 hover:text-white rounded-2xl transition-all cursor-pointer shadow-inner"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>
          </div>
        </div>

        {/* SAĞ BÖLÜM: İstatistik Kartları & Acil Destek Hattı (Lg: 5 Kolon) */}
        <div className="lg:col-span-5 flex flex-col justify-between gap-4">
          
          {/* İki Sayısal Gösterge Kartı */}
          <div className="grid grid-cols-2 gap-4">
            
            {/* Kart 1: İşlemde Olan */}
            <div className="bg-[#141523]/80 border border-purple-500/20 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-400">
                  İŞLEMDE OLAN
                </span>
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20">
                  <Clock className="w-4 h-4 text-amber-400" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white tracking-tight">{inProgressCount}</span>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Aktif Talepler</p>
              </div>
            </div>

            {/* Kart 2: Çözülen Talepler */}
            <div className="bg-[#141523]/80 border border-purple-500/20 rounded-3xl p-5 backdrop-blur-xl relative overflow-hidden flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-black uppercase tracking-wider text-emerald-400">
                  ÇÖZÜLEN TALEPLER
                </span>
                <div className="p-2 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-black text-white tracking-tight">{resolvedCount}</span>
                <p className="text-[10px] font-bold text-slate-400 mt-0.5">Sonuçlandırıldı</p>
              </div>
            </div>

          </div>

          {/* Acil Destek Hattı Kartı */}
          <div className="bg-[#141523]/80 border border-purple-500/20 rounded-3xl p-5 backdrop-blur-xl flex items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                <PhoneCall className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-black text-white">Acil Destek Hattı</h4>
                <p className="text-[11px] font-medium text-slate-400">7/24 Canlı Destek Ekibi</p>
              </div>
            </div>

            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-4 py-2.5 bg-[#0D0E17] hover:bg-purple-950/40 border border-purple-500/30 hover:border-purple-400 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shrink-0"
            >
              <span>Bağlan</span>
              <ChevronRight className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>

        </div>

      </div>

      {/* 🔍 ARAMA & TAB FİLTRELEME ÇUBUĞU (EXPERT PANELDEN UYARLANDI) */}
      <div className="bg-[#141523]/80 border border-purple-500/20 rounded-2xl p-3 backdrop-blur-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        
        {/* Arama Inputu */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-purple-300/50" />
          <input
            type="text"
            placeholder="Ticket koda, konuya veya kategoriye göre ara..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#0D0E17] border border-purple-500/20 focus:border-purple-400 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-purple-300/30 font-medium outline-none transition-all"
          />
        </div>

        {/* Tab Butonları */}
        <div className="flex items-center gap-1.5 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === "all"
                ? "bg-purple-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.4)]"
                : "bg-[#0D0E17] text-slate-400 hover:text-white border border-purple-500/10"
            }`}
          >
            Tüm Talepler ({totalCount})
          </button>

          <button
            onClick={() => setFilterStatus("in_progress")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === "in_progress"
                ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.2)]"
                : "bg-[#0D0E17] text-slate-400 hover:text-white border border-purple-500/10"
            }`}
          >
            İşlemde ({inProgressCount})
          </button>

          <button
            onClick={() => setFilterStatus("resolved")}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all whitespace-nowrap cursor-pointer ${
              filterStatus === "resolved"
                ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.2)]"
                : "bg-[#0D0E17] text-slate-400 hover:text-white border border-purple-500/10"
            }`}
          >
            Çözüldü ({resolvedCount})
          </button>
        </div>

      </div>

      {/* 📊 TICKET LISTESI TABLOSU (EXPERT TABLO YAPISINA UYGUN) */}
      <div className="bg-[#141523]/80 border border-purple-500/20 rounded-3xl p-5 sm:p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden relative">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 text-purple-300 gap-3">
            <Loader2 className="w-8 h-8 animate-spin text-fuchsia-400" />
            <span className="text-xs font-bold tracking-widest uppercase">Destek talepleri yükleniyor...</span>
          </div>
        ) : filteredTickets.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <AlertCircle className="w-10 h-10 text-purple-400/40 mx-auto" />
            <p className="text-sm font-bold text-purple-200">Aranan kriterlere uygun destek talebi bulunamadı.</p>
            <p className="text-xs text-purple-300/50 max-w-sm mx-auto">
              Filtrelerinizi değiştirebilir veya yeni bir destek talebi oluşturabilirsiniz.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-purple-500/20 text-[10px] font-black text-purple-300/70 uppercase tracking-widest bg-purple-950/20">
                  <th className="pb-4 pt-2 px-4">TICKET CODE</th>
                  <th className="pb-4 pt-2 px-4">KONU BAŞLIĞI</th>
                  <th className="pb-4 pt-2 px-4">KATEGORİ</th>
                  <th className="pb-4 pt-2 px-4">ÖNCELİK</th>
                  <th className="pb-4 pt-2 px-4">TARİH</th>
                  <th className="pb-4 pt-2 px-4">DURUM</th>
                  <th className="pb-4 pt-2 px-4 text-right">İŞLEM</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-purple-500/10 text-xs">
                {filteredTickets.map((t) => (
                  <tr 
                    key={t.id} 
                    onClick={() => handleOpenTicketDetail(t)}
                    className="hover:bg-purple-500/10 transition-all duration-200 group cursor-pointer"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-fuchsia-400 drop-shadow-[0_0_8px_rgba(217,70,239,0.4)]">
                      {t.ticket_code || `VTS-${t.id}`}
                    </td>
                    <td className="py-4 px-4 font-bold text-white group-hover:text-purple-200 transition-colors">
                      {t.subject}
                    </td>
                    <td className="py-4 px-4 text-purple-200/80 font-medium">
                      {t.category}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider inline-block ${
                        t.priority === "Yüksek" 
                          ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-[0_0_12px_rgba(244,63,94,0.3)]" 
                          : "bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-[0_0_12px_rgba(6,182,212,0.3)]"
                      }`}>
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-purple-300/70 font-medium whitespace-nowrap">
                      {formatDate(t.created_at || t.date)}
                    </td>
                    <td className="py-4 px-4">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1.5 w-fit ${
                        t.status === "Çözüldü" 
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]" 
                          : "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.3)]"
                      }`}>
                        {t.status === "Çözüldü" ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                        )}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <div className="w-7 h-7 rounded-lg bg-[#0D0E17] border border-purple-500/20 flex items-center justify-center text-purple-300 group-hover:text-white group-hover:border-purple-400 transition-all inline-flex">
                        <ChevronRight className="w-4 h-4" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* 🚀 YENİ TICKET OLUŞTURMA MODALI */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#1C1A2E] to-[#11121C] border border-purple-500/40 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative space-y-6 text-slate-100">
            
            {/* Modal Başlığı */}
            <div className="flex items-center justify-between border-b border-purple-500/20 pb-4">
              <h3 className="text-lg sm:text-xl font-black text-white flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                  <ShieldAlert className="w-5 h-5 text-purple-400" />
                </div>
                Destek Talebi Oluştur
              </h3>
              <button 
                onClick={() => setIsTicketModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-[#0D0E17] border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Formu */}
            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                  KONU BAŞLIĞI
                </label>
                <input 
                  type="text"
                  required
                  placeholder="Yaşadığınız durumu özetleyin..."
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket({...newTicket, subject: e.target.value})}
                  className="w-full bg-[#0D0E17] border border-purple-500/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 rounded-2xl px-4 py-3 text-xs text-white placeholder-purple-300/40 font-medium outline-none transition-all"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                    KATEGORİ
                  </label>
                  <select 
                    value={newTicket.category}
                    onChange={(e) => setNewTicket({...newTicket, category: e.target.value})}
                    className="w-full bg-[#0D0E17] border border-purple-500/30 focus:border-purple-400 rounded-2xl px-4 py-3 text-xs text-white font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="Teknik Destek" className="bg-[#141523] text-white">Teknik Destek</option>
                    <option value="Fatura & Üyelik" className="bg-[#141523] text-white">Fatura & Üyelik</option>
                    <option value="Antrenman/Diyet" className="bg-[#141523] text-white">Antrenman/Diyet</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                    ÖNCELİK SEVİYESİ
                  </label>
                  <select 
                    value={newTicket.priority}
                    onChange={(e) => setNewTicket({...newTicket, priority: e.target.value})}
                    className="w-full bg-[#0D0E17] border border-purple-500/30 focus:border-purple-400 rounded-2xl px-4 py-3 text-xs text-white font-bold outline-none transition-all cursor-pointer"
                  >
                    <option value="Düşük" className="bg-[#141523] text-white">Düşük</option>
                    <option value="Normal" className="bg-[#141523] text-white">Normal</option>
                    <option value="Yüksek" className="bg-[#141523] text-white">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-black text-purple-300 uppercase tracking-wider mb-1.5 block">
                  DETAYLI AÇIKLAMA
                </label>
                <textarea 
                  rows="4"
                  required
                  placeholder="Lütfen sistem hatasını veya talebinizi detaylıca yazın..."
                  value={newTicket.message}
                  onChange={(e) => setNewTicket({...newTicket, message: e.target.value})}
                  className="w-full bg-[#0D0E17] border border-purple-500/30 focus:border-purple-400 focus:ring-1 focus:ring-purple-400/50 rounded-2xl p-4 text-xs text-white placeholder-purple-300/40 font-medium outline-none resize-none transition-all"
                />
              </div>

              <div className="pt-3 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-3.5 bg-[#0D0E17] border border-purple-500/30 hover:bg-purple-950/40 text-purple-200 font-bold text-xs tracking-wider uppercase rounded-2xl transition-all cursor-pointer"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3.5 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-black text-xs tracking-wider uppercase rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.4)] hover:shadow-[0_0_30px_rgba(168,85,247,0.6)] cursor-pointer border border-purple-400/40 flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      GÖNDERİLİYOR...
                    </>
                  ) : (
                    "TICKET GÖNDER"
                  )}
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* 💬 TICKET DETAY & CANLI MESAJLAŞMA MODALI */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-gradient-to-b from-[#1C1A2E] to-[#11121C] border border-purple-500/40 rounded-3xl max-w-2xl w-full h-[85vh] flex flex-col shadow-[0_0_50px_rgba(168,85,247,0.3)] relative text-slate-100 overflow-hidden">
            
            {/* Ticket Header */}
            <div className="p-5 sm:p-6 border-b border-purple-500/20 bg-[#141523]/90 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-fuchsia-400">
                    {selectedTicket.ticket_code || `VTS-${selectedTicket.id}`}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase ${
                    selectedTicket.status === "Çözüldü" 
                      ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40" 
                      : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                  }`}>
                    {selectedTicket.status}
                  </span>
                </div>
                <h3 className="text-sm sm:text-base font-black text-white">{selectedTicket.subject}</h3>
                <p className="text-[11px] text-purple-300/60 font-medium">
                  Kategori: {selectedTicket.category} • Öncelik: {selectedTicket.priority}
                </p>
              </div>

              <button 
                onClick={() => setSelectedTicket(null)}
                className="w-9 h-9 rounded-xl bg-[#0D0E17] border border-purple-500/30 flex items-center justify-center text-purple-300 hover:text-white hover:border-purple-400 transition-all cursor-pointer shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Ticket Chat Messages Area */}
            <div className="flex-1 p-5 sm:p-6 overflow-y-auto space-y-4 no-scrollbar">
              {loadingMessages ? (
                <div className="flex items-center justify-center h-full text-purple-300 gap-2">
                  <Loader2 className="w-5 h-5 animate-spin text-fuchsia-400" />
                  <span className="text-xs font-bold uppercase tracking-wider">Mesajlar yükleniyor...</span>
                </div>
              ) : ticketMessages.length === 0 ? (
                <div className="flex items-center justify-center h-full text-purple-300/50 text-xs font-semibold">
                  Bu bilet için henüz mesaj bulunmuyor.
                </div>
              ) : (
                ticketMessages.map((msg) => {
                  const isMe = String(msg.sender_id) === String(currentUserId);
                  return (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${isMe ? "items-end" : "items-start"} space-y-1`}
                    >
                      <div className="flex items-center gap-1.5 text-[10px] text-purple-300/60 font-bold px-1">
                        {isMe ? (
                          <><span>Siz</span><User className="w-3 h-3 text-fuchsia-400" /></>
                        ) : (
                          <>
                            <div className="w-3.5 h-3.5 rounded-full bg-purple-500/20 border border-purple-400/50 flex items-center justify-center text-[8px] font-black text-purple-300">
                              A
                            </div>
                            <span>Destek / Admin</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatTime(msg.sent_at || msg.created_at)}</span>
                      </div>

                      <div className={`p-3.5 rounded-2xl max-w-[85%] text-xs leading-relaxed font-medium ${
                        isMe 
                          ? "bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white shadow-[0_0_15px_rgba(168,85,247,0.3)] rounded-tr-none" 
                          : "bg-[#0D0E17] border border-purple-500/30 text-purple-100 rounded-tl-none"
                      }`}>
                        {msg.message_text}
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Ticket Input Footer */}
            <form onSubmit={handleSendMessage} className="p-4 border-t border-purple-500/20 bg-[#0D0E17]/90 flex gap-3">
              <input 
                type="text"
                placeholder={selectedTicket.status === "Çözüldü" ? "Bu talep çözüldü olarak işaretlendi..." : "Bir yanıt yazın..."}
                disabled={selectedTicket.status === "Çözüldü" || sendingMessage}
                value={newMessageText}
                onChange={(e) => setNewMessageText(e.target.value)}
                className="flex-1 bg-[#141523] border border-purple-500/30 focus:border-purple-400 rounded-2xl px-4 py-3 text-xs text-white placeholder-purple-300/40 font-medium outline-none transition-all disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={selectedTicket.status === "Çözüldü" || sendingMessage || !newMessageText.trim()}
                className="px-5 py-3 bg-gradient-to-r from-purple-600 to-fuchsia-600 hover:from-purple-500 hover:to-fuchsia-500 text-white rounded-2xl font-black text-xs transition-all shadow-[0_0_15px_rgba(168,85,247,0.4)] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {sendingMessage ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>

          </div>
        </div>
      )}

    </div>
  );
}