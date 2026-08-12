"use client";

import React, { useState, useMemo } from "react";
import {
  Headphones,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  Search,
  MessageSquare,
  LifeBuoy,
  ChevronRight,
  Send,
  Sparkles,
  ArrowUpRight,
  Filter,
} from "lucide-react";

export default function SupportTab() {
  const [isTicketModalOpen, setIsTicketModalOpen] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [replyText, setReplyText] = useState("");

  const [tickets, setTickets] = useState([
    {
      id: "VTS-8842",
      subject: "Danışan Rapor Modülünde Veri Senkronizasyonu",
      category: "Teknik & Platform Hatası",
      priority: "Yüksek",
      status: "Çözüldü",
      date: "22 Temmuz 2026",
      updatedAt: "22 Temmuz 2026, 16:45",
      messages: [
        {
          id: 1,
          sender: "user",
          senderName: "Siz (Uzman)",
          text: "Danışan haftalık raporunu dışa aktarmak istediğimde grafik senkronizasyonu gecikiyor.",
          time: "14:10",
        },
        {
          id: 2,
          sender: "admin",
          senderName: "Vitalis Teknik Destek Ekibi",
          text: "Merhaba Kamil Bey, sunucu önbelleği yenilendi ve senkronizasyon servisi güncellendi. Lütfen tekrar kontrol edin.",
          time: "16:45",
        },
      ],
    },
    {
      id: "VTS-9104",
      subject: "Aylık Uzmanlık Hakediş & Ödeme Sorgusu",
      category: "Hakediş & Ödeme",
      priority: "Orta",
      status: "İşleniyor",
      date: "23 Temmuz 2026",
      updatedAt: "Bugün, 11:20",
      messages: [
        {
          id: 1,
          sender: "user",
          senderName: "Siz (Uzman)",
          text: "Bu ayki VIP paket ödemelerinin hesabıma aktarım tarihi hakkında bilgi alabilir miyim?",
          time: "10:00",
        },
        {
          id: 2,
          sender: "admin",
          senderName: "Vitalis Finans Departmanı",
          text: "Talebiniz inceleniyor. Hakediş transferleri her ayın 25'inde otomatik gerçekleştirilmektedir.",
          time: "11:20",
        },
      ],
    },
    {
      id: "VTS-9320",
      subject: "Diş Hekimliği & Danışan Profil Entegrasyonu",
      category: "Profil & Uzmanlık Onayı",
      priority: "Normal",
      status: "İşleniyor",
      date: "05 Ağustos 2026",
      updatedAt: "Dün, 15:30",
      messages: [
        {
          id: 1,
          sender: "user",
          senderName: "Siz (Uzman)",
          text: "Klinik uzmanlık belgelerimin rozet onay sürecini hızlandırmak istiyorum.",
          time: "15:30",
        },
      ],
    },
  ]);

  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "Teknik & Platform Hatası",
    priority: "Normal",
    message: "",
  });

  // Metrik Hesaplamaları
  const stats = useMemo(() => {
    const total = tickets.length;
    const processing = tickets.filter((t) => t.status === "İşleniyor").length;
    const resolved = tickets.filter((t) => t.status === "Çözüldü").length;
    return { total, processing, resolved };
  }, [tickets]);

  // Filtrelenmiş Ticket Listesi
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      const matchesStatus =
        filterStatus === "all" || ticket.status === filterStatus;
      const matchesSearch =
        ticket.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        ticket.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [tickets, filterStatus, searchQuery]);

  // Yeni Ticket Oluşturma
  const handleCreateTicket = (e) => {
    e.preventDefault();
    if (!newTicket.subject.trim() || !newTicket.message.trim()) return;

    const newId = `VTS-${Math.floor(1000 + Math.random() * 9000)}`;
    const created = {
      id: newId,
      subject: newTicket.subject,
      category: newTicket.category,
      priority: newTicket.priority,
      status: "İşleniyor",
      date: "Bugün",
      updatedAt: "Şimdi",
      messages: [
        {
          id: Date.now(),
          sender: "user",
          senderName: "Siz (Uzman)",
          text: newTicket.message,
          time: new Date().toLocaleTimeString("tr-TR", {
            hour: "2-digit",
            minute: "2-digit",
          }),
        },
      ],
    };

    setTickets([created, ...tickets]);
    setIsTicketModalOpen(false);
    setNewTicket({
      subject: "",
      category: "Teknik & Platform Hatası",
      priority: "Normal",
      message: "",
    });
  };

  // Ticket İçi Yanıt Gönderme
  const handleSendReply = (e) => {
    e.preventDefault();
    if (!replyText.trim() || !selectedTicket) return;

    const timeStr = new Date().toLocaleTimeString("tr-TR", {
      hour: "2-digit",
      minute: "2-digit",
    });

    const updatedMessage = {
      id: Date.now(),
      sender: "user",
      senderName: "Siz (Uzman)",
      text: replyText,
      time: timeStr,
    };

    const updatedTickets = tickets.map((t) => {
      if (t.id === selectedTicket.id) {
        return {
          ...t,
          updatedAt: `Bugün, ${timeStr}`,
          messages: [...t.messages, updatedMessage],
        };
      }
      return t;
    });

    setTickets(updatedTickets);
    setSelectedTicket((prev) => ({
      ...prev,
      messages: [...prev.messages, updatedMessage],
    }));
    setReplyText("");
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* 🚀 ÜST STATS VE BAŞLIK BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Başlık & Eylem Kartı */}
        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-purple-950/20 border border-slate-800/90 backdrop-blur-2xl p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-500" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider">
              <LifeBuoy className="w-3.5 h-3.5 animate-spin-slow" /> VIP Uzman Destek Merkezi
            </div>
            <h2 className="text-xl font-heading font-black text-white">
              Platform & Klinik Yönetim Desteği
            </h2>
            <p className="text-xs font-medium text-slate-400 max-w-xl leading-relaxed">
              Ödemeler, danışan yönetimi, teknik entegrasyonlar veya uzmanlık rozeti talepleriniz için Vitalis Admin ekibinden 7/24 öncelikli destek alın.
            </p>
          </div>

          <div className="pt-6 relative z-10">
            <button
              onClick={() => setIsTicketModalOpen(true)}
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-black text-xs rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(147,51,234,0.3)] hover:shadow-[0_0_35px_rgba(147,51,234,0.5)] flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" /> YENİ DESTEK TALEBİ OLUŞTUR
            </button>
          </div>
        </div>

        {/* Metrik Kartları Grid */}
        <div className="lg:col-span-5 grid grid-cols-2 gap-4">
          <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-5 rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider">
                İşlemde Olan
              </span>
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="w-4 h-4 animate-pulse" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-heading font-black text-white mt-2">
                {stats.processing}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                Ort. Yanıt Süresi: 18 Dk
              </p>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-5 rounded-3xl flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider">
                Çözülen Talepler
              </span>
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <h3 className="text-2xl font-heading font-black text-white mt-2">
                {stats.resolved}
              </h3>
              <p className="text-[10px] font-bold text-slate-500 mt-0.5">
                %100 Memnuniyet Oranı
              </p>
            </div>
          </div>

          <div className="col-span-2 bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-4 rounded-3xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400 flex items-center justify-center font-bold">
                <Headphones className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs font-heading font-extrabold text-white">
                  Acil Klinik Hattı
                </h4>
                <p className="text-[11px] font-medium text-slate-400">
                  Canlı VIP Uzman Asistan Temsilcisi
                </p>
              </div>
            </div>
            <button className="px-3.5 py-2 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all">
              <span>Bağlan</span>
              <ArrowUpRight className="w-3.5 h-3.5 text-purple-400" />
            </button>
          </div>
        </div>
      </div>

      {/* 🔍 ARAMA & FİLTRELEME BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-4 rounded-3xl">
        {/* Arama Input */}
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />
          <input
            type="text"
            placeholder="Ticket ID, konu veya kategori ara..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all font-medium"
          />
        </div>

        {/* Filtre Tabları */}
        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 shrink-0">
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all ${
              filterStatus === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tüm Talepler ({stats.total})
          </button>
          <button
            onClick={() => setFilterStatus("İşleniyor")}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all ${
              filterStatus === "İşleniyor"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            İşleniyor ({stats.processing})
          </button>
          <button
            onClick={() => setFilterStatus("Çözüldü")}
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all ${
              filterStatus === "Çözüldü"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Çözüldü ({stats.resolved})
          </button>
        </div>
      </div>

      {/* 📋 TICKET LİSTESİ TABLOSU */}
      <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl overflow-hidden">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/80 text-[10px] font-heading font-black text-slate-500 uppercase tracking-wider">
                <th className="pb-4 px-4">TICKET ID</th>
                <th className="pb-4 px-4">KONU BAŞLIĞI</th>
                <th className="pb-4 px-4">KATEGORİ</th>
                <th className="pb-4 px-4">ÖNCELİK</th>
                <th className="pb-4 px-4">TARİH</th>
                <th className="pb-4 px-4">DURUM</th>
                <th className="pb-4 px-4 text-right">İŞLEM</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/50 text-xs font-medium">
              {filteredTickets.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500">
                    <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="font-bold">Aramanızla eşleşen destek talebi bulunamadı.</p>
                  </td>
                </tr>
              ) : (
                filteredTickets.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTicket(t)}
                    className="hover:bg-slate-950/60 transition-all cursor-pointer group"
                  >
                    <td className="py-4 px-4 font-mono font-bold text-purple-400 group-hover:text-purple-300">
                      {t.id}
                    </td>
                    <td className="py-4 px-4 font-heading font-bold text-white max-w-xs truncate">
                      {t.subject}
                    </td>
                    <td className="py-4 px-4 text-slate-300">{t.category}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          t.priority === "Yüksek"
                            ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                            : t.priority === "Orta"
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                            : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                        }`}
                      >
                        {t.priority}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-slate-400">{t.date}</td>
                    <td className="py-4 px-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase flex items-center gap-1.5 w-fit ${
                          t.status === "Çözüldü"
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.15)]"
                            : "bg-amber-500/10 text-amber-400 border border-amber-500/30 shadow-[0_0_10px_rgba(245,158,11,0.15)]"
                        }`}
                      >
                        {t.status === "Çözüldü" ? (
                          <CheckCircle2 className="w-3 h-3" />
                        ) : (
                          <Clock className="w-3 h-3 animate-spin-slow" />
                        )}
                        {t.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedTicket(t);
                        }}
                        className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🚀 YENİ TICKET OLUŞTURMA MODALI */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-500" /> Admin Destek Talebi Oluştur
              </h3>
              <button
                onClick={() => setIsTicketModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                  KONU BAŞLIĞI
                </label>
                <input
                  type="text"
                  required
                  placeholder="Yaşadığınız sorunu veya talebi kısaca özetleyin..."
                  value={newTicket.subject}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, subject: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                    KATEGORİ
                  </label>
                  <select
                    value={newTicket.category}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, category: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Teknik & Platform Hatası">Teknik & Platform Hatası</option>
                    <option value="Danışan & Seans Yönetimi">Danışan & Seans Yönetimi</option>
                    <option value="Hakediş & Ödeme">Hakediş & Ödeme</option>
                    <option value="Profil & Uzmanlık Onayı">Profil & Uzmanlık Onayı</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                    ÖNCELİK SEVİYESİ
                  </label>
                  <select
                    value={newTicket.priority}
                    onChange={(e) =>
                      setNewTicket({ ...newTicket, priority: e.target.value })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Düşük">Düşük</option>
                    <option value="Normal">Normal</option>
                    <option value="Yüksek">Yüksek (Acil)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                  DETAYLI AÇIKLAMA
                </label>
                <textarea
                  rows="4"
                  required
                  placeholder="Lütfen durum ile ilgili tüm ayrıntıları belirtin..."
                  value={newTicket.message}
                  onChange={(e) =>
                    setNewTicket({ ...newTicket, message: e.target.value })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsTicketModalOpen(false)}
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition-all"
                >
                  VAZGEÇ
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-black text-xs rounded-2xl transition-all shadow-lg shadow-purple-600/30"
                >
                  TICKET GÖNDER
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 💬 TICKET DETAY & MESAJLAŞMA MODALI */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[85vh]">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {selectedTicket.id}
                  </span>
                  <span className="text-slate-500">·</span>
                  <span className="text-xs font-bold text-slate-400">
                    {selectedTicket.category}
                  </span>
                </div>
                <h3 className="text-base font-heading font-black text-white">
                  {selectedTicket.subject}
                </h3>
              </div>
              <button
                onClick={() => setSelectedTicket(null)}
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Conversation Messages */}
            <div className="py-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar pr-1">
              {selectedTicket.messages.map((msg) => {
                const isAdmin = msg.sender === "admin";

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${
                      isAdmin ? "items-start" : "items-end"
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 font-bold">
                      <span>{msg.senderName}</span>
                      <span>·</span>
                      <span>{msg.time}</span>
                    </div>

                    <div
                      className={`max-w-md p-4 rounded-2xl text-xs font-medium ${
                        isAdmin
                          ? "bg-purple-950/40 border border-purple-500/30 text-purple-100 rounded-tl-xs"
                          : "bg-slate-950 border border-slate-800 text-slate-200 rounded-tr-xs"
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Reply Input Form */}
            <form
              onSubmit={handleSendReply}
              className="pt-4 border-t border-slate-800 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Destek ekibine yanıt yazın..."
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
              />
              <button
                type="submit"
                disabled={!replyText.trim()}
                className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-2xl font-bold text-xs transition-all shadow-lg shadow-purple-600/30 flex items-center gap-1.5 shrink-0"
              >
                <Send className="w-3.5 h-3.5" /> Gönder
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}