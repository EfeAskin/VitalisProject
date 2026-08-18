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
  ShieldCheck,
  Sparkles,
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
    headers["Content-Type"] =
      contentType;
  }

  const token = getAuthToken();

  if (token) {
    headers["Authorization"] =
      `Bearer ${token}`;
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

  const [activeTab, setActiveTab] =
    useState("appointments");

  const [currentUser, setCurrentUser] =
    useState(null);

  const [loadingUser, setLoadingUser] =
    useState(true);

  // -----------------------------------------------------------------------
  // GERÇEK DİNAMİK SAYILAR
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
          const data =
            await res.json();

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
  // URL TAB SENKRONİZASYONU
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
  // TAB DEĞİŞTİRME
  // =========================================================================

  const handleTabChange = (
    tabKey
  ) => {
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
  };

  // =========================================================================
  // CHILD COMPONENT'LERDEN GERÇEK SAYILARI ALMA
  // =========================================================================

  const handleAppointmentsCount =
    useCallback((count) => {
      setUnreadCounts(
        (prev) => ({
          ...prev,
          appointments:
            Number.isFinite(
              Number(count)
            )
              ? Number(count)
              : 0,
        })
      );
    }, []);

  const handleSupportCount =
    useCallback((count) => {
      setUnreadCounts(
        (prev) => ({
          ...prev,
          support:
            Number.isFinite(
              Number(count)
            )
              ? Number(count)
              : 0,
        })
      );
    }, []);

  // =========================================================================
  // PAGE
  // =========================================================================

  return (
    <div className="relative min-h-screen bg-[#11142D] text-slate-100 font-sans pb-20 flex flex-col selection:bg-orange-500 selection:text-white overflow-hidden">

      {/* AMBİYANS IŞIKLARI */}

      <div className="absolute top-10 left-1/4 w-[500px] h-[500px] bg-orange-500/15 rounded-full blur-[140px] pointer-events-none -z-0" />

      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none -z-0" />

      <div className="absolute bottom-10 left-10 w-[500px] h-[500px] bg-indigo-500/15 rounded-full blur-[150px] pointer-events-none -z-0" />

      {/* ÜST BANNER */}

      <div className="relative z-10 w-full px-4 sm:px-6 pt-8 pb-6 transition-all duration-300">
        <div className="max-w-6xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-6 relative">

          {/* BAŞLIK */}

          <div className="space-y-2 text-center lg:text-left z-10 max-w-xl">
            <div className="flex items-center justify-center lg:justify-start gap-2">
              <span className="px-3.5 py-1 bg-gradient-to-r from-orange-500/20 to-amber-500/20 border border-orange-500/50 text-orange-300 text-[10px] font-heading font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-[0_0_15px_rgba(249,115,22,0.25)]">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" />

                VITALIS EXPERT COMMAND CENTER
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white pt-1 drop-shadow-md">
              İletişim & Danışan Yönetim Merkezi
            </h1>

            <p className="text-xs font-medium text-slate-200 leading-relaxed">
              Danışan randevularınızı gerçek zamanlı takip edin, özel mesajlaşmaları yönetin ve platform VIP yönetici ekibinden 7/24 teknik destek alın.
            </p>
          </div>

          {/* TAB SWITCHER */}

          <div className="relative flex bg-[#11142D] p-1.5 rounded-2xl w-full lg:w-[500px] shadow-inner border border-slate-700/80 z-10">

            {/* RANDEVULAR */}

            <button
              onClick={() =>
                handleTabChange(
                  "appointments"
                )
              }
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-heading font-black tracking-wider transition-all duration-300 ${
                activeTab === "appointments"
                  ? "bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <Calendar className="w-4 h-4" />

              <span>RANDEVULAR</span>

              {unreadCounts.appointments !== null &&
                unreadCounts.appointments >
                  0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full ${
                      activeTab ===
                      "appointments"
                        ? "bg-white text-blue-700"
                        : "bg-blue-500/20 text-blue-300 border border-blue-500/40"
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
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-heading font-black tracking-wider transition-all duration-300 ${
                activeTab === "messages"
                  ? "bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-[0_0_25px_rgba(5,150,105,0.4)] scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <MessageSquare className="w-4 h-4" />

              <span>MESAJLAR</span>

              {unreadCounts.messages >
                0 && (
                <span
                  className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full ${
                    activeTab === "messages"
                      ? "bg-white text-emerald-700"
                      : "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                  }`}
                >
                  {
                    unreadCounts.messages
                  }
                </span>
              )}
            </button>

            {/* DESTEK */}

            <button
              onClick={() =>
                handleTabChange(
                  "support"
                )
              }
              className={`relative flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-xs font-heading font-black tracking-wider transition-all duration-300 ${
                activeTab === "support"
                  ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-[0_0_25px_rgba(147,51,235,0.4)] scale-[1.02]"
                  : "text-slate-300 hover:text-white hover:bg-slate-900/50"
              }`}
            >
              <Headphones className="w-4 h-4" />

              <span>DESTEK</span>

              {unreadCounts.support !== null &&
                unreadCounts.support >
                  0 && (
                  <span
                    className={`px-1.5 py-0.5 text-[9px] font-mono font-extrabold rounded-full ${
                      activeTab ===
                      "support"
                        ? "bg-white text-purple-700"
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

      {/* ANA İÇERİK */}

      <div className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 w-full flex-grow mt-2">

        {loadingUser ? (
          <div className="min-h-[400px] flex items-center justify-center">
            <div className="flex items-center gap-3 text-emerald-400">
              <Sparkles className="w-5 h-5 animate-spin" />

              <span className="text-xs font-black tracking-widest uppercase">
                Kullanıcı oturumu doğrulanıyor...
              </span>
            </div>
          </div>
        ) : (
          <>
            {activeTab ===
              "appointments" && (
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
        <div className="min-h-screen bg-[#11142D] text-slate-100 flex flex-col items-center justify-center space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 animate-pulse shadow-[0_0_20px_rgba(249,115,22,0.3)]">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>

          <p className="text-xs font-heading font-extrabold tracking-widest text-slate-200 animate-pulse uppercase">
            İletişim Merkezi Yükleniyor...
          </p>
        </div>
      }
    >
      <ContactContent />
    </Suspense>
  );
}