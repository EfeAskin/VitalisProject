"use client";

import React, {
  useState,
  useEffect,
  Suspense,
  useCallback,
} from "react";
import {
  useSearchParams,
  useRouter,
  usePathname,
} from "next/navigation";
import {
  Calendar,
  MessageSquare,
  Headphones,
  Sparkles,
  ShieldCheck,
  Loader2,
} from "lucide-react";

import AppointmentsTab from "./components/AppointmentsTab";
import MessagesTab from "./components/MessagesTab";
import SupportTab from "./components/SupportTab";

// =========================================================================
// AUTH TOKEN YARDIMCILARI
// =========================================================================

const getAuthToken = () => {
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
    "auth_token",
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
        ? value.replace(/^Bearer\s+/i, "").trim()
        : value.trim();
    }
  }

  const cookieNames = [
    "access_token",
    "token",
    "jwt",
    "auth_token",
    "accessToken",
  ];

  for (const name of cookieNames) {
    const match = document.cookie.match(
      new RegExp(`(?:^|; )${name}=([^;]*)`)
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
  contentType = null
) => {
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

// =========================================================================
// PAGE CONTENT
// =========================================================================

function ContactContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const [activeTab, setActiveTab] = useState(
    "appointments"
  );

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  // -----------------------------------------------------------------------
  // GERÇEK DİNAMİK BİLDİRİM/OKUNMAMIŞ SAYILARI
  // -----------------------------------------------------------------------

  const [unreadCounts, setUnreadCounts] =
    useState({
      appointments: null,
      messages: 0,
      support: null,
    });

  // =========================================================================
  // CURRENT USER
  // =========================================================================

  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const res = await fetch(
          "/api/auth/me",
          {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include",
            cache: "no-store",
          }
        );

        if (res.ok) {
          const data = await res.json();

          setCurrentUser(
            data.user || data
          );
        } else {
          console.warn(
            "Kullanıcı oturumu doğrulanamadı:",
            res.status
          );
        }
      } catch (err) {
        console.error(
          "Auth me isteği başarısız:",
          err
        );
      } finally {
        setLoadingUser(false);
      }
    };

    fetchCurrentUser();
  }, []);

  // =========================================================================
  // MESAJ SAYISINI GERÇEK BACKEND'DEN HESAPLA
  // =========================================================================

  const fetchMessageCount =
    useCallback(async () => {
      const userId =
        currentUser?.id ||
        currentUser?._id ||
        currentUser?.user_id;

      if (!userId) {
        return;
      }

      try {
        const res = await fetch(
          "/api/v1/messages/chats",
          {
            method: "GET",
            headers: getAuthHeaders(),
            credentials: "include",
            cache: "no-store",
          }
        );

        if (!res.ok) {
          return;
        }

        const data = await res.json();

        if (data.status === "success") {
          const chats =
            data.chats || [];

          const totalUnread =
            chats.reduce(
              (total, chat) =>
                total +
                Number(
                  chat.unread_count || 0
                ),
              0
            );

          setUnreadCounts(
            (prev) => ({
              ...prev,
              messages: totalUnread,
            })
          );
        }
      } catch (err) {
        console.error(
          "Mesaj sayısı alınamadı:",
          err
        );
      }
    }, [currentUser]);

  // İlk mesaj sayısını al
  useEffect(() => {
    fetchMessageCount();
  }, [fetchMessageCount]);

  // =========================================================================
  // MESAJ BİLDİRİMİNİ OTOMATİK YENİLE
  // =========================================================================
  //
  // MessagesTab içerisinde mesaj okunduğunda backend'deki unread_count
  // değişiyor. Page üzerindeki badge ise kendi state'ini tuttuğu için
  // tekrar backend'den okunmadığında eski sayı ekranda kalabiliyordu.
  //
  // Bu nedenle:
  // - Mesajlar sekmesi açıkken düzenli kontrol edilir.
  // - Sayfa tekrar görünür olduğunda anında kontrol edilir.
  // - Browser focus olduğunda anında kontrol edilir.
  // - Sekmeden çıkıldığında interval temizlenir.
  // =========================================================================

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    // İlk kontrol
    fetchMessageCount();

    if (activeTab !== "messages") {
      return;
    }

    const intervalId = setInterval(() => {
      if (
        typeof document !== "undefined" &&
        document.visibilityState === "visible"
      ) {
        fetchMessageCount();
      }
    }, 2000);

    const handleVisibilityChange = () => {
      if (
        document.visibilityState ===
        "visible"
      ) {
        fetchMessageCount();
      }
    };

    const handleWindowFocus = () => {
      fetchMessageCount();
    };

    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );

    window.addEventListener(
      "focus",
      handleWindowFocus
    );

    return () => {
      clearInterval(intervalId);

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );

      window.removeEventListener(
        "focus",
        handleWindowFocus
      );
    };
  }, [
    currentUser,
    activeTab,
    fetchMessageCount,
  ]);

  // =========================================================================
  // URL ?tab= PARAMETRESİNİ YAKALAMA & SENKRONİZASYON
  // =========================================================================

  useEffect(() => {
    const tabParam =
      searchParams.get("tab");

    if (
      [
        "appointments",
        "messages",
        "support",
      ].includes(tabParam)
    ) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  // =========================================================================
  // TAB DEĞİŞTİRME VE URL GÜNCELLEME
  // =========================================================================

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);

    const params =
      new URLSearchParams(
        searchParams.toString()
      );

    params.set("tab", tabKey);

    router.push(
      `${pathname}?${params.toString()}`,
      {
        scroll: false,
      }
    );

    // Mesajlar sekmesine girildiğinde
    // backend'deki güncel unread sayısını hemen çek.
    if (tabKey === "messages") {
      setTimeout(() => {
        fetchMessageCount();
      }, 0);
    }
  };

  // =========================================================================
  // CHILD COMPONENT'LERDEN SAYILARI YAKALAMA
  // =========================================================================

  const handleAppointmentsCount =
    useCallback((count) => {
      setUnreadCounts((prev) => ({
        ...prev,
        appointments:
          Number.isFinite(
            Number(count)
          )
            ? Number(count)
            : 0,
      }));
    }, []);

  const handleSupportCount =
    useCallback((count) => {
      setUnreadCounts((prev) => ({
        ...prev,
        support:
          Number.isFinite(
            Number(count)
          )
            ? Number(count)
            : 0,
      }));
    }, []);

  // =========================================================================
  // PAGE
  // =========================================================================

  return (
    <div className="w-full min-h-screen bg-[#11142D] text-slate-100 font-sans pb-12 sm:pb-20 flex flex-col">
      
      {/* 🚀 ÜST BANNER & SWITCHER KONTROL MERKEZİ */}
      <div className="w-full px-3 sm:px-6 pt-4 sm:pt-8 pb-4 sm:pb-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 bg-[#0B1310]/95 border-2 border-emerald-500/40 hover:border-emerald-400/70 p-5 sm:p-6 md:p-8 rounded-2xl sm:rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(16,185,129,0.15)] backdrop-blur-2xl relative overflow-hidden transition-all duration-300">
          
          <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-emerald-500/15 via-amber-500/10 to-transparent rounded-full blur-3xl pointer-events-none" />

          <div className="space-y-2 text-center md:text-left z-10 w-full md:w-auto">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="px-3.5 py-1 bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-[10px] font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                VITALIS VIP COMMAND & SUPPORT
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight text-white pt-1 drop-shadow-md">
              İletişim & Randevu Merkezi
            </h1>

            <p className="text-xs sm:text-sm font-semibold text-emerald-100/70 max-w-lg leading-relaxed">
              Sertifikalı diyetisyenlerinizle canlı görüşmeler planlayın, AI asistanınızla veya uzmanlarla mesajlaşın ve teknik destek taleplerinizi yönetin.
            </p>
          </div>

          {/* TAB SWITCHER BUTONLARI */}
          <div className="relative flex bg-[#060B09] p-1.5 sm:p-2 rounded-2xl w-full md:w-auto shadow-inner border-2 border-emerald-950 z-10 gap-1.5 overflow-x-auto no-scrollbar">

            {/* RANDEVULARIM */}
            <button
              onClick={() =>
                handleTabChange(
                  "appointments"
                )
              }
              className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 cursor-pointer touch-manipulation whitespace-nowrap ${
                activeTab === "appointments"
                  ? "bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] border border-amber-300"
                  : "text-emerald-300/60 hover:text-white hover:bg-[#0E1A16]"
              }`}
            >
              <Calendar className="w-4 h-4 shrink-0" />

              <span>RANDEVULARIM</span>

              {unreadCounts.appointments !== null &&
                unreadCounts.appointments > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full ${
                      activeTab === "appointments"
                        ? "bg-slate-950 text-amber-400 border border-amber-400/60"
                        : "bg-amber-500/20 text-amber-300 border border-amber-500/40"
                    }`}
                  >
                    {
                      unreadCounts.appointments
                    }
                  </span>
                )}
            </button>

            {/* MESAJLAR */}
            <button
              onClick={() =>
                handleTabChange(
                  "messages"
                )
              }
              className={`flex-1 min-w-[100px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 cursor-pointer touch-manipulation whitespace-nowrap ${
                activeTab === "messages"
                  ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 text-slate-950 shadow-[0_0_20px_rgba(16,185,129,0.4)] border border-emerald-300"
                  : "text-emerald-300/60 hover:text-white hover:bg-[#0E1A16]"
              }`}
            >
              <MessageSquare className="w-4 h-4 shrink-0" />

              <span>MESAJLAR</span>

              {unreadCounts.messages > 0 && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full ${
                    activeTab === "messages"
                      ? "bg-slate-950 text-emerald-400 border border-emerald-400/60"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {
                    unreadCounts.messages
                  }
                </span>
              )}
            </button>

            {/* CANLI DESTEK */}
            <button
              onClick={() =>
                handleTabChange(
                  "support"
                )
              }
              className={`flex-1 min-w-[110px] sm:min-w-0 flex items-center justify-center gap-1.5 sm:gap-2 py-2.5 sm:py-3 px-3 sm:px-4 rounded-xl text-[11px] sm:text-xs font-black tracking-wider transition-all duration-300 cursor-pointer touch-manipulation whitespace-nowrap ${
                activeTab === "support"
                  ? "bg-gradient-to-r from-purple-500 via-fuchsia-500 to-pink-500 text-white shadow-[0_0_20px_rgba(168,85,247,0.4)] border border-purple-300"
                  : "text-emerald-300/60 hover:text-white hover:bg-[#0E1A16]"
              }`}
            >
              <Headphones className="w-4 h-4 shrink-0" />

              <span>CANLI DESTEK</span>

              {unreadCounts.support !== null &&
                unreadCounts.support > 0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full ${
                      activeTab === "support"
                        ? "bg-white text-purple-700 font-black"
                        : "bg-purple-500/20 text-purple-300 border border-purple-500/40"
                    }`}
                  >
                    {
                      unreadCounts.support
                    }
                  </span>
                )}
            </button>
          </div>
        </div>
      </div>

      {/* ================= ANA İÇERİK DİNAMİK ALANI ================= */}
      <div className="max-w-6xl mx-auto px-3 sm:px-6 w-full flex-grow mt-2">
        {loadingUser ? (
          <div className="flex items-center justify-center py-20 text-emerald-400 gap-3">
            <Loader2 className="w-6 h-6 animate-spin" />

            <span className="text-xs font-black tracking-widest uppercase">
              Kullanıcı Oturumu Doğrulanıyor...
            </span>
          </div>
        ) : (
          <>
            {activeTab === "appointments" && (
              <AppointmentsTab
                currentUser={
                  currentUser
                }
                onCountChange={
                  handleAppointmentsCount
                }
              />
            )}

            {activeTab === "messages" && (
              <MessagesTab
                currentUser={
                  currentUser
                }
                onUnreadCountChange={(
                  count
                ) => {
                  setUnreadCounts(
                    (prev) => ({
                      ...prev,
                      messages:
                        Number(count) ||
                        0,
                    })
                  );

                  // Child component mesajı okuduğunda
                  // parent badge'i de backend ile senkronize et.
                  setTimeout(() => {
                    fetchMessageCount();
                  }, 100);
                }}
              />
            )}

            {activeTab === "support" && (
              <SupportTab
                currentUser={
                  currentUser
                }
                onCountChange={
                  handleSupportCount
                }
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function UnifiedContactPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#11142D] text-emerald-400 flex items-center justify-center p-4">
          <div className="bg-[#0B1310]/95 p-6 rounded-2xl border-2 border-emerald-500/40 shadow-[0_0_30px_rgba(16,185,129,0.3)] flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-400 animate-spin" />

            <p className="text-xs font-black tracking-widest text-white uppercase animate-pulse">
              İLETİŞİM MERKEZİ YÜKLENİYOR...
            </p>
          </div>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}