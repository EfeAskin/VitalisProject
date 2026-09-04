"use client";

import React, {
  useState,
  useEffect,
  useMemo,
  useCallback
} from "react";
import {
  Headphones,
  Plus,
  AlertCircle,
  CheckCircle2,
  Clock,
  ShieldAlert,
  X,
  Search,
  ChevronRight,
  Send,
  ArrowUpRight,
  Loader2,
  RefreshCw
} from "lucide-react";

// =========================================================================
// AUTH TOKEN YARDIMCILARI
// =========================================================================

const getAuthToken = (currentUser) => {
  if (currentUser) {
    const candidate =
      currentUser.token ||
      currentUser.access_token ||
      currentUser.accessToken ||
      currentUser.jwt ||
      currentUser.auth_token ||
      currentUser.session?.access_token ||
      currentUser.session?.accessToken;

    if (
      candidate &&
      candidate !== "undefined" &&
      candidate !== "null" &&
      typeof candidate === "string" &&
      candidate.trim() !== ""
    ) {
      return candidate.startsWith("Bearer ")
        ? candidate
            .replace(/^Bearer\s+/i, "")
            .trim()
        : candidate.trim();
    }
  }

  if (
    typeof window === "undefined" ||
    typeof document === "undefined"
  ) {
    return null;
  }

  const storageKeys = [
    "access_token",
    "token",
    "jwt",
    "accessToken",
    "auth_token"
  ];

  for (const key of storageKeys) {
    const value =
      localStorage.getItem(key) ||
      sessionStorage.getItem(key);

    if (
      value &&
      value !== "undefined" &&
      value !== "null" &&
      value.trim() !== ""
    ) {
      return value.startsWith("Bearer ")
        ? value
            .replace(/^Bearer\s+/i, "")
            .trim()
        : value.trim();
    }
  }

  const cookieNames = [
    "access_token",
    "token",
    "jwt",
    "auth_token",
    "accessToken"
  ];

  for (const name of cookieNames) {
    const match = document.cookie.match(
      new RegExp(
        `(?:^|; )${name}=([^;]*)`
      )
    );

    if (match?.[1]) {
      let token = decodeURIComponent(
        match[1]
      ).trim();

      if (
        token &&
        token !== "undefined" &&
        token !== "null"
      ) {
        if (token.startsWith("Bearer ")) {
          token = token.replace(
            /^Bearer\s+/i,
            ""
          );
        }

        return token;
      }
    }
  }

  return null;
};

const getAuthHeaders = (
  currentUser,
  contentType = null
) => {
  const headers = {};

  if (contentType) {
    headers["Content-Type"] =
      contentType;
  }

  const token =
    getAuthToken(currentUser);

  if (token) {
    headers["Authorization"] =
      `Bearer ${token.replace(
        /^Bearer\s+/i,
        ""
      )}`;
  }

  return headers;
};

// =========================================================================
// SUPPORT TAB
// =========================================================================

export default function SupportTab({
  currentUser = null,
  onCountChange = () => {}
}) {
  const [tickets, setTickets] =
    useState([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState(null);

  const [
    isTicketModalOpen,
    setIsTicketModalOpen
  ] = useState(false);

  const [
    selectedTicket,
    setSelectedTicket
  ] = useState(null);

  const [
    ticketMessages,
    setTicketMessages
  ] = useState([]);

  const [
    loadingMessages,
    setLoadingMessages
  ] = useState(false);

  const [
    filterStatus,
    setFilterStatus
  ] = useState("all");

  const [
    searchQuery,
    setSearchQuery
  ] = useState("");

  const [
    replyText,
    setReplyText
  ] = useState("");

  const [
    submitting,
    setSubmitting
  ] = useState(false);

  const [
    replying,
    setReplying
  ] = useState(false);

  const [
    newTicket,
    setNewTicket
  ] = useState({
    subject: "",
    category: "Teknik Destek",
    priority: "Normal",
    message: ""
  });

  // =========================================================================
  // 1. BİLETLERİ ÇEKME
  // =========================================================================

  const fetchTickets =
    useCallback(async () => {
      const currentUserId =
        currentUser?.id ||
        currentUser?._id ||
        currentUser?.user_id;

      if (!currentUserId) {
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const res = await fetch(
          "/api/v1/tickets",
          {
            method: "GET",
            headers:
              getAuthHeaders(
                currentUser
              ),
            credentials: "include",
            cache: "no-store"
          }
        );

        if (!res.ok) {
          let errorMessage =
            "Destek talepleri yüklenirken bir hata oluştu.";

          try {
            const errorData =
              await res.json();

            if (
              errorData?.detail
            ) {
              errorMessage =
                errorData.detail;
            }
          } catch {
            // JSON hata gövdesi yoksa varsayılan mesaj korunur.
          }

          throw new Error(
            errorMessage
          );
        }

        const data =
          await res.json();

        const ticketList =
          Array.isArray(data)
            ? data
            : [];

        setTickets(ticketList);

        const openCount =
          ticketList.filter(
            (ticket) =>
              ticket.status ===
                "İşlemde" ||
              ticket.status ===
                "Açık"
          ).length;

        onCountChange(
          openCount
        );
      } catch (err) {
        console.error(
          "Tickets fetch error:",
          err
        );

        setError(
          err.message ||
            "Veriler alınamadı."
        );

        onCountChange(0);
      } finally {
        setLoading(false);
      }
    }, [
      currentUser,
      onCountChange
    ]);

  useEffect(() => {
    fetchTickets();
  }, [fetchTickets]);

  // =========================================================================
  // 2. BİLET MESAJLARINI ÇEKME
  // =========================================================================

  const fetchTicketMessages =
    useCallback(
      async (ticketId) => {
        if (!ticketId) {
          return;
        }

        setLoadingMessages(true);

        try {
          const res = await fetch(
            `/api/v1/tickets/${ticketId}/messages`,
            {
              method: "GET",
              headers:
                getAuthHeaders(
                  currentUser
                ),
              credentials: "include",
              cache: "no-store"
            }
          );

          if (!res.ok) {
            let errorMessage =
              "Mesajlar yüklenemedi.";

            try {
              const errorData =
                await res.json();

              if (
                errorData?.detail
              ) {
                errorMessage =
                  errorData.detail;
              }
            } catch {
              // Varsayılan mesaj korunur.
            }

            throw new Error(
              errorMessage
            );
          }

          const data =
            await res.json();

          setTicketMessages(
            Array.isArray(data)
              ? data
              : []
          );
        } catch (err) {
          console.error(
            "Messages fetch error:",
            err
          );
        } finally {
          setLoadingMessages(
            false
          );
        }
      },
      [currentUser]
    );

  const handleSelectTicket = (
    ticket
  ) => {
    setSelectedTicket(ticket);
    setReplyText("");
    fetchTicketMessages(
      ticket.id
    );
  };

  // =========================================================================
  // 3. METRİK HESAPLAMALARI
  // =========================================================================

  const stats = useMemo(() => {
    const total =
      tickets.length;

    const processing =
      tickets.filter(
        (t) =>
          t.status ===
            "İşlemde" ||
          t.status === "Açık"
      ).length;

    const resolved =
      tickets.filter(
        (t) =>
          t.status ===
            "Çözüldü" ||
          t.status === "Kapalı"
      ).length;

    return {
      total,
      processing,
      resolved
    };
  }, [tickets]);

  // =========================================================================
  // 4. FİLTRELENMİŞ TICKET LİSTESİ
  // =========================================================================

  const filteredTickets =
    useMemo(() => {
      return tickets.filter(
        (ticket) => {
          const status =
            ticket.status ||
            "İşlemde";

          const subject =
            ticket.subject || "";

          const id =
            ticket.ticket_code ||
            String(ticket.id);

          const category =
            ticket.category ||
            "";

          const normalizedSearch =
            searchQuery.toLowerCase();

          const matchesStatus =
            filterStatus ===
            "all"
              ? true
              : filterStatus ===
                "İşlemde"
              ? status ===
                  "İşlemde" ||
                status === "Açık"
              : status ===
                  "Çözüldü" ||
                status === "Kapalı";

          const matchesSearch =
            subject
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            id
              .toLowerCase()
              .includes(
                normalizedSearch
              ) ||
            category
              .toLowerCase()
              .includes(
                normalizedSearch
              );

          return (
            matchesStatus &&
            matchesSearch
          );
        }
      );
    }, [
      tickets,
      filterStatus,
      searchQuery
    ]);

  // =========================================================================
  // 5. YENİ BİLET OLUŞTURMA
  // =========================================================================

  const handleCreateTicket =
    async (e) => {
      e.preventDefault();

      if (
        !newTicket.subject.trim() ||
        !newTicket.message.trim()
      ) {
        return;
      }

      setSubmitting(true);

      try {
        const res = await fetch(
          "/api/v1/tickets",
          {
            method: "POST",
            headers:
              getAuthHeaders(
                currentUser,
                "application/json"
              ),
            credentials: "include",
            body: JSON.stringify(
              newTicket
            )
          }
        );

        if (!res.ok) {
          let errorMessage =
            "Bilet oluşturulurken bir hata meydana geldi.";

          try {
            const errorData =
              await res.json();

            if (
              errorData?.detail
            ) {
              errorMessage =
                errorData.detail;
            }
          } catch {
            // Varsayılan hata mesajı korunur.
          }

          throw new Error(
            errorMessage
          );
        }

        await fetchTickets();

        setIsTicketModalOpen(
          false
        );

        setNewTicket({
          subject: "",
          category:
            "Teknik Destek",
          priority: "Normal",
          message: ""
        });
      } catch (err) {
        console.error(
          "Ticket oluşturma hatası:",
          err
        );

        alert(
          err.message ||
            "Bilet oluşturulamadı."
        );
      } finally {
        setSubmitting(
          false
        );
      }
    };

  // =========================================================================
  // 6. MESAJ GÖNDERME
  // =========================================================================

  const handleSendReply =
    async (e) => {
      e.preventDefault();

      if (
        !replyText.trim() ||
        !selectedTicket
      ) {
        return;
      }

      setReplying(true);

      try {
        const res = await fetch(
          `/api/v1/tickets/${selectedTicket.id}/messages`,
          {
            method: "POST",
            headers:
              getAuthHeaders(
                currentUser,
                "application/json"
              ),
            credentials: "include",
            body: JSON.stringify({
              message_text:
                replyText
            })
          }
        );

        if (!res.ok) {
          let errorMessage =
            "Yanıt gönderilemedi.";

          try {
            const errData =
              await res.json();

            if (
              errData?.detail
            ) {
              errorMessage =
                errData.detail;
            }
          } catch {
            // Varsayılan mesaj korunur.
          }

          throw new Error(
            errorMessage
          );
        }

        const newMessage =
          await res.json();

        setTicketMessages(
          (prev) => [
            ...prev,
            newMessage
          ]
        );

        setReplyText("");

        // Güncel ticket updated_at ve durum verisini al.
        await fetchTickets();
      } catch (err) {
        console.error(
          "Ticket mesaj gönderme hatası:",
          err
        );

        alert(
          err.message ||
            "Yanıt gönderilemedi."
        );
      } finally {
        setReplying(
          false
        );
      }
    };

  // =========================================================================
  // 7. TARİH FORMATLAMA
  // =========================================================================

  const formatDate = (
    dateStr
  ) => {
    if (!dateStr) {
      return "-";
    }

    try {
      return new Date(
        dateStr
      ).toLocaleDateString(
        "tr-TR",
        {
          day: "numeric",
          month: "long",
          hour: "2-digit",
          minute: "2-digit"
        }
      );
    } catch {
      return dateStr;
    }
  };

  // =========================================================================
  // UI
  // =========================================================================

  return (
    <div className="space-y-6 animate-fadeIn">

      {/* ÜST STATS VE BAŞLIK BAR */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">

        <div className="lg:col-span-7 bg-gradient-to-br from-slate-900/90 via-slate-900/70 to-purple-950/20 border border-slate-800/90 backdrop-blur-2xl p-6 rounded-3xl shadow-xl flex flex-col justify-between relative overflow-hidden group">
          <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl group-hover:bg-purple-600/20 transition-all duration-500" />

          <div className="space-y-2 relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/30 text-purple-400 text-xs font-black uppercase tracking-wider">
              <Headphones className="w-3.5 h-3.5" />
              VIP Destek Merkezi
            </div>

            <h2 className="text-xl font-heading font-black text-white">
              Platform & Klinik Yönetim Desteği
            </h2>

            <p className="text-xs font-medium text-slate-400 max-w-xl leading-relaxed">
              Teknik aksaklıklar, danışan süreçleri ve ödemeler ile ilgili taleplerinizi doğrudan yönetim ekibine iletebilirsiniz.
            </p>
          </div>

          <div className="pt-6 relative z-10 flex items-center gap-3">
            <button
              onClick={() =>
                setIsTicketModalOpen(
                  true
                )
              }
              className="px-6 py-3.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-heading font-black text-xs rounded-2xl transition-all duration-300 shadow-[0_0_25px_rgba(147,51,234,0.3)] hover:shadow-[0_0_35px_rgba(147,51,234,0.5)] flex items-center gap-2 shrink-0 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              YENİ DESTEK TALEBİ OLUŞTUR
            </button>

            <button
              onClick={
                fetchTickets
              }
              disabled={loading}
              className="p-3.5 bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 rounded-2xl transition-all flex items-center justify-center active:scale-95 disabled:opacity-50"
              title="Yenile"
            >
              <RefreshCw
                className={`w-4 h-4 ${
                  loading
                    ? "animate-spin"
                    : ""
                }`}
              />
            </button>
          </div>
        </div>

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
                Aktif Talepler
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
                Sonuçlandırıldı
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
                  Acil Destek Hattı
                </h4>

                <p className="text-[11px] font-medium text-slate-400">
                  7/24 Canlı Destek Ekibi
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

      {/* ARAMA & FİLTRELEME BAR */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800/90 backdrop-blur-xl p-4 rounded-3xl">
        <div className="relative flex-grow max-w-md">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-3.5" />

          <input
            type="text"
            placeholder="Ticket koda, konuya veya kategoriye göre ara..."
            value={searchQuery}
            onChange={(e) =>
              setSearchQuery(
                e.target.value
              )
            }
            className="w-full bg-slate-950/90 border border-slate-800 rounded-2xl pl-10 pr-4 py-2.5 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-purple-500 transition-all font-medium"
          />
        </div>

        <div className="flex items-center gap-1.5 bg-slate-950/80 p-1 rounded-2xl border border-slate-800/80 shrink-0">

          <button
            onClick={() =>
              setFilterStatus("all")
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all ${
              filterStatus === "all"
                ? "bg-purple-600 text-white shadow-md shadow-purple-600/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Tüm Talepler (
            {stats.total}
            )
          </button>

          <button
            onClick={() =>
              setFilterStatus(
                "İşlemde"
              )
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all ${
              filterStatus === "İşlemde"
                ? "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            İşlemde (
            {stats.processing}
            )
          </button>

          <button
            onClick={() =>
              setFilterStatus(
                "Çözüldü"
              )
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-heading font-extrabold transition-all ${
              filterStatus === "Çözüldü"
                ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Çözüldü (
            {stats.resolved}
            )
          </button>
        </div>
      </div>

      {/* TICKET LİSTESİ TABLOSU */}
      <div className="bg-slate-900/80 border border-slate-800/90 backdrop-blur-2xl rounded-3xl p-6 shadow-2xl overflow-hidden">

        {loading ? (
          <div className="py-16 text-center text-slate-400 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
            <p className="text-xs font-bold">
              Destek talepleri yükleniyor...
            </p>
          </div>
        ) : error ? (
          <div className="py-12 text-center text-rose-400 flex flex-col items-center justify-center gap-2">
            <AlertCircle className="w-8 h-8 text-rose-500" />

            <p className="font-bold text-xs">
              {error}
            </p>

            <button
              onClick={
                fetchTickets
              }
              className="mt-2 px-4 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white hover:bg-slate-800 transition-all"
            >
              Tekrar Dene
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">

              <thead>
                <tr className="border-b border-slate-800/80 text-[10px] font-heading font-black text-slate-500 uppercase tracking-wider">
                  <th className="pb-4 px-4">
                    TICKET CODE
                  </th>

                  <th className="pb-4 px-4">
                    KONU BAŞLIĞI
                  </th>

                  <th className="pb-4 px-4">
                    KATEGORİ
                  </th>

                  <th className="pb-4 px-4">
                    ÖNCELİK
                  </th>

                  <th className="pb-4 px-4">
                    TARİH
                  </th>

                  <th className="pb-4 px-4">
                    DURUM
                  </th>

                  <th className="pb-4 px-4 text-right">
                    İŞLEM
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800/50 text-xs font-medium">

                {filteredTickets.length === 0 ? (
                  <tr>
                    <td
                      colSpan={7}
                      className="py-12 text-center text-slate-500"
                    >
                      <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />

                      <p className="font-bold">
                        Henüz oluşturulmuş bilet bulunmuyor.
                      </p>
                    </td>
                  </tr>
                ) : (
                  filteredTickets.map(
                    (t) => {
                      const isResolved =
                        t.status ===
                        "Çözüldü";

                      return (
                        <tr
                          key={t.id}
                          onClick={() =>
                            handleSelectTicket(
                              t
                            )
                          }
                          className="hover:bg-slate-950/60 transition-all cursor-pointer group"
                        >
                          <td className="py-4 px-4 font-mono font-bold text-purple-400 group-hover:text-purple-300">
                            {t.ticket_code}
                          </td>

                          <td className="py-4 px-4 font-heading font-bold text-white max-w-xs truncate">
                            {t.subject}
                          </td>

                          <td className="py-4 px-4 text-slate-300">
                            {t.category}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                                t.priority ===
                                "Yüksek"
                                  ? "bg-rose-500/10 text-rose-400 border border-rose-500/30"
                                  : t.priority ===
                                    "Orta"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                                  : "bg-blue-500/10 text-blue-400 border border-blue-500/30"
                              }`}
                            >
                              {t.priority}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-slate-400">
                            {formatDate(
                              t.created_at
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span
                              className={`px-3 py-1 rounded-full text-[10px] font-heading font-black uppercase flex items-center gap-1.5 w-fit ${
                                isResolved
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/30"
                                  : "bg-amber-500/10 text-amber-400 border border-amber-500/30"
                              }`}
                            >
                              {isResolved ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <Clock className="w-3 h-3 animate-spin-slow" />
                              )}

                              {t.status}
                            </span>
                          </td>

                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={(
                                e
                              ) => {
                                e.stopPropagation();

                                handleSelectTicket(
                                  t
                                );
                              }}
                              className="p-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700 transition-all"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      );
                    }
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* YENİ TICKET OLUŞTURMA MODALI */}
      {isTicketModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 md:p-8 shadow-2xl relative space-y-6">

            <div className="flex items-center justify-between">
              <h3 className="text-lg font-heading font-black text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-purple-500" />
                Yeni Bilet Oluştur
              </h3>

              <button
                onClick={() =>
                  setIsTicketModalOpen(
                    false
                  )
                }
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form
              onSubmit={
                handleCreateTicket
              }
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                  KONU BAŞLIĞI
                </label>

                <input
                  type="text"
                  required
                  placeholder="Yaşadığınız sorunu kısaca özetleyin..."
                  value={
                    newTicket.subject
                  }
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      subject:
                        e.target.value
                    })
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
                    value={
                      newTicket.category
                    }
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        category:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Teknik Destek">
                      Teknik Destek
                    </option>

                    <option value="Ödeme & Hakediş">
                      Ödeme & Hakediş
                    </option>

                    <option value="Danışan Süreci">
                      Danışan Süreci
                    </option>

                    <option value="Diğer">
                      Diğer
                    </option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                    ÖNCELİK
                  </label>

                  <select
                    value={
                      newTicket.priority
                    }
                    onChange={(e) =>
                      setNewTicket({
                        ...newTicket,
                        priority:
                          e.target.value
                      })
                    }
                    className="w-full bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-bold"
                  >
                    <option value="Düşük">
                      Düşük
                    </option>

                    <option value="Normal">
                      Normal
                    </option>

                    <option value="Yüksek">
                      Yüksek
                    </option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-400 mb-1.5 block">
                  AÇIKLAMA
                </label>

                <textarea
                  rows="4"
                  required
                  placeholder="Detayları buraya yazın..."
                  value={
                    newTicket.message
                  }
                  onChange={(e) =>
                    setNewTicket({
                      ...newTicket,
                      message:
                        e.target.value
                    })
                  }
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs text-white focus:outline-none focus:border-purple-500 resize-none font-medium"
                />
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() =>
                    setIsTicketModalOpen(
                      false
                    )
                  }
                  className="flex-1 py-3 bg-slate-950 border border-slate-800 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-2xl transition-all"
                >
                  VAZGEÇ
                </button>

                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-heading font-black text-xs rounded-2xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {submitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    "GÖNDER"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TICKET DETAY & MESAJLAŞMA MODALI */}
      {selectedTicket && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 md:p-8 shadow-2xl relative flex flex-col max-h-[85vh]">

            <div className="flex items-start justify-between border-b border-slate-800 pb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-xs font-bold text-purple-400">
                    {
                      selectedTicket.ticket_code
                    }
                  </span>

                  <span className="text-slate-500">
                    ·
                  </span>

                  <span className="text-xs font-bold text-slate-400">
                    {
                      selectedTicket.category
                    }
                  </span>
                </div>

                <h3 className="text-base font-heading font-black text-white">
                  {
                    selectedTicket.subject
                  }
                </h3>
              </div>

              <button
                onClick={() =>
                  setSelectedTicket(
                    null
                  )
                }
                className="w-8 h-8 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-400 hover:text-white shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Mesaj Akışı */}
            <div className="py-6 space-y-4 overflow-y-auto flex-grow custom-scrollbar pr-1">

              {loadingMessages ? (
                <div className="py-8 text-center text-slate-400 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-purple-500" />
                </div>
              ) : ticketMessages.length === 0 ? (
                <p className="text-center text-xs text-slate-500 py-4">
                  Henüz mesaj bulunmuyor.
                </p>
              ) : (
                ticketMessages.map(
                  (msg) => (
                    <div
                      key={msg.id}
                      className="flex flex-col items-start"
                    >
                      <div className="flex items-center gap-2 mb-1 text-[10px] text-slate-400 font-bold">
                        <span>
                          Gönderen ID:{" "}
                          {
                            msg.sender_id
                          }
                        </span>

                        <span>
                          ·
                        </span>

                        <span>
                          {formatDate(
                            msg.sent_at
                          )}
                        </span>
                      </div>

                      <div className="bg-slate-950 border border-slate-800 text-slate-200 p-4 rounded-2xl text-xs font-medium max-w-md">
                        {
                          msg.message_text
                        }
                      </div>
                    </div>
                  )
                )
              )}
            </div>

            {/* Yanıt Paneli */}
            {selectedTicket.status ===
            "Çözüldü" ? (
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl text-center text-xs text-slate-400 font-bold">
                Bu bilet çözüldüğü için yeni mesaj gönderilemez.
              </div>
            ) : (
              <form
                onSubmit={
                  handleSendReply
                }
                className="pt-4 border-t border-slate-800 flex gap-2"
              >
                <input
                  type="text"
                  placeholder="Yanıtınızı yazın..."
                  value={replyText}
                  onChange={(e) =>
                    setReplyText(
                      e.target.value
                    )
                  }
                  className="flex-grow bg-slate-950 border border-slate-800 rounded-2xl px-4 py-3 text-xs text-white focus:outline-none focus:border-purple-500 font-medium"
                />

                <button
                  type="submit"
                  disabled={
                    !replyText.trim() ||
                    replying
                  }
                  className="px-5 py-3 bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white rounded-2xl font-bold text-xs transition-all flex items-center gap-1.5 shrink-0"
                >
                  {replying ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}

                  Gönder
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}