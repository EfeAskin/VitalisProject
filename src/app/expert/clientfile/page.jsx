"use client";

import React, { useState, useEffect, useMemo, Suspense, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PtClientList from "./components/PtClientList";
import NewRequests from "./components/NewRequests";
import ClientDetailView from "./components/ClientDetailView";
import { Users, UserPlus, FolderOpen, Loader2, ShieldCheck, Sparkles } from "lucide-react";

// LocalStorage ve JWT Token içerisinden kullanıcı ID'sini güvenli bir şekilde çıkartan yardımcı fonksiyon
const extractUserId = () => {
  if (typeof window === "undefined") return 0;
  
  try {
    // 1. Öncelik: Token içindeki JWT Payload çözümleme
    const token = localStorage.getItem("token") || localStorage.getItem("access_token");
    if (token) {
      const parts = token.split(".");
      if (parts.length === 3) {
        const payload = JSON.parse(atob(parts[1]));
        const tokenId = payload.id || payload.user_id || payload.sub;
        if (tokenId && !isNaN(Number(tokenId))) {
          return Number(tokenId);
        }
      }
    }

    // 2. Öncelik: LocalStorage üzerindeki user nesneleri
    const userJson = localStorage.getItem("user") || localStorage.getItem("auth_user") || localStorage.getItem("userData");
    if (userJson) {
      const user = JSON.parse(userJson);
      const uid =
        user?.id ||
        user?.user_id ||
        user?.specialist_id ||
        user?.expert_id ||
        user?.userId ||
        user?.user?.id ||
        (typeof user === "number" || (typeof user === "string" && !isNaN(Number(user))) ? Number(user) : null);

      if (uid && !isNaN(Number(uid))) {
        return Number(uid);
      }
    }
  } catch (error) {
    console.error("Kullanıcı ID çıkarma hatası:", error);
  }

  return 0; // Bulunamadıysa 0 döndürür, backend JWT token ile kendisi tespit eder
};

function ClientFileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const currentTab = searchParams.get("tab") || "list";
  const selectedClientId = searchParams.get("id");

  const [specialistId, setSpecialistId] = useState(null);
  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // BENZERSİZ (UNIQUE) DANIŞAN SAYISI HESAPLAMA
  const uniqueClientsCount = useMemo(() => {
    if (!Array.isArray(clients) || clients.length === 0) return 0;
    const uniqueIds = new Set(
      clients.map((c) => String(c.id || c.client_id || c.subscription_id))
    );
    return uniqueIds.size;
  }, [clients]);

  // Oturum açan kullanıcının verilerini güvenli ve senkronize çekme
  const fetchDashboardData = useCallback(async () => {
    setIsLoading(true);
    try {
      const activeUserId = extractUserId();
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");

      setSpecialistId(activeUserId);

      // Authorization header eklendi
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      // activeUserId 0 olsa dahi istek atılır, backend Authorization token'ından kullanıcıyı doğrular
      const response = await fetch(`/api/expert-clients/dashboard/${activeUserId || 0}`, {
        method: "GET",
        headers: headers
      });

      if (response.ok) {
        const data = await response.json();
        setClients(data.active_clients || []);
        setRequests(data.pending_requests || []);
      } else {
        console.error("Dashboard verileri alınamadı. HTTP Hata Kodu:", response.status);
      }
    } catch (error) {
      console.error("Dashboard verileri çekilirken hata oluştu:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, currentTab]);

  const handleAcceptRequest = async (request) => {
    const reqId = request.request_id || request.id;
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/expert-clients/requests/action", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          request_id: parseInt(reqId, 10),
          action: "accept",
          package_days: 90
        })
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => (r.request_id || r.id) !== reqId));
        setClients((prev) => [
          {
            id: String(request.client_id || request.id),
            first_name: request.first_name,
            last_name: request.last_name,
            email: request.email,
            phone: request.phone,
            avatar: request.avatar,
            goal: request.goal || "Formu Korumak & Sağlıklı Beslenme",
            program_name: "Henüz Program Atanmadı",
            status: "active",
            compliance_rate: 100,
            starting_weight: request.weight || 75,
            current_weight: request.weight || 75,
            target_weight: (request.weight || 75) - 5,
            height: request.height || 180,
            age: request.age || 22,
            gender: request.gender || "Erkek",
            active_package: request.requested_package || "Aylık PT Danışmanlığı",
            package_days_left: 90,
            daily_calories: 2200,
            notes: [],
            weekly_logs: []
          },
          ...prev
        ]);
        fetchDashboardData();
      }
    } catch (err) {
      console.error("API kabul isteği hatası:", err);
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      const token = localStorage.getItem("token") || localStorage.getItem("access_token");
      const headers = { "Content-Type": "application/json" };
      if (token) headers["Authorization"] = `Bearer ${token}`;

      const res = await fetch("/api/expert-clients/requests/action", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          request_id: parseInt(requestId, 10),
          action: "reject"
        })
      });

      if (res.ok) {
        setRequests((prev) => prev.filter((r) => (r.request_id || r.id) !== requestId));
        fetchDashboardData();
      }
    } catch (err) {
      console.error("API reddetme isteği hatası:", err);
    }
  };

  const navigateTab = (tab, id = null) => {
    if (id) {
      router.push(`/expert/clientfile?tab=${tab}&id=${id}`);
    } else {
      router.push(`/expert/clientfile?tab=${tab}`);
    }
  };

  return (
    <div className="relative w-full space-y-8 selection:bg-orange-500 selection:text-white">

      {/* 🚀 ÜST HEADER & TAB NAVİGASYON BARI */}
      <div className="relative z-10 bg-[#131738]/95 border border-slate-700/80 rounded-3xl p-6 md:p-8 backdrop-blur-2xl shadow-[0_15px_35px_rgba(0,0,0,0.4)] flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Sol Başlık & İkon Alanı */}
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-orange-500/20 to-amber-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400 shadow-[0_0_20px_rgba(249,115,22,0.15)] flex-shrink-0">
            <FolderOpen size={28} />
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-0.5 bg-gradient-to-r from-orange-500/10 to-amber-500/10 border border-orange-500/30 text-orange-400 text-[10px] font-heading font-black tracking-widest rounded-full uppercase flex items-center gap-1.5 shadow-sm">
                <ShieldCheck className="w-3.5 h-3.5 text-orange-400" /> CLIENT MANAGEMENT
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-heading font-black tracking-tight text-white">
              Danışan Yönetim Merkezi
            </h1>
            <p className="text-xs font-medium text-slate-400">
              Aktif Danışan Listesi & Gelen Başvurular
            </p>
          </div>
        </div>

        {/* Tab Butonları */}
        <div className="flex items-center gap-2 bg-[#0B0D1B]/95 p-1.5 rounded-2xl border border-slate-800/90 shadow-inner self-start sm:self-auto w-full sm:w-auto">
          <button
            onClick={() => navigateTab("list")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-heading font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-2 ${
              currentTab === "list" || currentTab === "detail"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.35)] scale-[1.02]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <Users size={16} />
            <span>Danışanlarım ({uniqueClientsCount})</span>
          </button>

          <button
            onClick={() => navigateTab("requests")}
            className={`flex-1 sm:flex-initial px-5 py-2.5 rounded-xl text-xs font-heading font-black tracking-wider transition-all duration-300 flex items-center justify-center gap-2 relative ${
              currentTab === "requests"
                ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-[0_0_25px_rgba(249,115,22,0.35)] scale-[1.02]"
                : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
            }`}
          >
            <UserPlus size={16} />
            <span>Yeni İstekler</span>
            {requests.length > 0 && (
              <span className="px-2 py-0.5 bg-rose-500 text-white rounded-full text-[10px] font-mono font-extrabold shadow-[0_0_12px_rgba(244,63,94,0.5)] animate-pulse ml-1">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* 📦 İÇERİK ALANI */}
      <div className="relative z-10">
        {isLoading ? (
          <div className="bg-[#131738]/95 border border-slate-700/80 backdrop-blur-2xl rounded-3xl p-16 flex flex-col items-center justify-center text-slate-400 text-xs font-heading font-extrabold gap-3 shadow-[0_15px_35px_rgba(0,0,0,0.4)]">
            <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            <span className="tracking-widest uppercase animate-pulse">Veriler Yükleniyor...</span>
          </div>
        ) : (
          <>
            {currentTab === "list" && (
              <PtClientList
                clients={clients}
                onSelectClient={(id) => navigateTab("detail", id)}
              />
            )}

            {currentTab === "requests" && (
              <NewRequests
                requests={requests}
                onAccept={handleAcceptRequest}
                onReject={handleRejectRequest}
              />
            )}

            {currentTab === "detail" && (
              <ClientDetailView
                clientId={selectedClientId}
                clients={clients}
                specialistId={specialistId}
                onBack={() => navigateTab("list")}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function ClientFilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[50vh] flex flex-col items-center justify-center text-slate-400 text-xs font-heading font-extrabold gap-3">
          <div className="w-12 h-12 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 animate-pulse">
            <Sparkles className="w-6 h-6 animate-spin" />
          </div>
          <span className="tracking-widest uppercase animate-pulse">Modül Yükleniyor...</span>
        </div>
      }
    >
      <ClientFileContent />
    </Suspense>
  );
}