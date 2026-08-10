"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import PtClientList from "./components/PtClientList";
import NewRequests from "./components/NewRequests";
import ClientDetailView from "./components/ClientDetailView";
import { Users, UserPlus, FolderOpen } from "lucide-react";

function ClientFileContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // URL query'sine göre aktif sekme
  const currentTab = searchParams.get("tab") || "list";
  const selectedClientId = searchParams.get("id");

  // Oturumdaki uzmanın ID'sini dinamik al (Varsayılan olarak Neon'daki Ömer Gürün: 4)
  const [specialistId, setSpecialistId] = useState(4);

  useEffect(() => {
    // LocalStorage veya Session'dan giriş yapan uzman ID'sini okuma
    const userJson = localStorage.getItem("user");
    if (userJson) {
      try {
        const user = JSON.parse(userJson);
        if (user && user.id) {
          setSpecialistId(user.id);
        }
      } catch (e) {
        console.error("User session parse hatası:", e);
      }
    }
  }, []);

  const [clients, setClients] = useState([]);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Backend API'den Canlı Verileri Çekme (Dinamik specialistId ile)
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        const response = await fetch(`/api/expert-clients/dashboard/${specialistId}`);
        if (response.ok) {
          const data = await response.json();
          setClients(data.active_clients || []);
          setRequests(data.pending_requests || []);
        }
      } catch (error) {
        console.error("Dashboard verileri çekilirken hata oluştu:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (specialistId) {
      fetchDashboardData();
    }
  }, [specialistId]);

  // Yeni Başvuruyu Kabul Etme
  const handleAcceptRequest = async (request) => {
    const reqId = request.request_id || request.id;
    try {
      await fetch("/api/expert-clients/requests/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: parseInt(reqId),
          action: "accept",
          package_days: 90
        })
      });

      // Kabul edildikten sonra verileri tekrar güncelle
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
          active_package: request.requested_package || "Aylık Pt Danışmanlığı",
          package_days_left: 90,
          daily_calories: 2200,
          notes: [],
          weekly_logs: []
        },
        ...prev
      ]);
    } catch (err) {
      console.error("API kabul isteği hatası:", err);
    }
  };

  // Başvuruyu Reddetme
  const handleRejectRequest = async (requestId) => {
    try {
      await fetch("/api/expert-clients/requests/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          request_id: parseInt(requestId),
          action: "reject"
        })
      });
      setRequests((prev) => prev.filter((r) => (r.request_id || r.id) !== requestId));
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
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 md:p-8 space-y-8 selection:bg-[#EA580C] selection:text-white">
      {/* Header & Tab Navigasyon Barı */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-[#EA580C]/10 text-[#EA580C] rounded-2xl border border-[#EA580C]/20">
            <FolderOpen size={24} />
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-black text-white">Danışan Yönetim Merkezi</h1>
            <p className="text-xs text-slate-400">Aktif Danışan Listesi & Gelen Başvurular</p>
          </div>
        </div>

        {/* Tab Butonları */}
        <div className="flex items-center gap-2 bg-slate-900 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => navigateTab("list")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
              currentTab === "list" || currentTab === "detail"
                ? "bg-[#EA580C] text-white shadow-lg shadow-[#EA580C]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Users size={16} />
            <span>Danışanlarım ({clients.length})</span>
          </button>

          <button
            onClick={() => navigateTab("requests")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 relative ${
              currentTab === "requests"
                ? "bg-[#EA580C] text-white shadow-lg shadow-[#EA580C]/20"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserPlus size={16} />
            <span>Yeni İstekler</span>
            {requests.length > 0 && (
              <span className="w-5 h-5 bg-rose-500 text-white rounded-full text-[10px] flex items-center justify-center font-extrabold ml-1">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* İçerik Alanı */}
      {isLoading ? (
        <div className="p-12 text-center text-slate-400 text-sm font-semibold">
          Yükleniyor...
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
              specialistId={specialistId} // Oturumdaki uzmanın ID'si
              onBack={() => navigateTab("list")}
            />
          )}
        </>
      )}
    </div>
  );
}

export default function ClientFilePage() {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-400">Yükleniyor...</div>}>
      <ClientFileContent />
    </Suspense>
  );
}