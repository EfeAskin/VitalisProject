"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2, Sparkles, ArrowLeft } from "lucide-react";

import ClientHeader from "./ClientHeader";
import ClientProfileCard from "./ClientProfileCard";
import ClientMetricsCards from "./ClientMetricsCards";
import ClientWeeklyTracker from "./ClientWeeklyTracker";
import ClientSubscriptionsManager from "./ClientSubscriptionsManager";
import ClientNotesSection from "./ClientNotesSection";
import TargetWeightModal from "./TargetWeightModal";
import TargetCalorieModal from "./TargetCalorieModal";
import ClientAssignedProgramsCard from "./ClientAssignedProgramsCard";
import ClientWeeklyScheduleCard from "./ClientWeeklyScheduleCard";

// JWT Token ve Auth Başlıklarını Hazırlayan Yardımcı Fonksiyon
const getAuthHeaders = () => {
  const headers = {
    "Content-Type": "application/json",
  };

  if (typeof window !== "undefined") {
    let token =
      localStorage.getItem("token") ||
      localStorage.getItem("access_token") ||
      sessionStorage.getItem("token") ||
      sessionStorage.getItem("access_token");

    if (!token) {
      const match = document.cookie.match(/(?:^|; )access_token=([^;]*)/);
      if (match) token = decodeURIComponent(match[1]);
    }

    if (token) {
      const cleanToken = token.replace(/^Bearer\s+/i, "").trim();
      headers["Authorization"] = `Bearer ${cleanToken}`;
    }
  }

  return headers;
};

const getLocalDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ClientDetailView({
  clientId,
  clients = [],
  specialistId = null,
  onBack,
}) {
  const initialClient =
    clients.find(
      (c) =>
        String(c.id) === String(clientId) ||
        String(c.client_id) === String(clientId)
    ) || null;

  const [client, setClient] = useState(initialClient);

  const [newNote, setNewNote] = useState("");
  const [notes, setNotes] = useState([]);
  const [isSavingNote, setIsSavingNote] = useState(false);
  const [isLoadingDetails, setIsLoadingDetails] = useState(true);

  // Modallar için State'ler
  const [isWeightModalOpen, setIsWeightModalOpen] = useState(false);
  const [isCalorieModalOpen, setIsCalorieModalOpen] = useState(false);
  const [targetWeightInput, setTargetWeightInput] = useState("");
  const [targetCalorieInput, setTargetCalorieInput] = useState("");

  // Kilo ve Kalori Hedef Durumları
  const [targetWeight, setTargetWeight] = useState(
    initialClient?.target_weight || null
  );
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(
    initialClient?.expert_target_kcal || initialClient?.daily_calories || 2000
  );
  const [isExpertCalorieSet, setIsExpertCalorieSet] = useState(
    Boolean(initialClient?.expert_target_kcal)
  );

  // Son 7 Günlük Aktivite Verileri
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);

  // Atanan Antrenman / Diyet Programları State'i
  const [workoutPrograms, setWorkoutPrograms] = useState(
    initialClient?.workout_programs || initialClient?.programs || []
  );

  // 7 Günlük Kronolojik Gün Oluşturucu
  const build7DaysChronological = (backendLogs = []) => {
    const days = [];
    const now = new Date();
    const todayStr = getLocalDateStr(now);

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const isToday = dateStr === todayStr;

      const dayNameShort = d
        .toLocaleDateString("tr-TR", { weekday: "short" })
        .toUpperCase();

      const logMatch = Array.isArray(backendLogs)
        ? backendLogs.find(
            (l) =>
              l.log_date === dateStr ||
              l.date === dateStr ||
              l.created_at?.split("T")[0] === dateStr
          )
        : null;

      const rawMeals =
        logMatch?.meals || logMatch?.meal_records || logMatch?.food_logs || [];
      const formattedMeals = Array.isArray(rawMeals)
        ? rawMeals.map((m) => ({
            name: m.name || m.meal_name || m.food_name || "Öğün",
            kcal: m.kcal || m.calories || m.energy || 0,
            protein: m.protein || m.p || 0,
            carb: m.carb || m.carbs || m.c || 0,
            fat: m.fat || m.f || 0,
          }))
        : [];

      let totalCalories =
        logMatch?.totalCalories ||
        logMatch?.total_calories ||
        logMatch?.calories_consumed ||
        logMatch?.calories ||
        0;
      if (!totalCalories && formattedMeals.length > 0) {
        totalCalories = formattedMeals.reduce(
          (sum, m) => sum + (Number(m.kcal) || 0),
          0
        );
      }

      const waterIntake =
        logMatch?.waterIntake || logMatch?.water_intake || logMatch?.water || 0;
      const workoutDone = Boolean(
        logMatch?.workoutDone ??
          logMatch?.workout_done ??
          logMatch?.is_workout_done ??
          false
      );

      days.push({
        date: dateStr,
        dayName: dayNameShort,
        isToday,
        totalCalories: Number(totalCalories) || 0,
        waterIntake: Number(waterIntake) || 0,
        workoutDone,
        meals: formattedMeals,
      });
    }
    return days;
  };

  useEffect(() => {
    const targetId = clientId || initialClient?.id || initialClient?.client_id;
    if (!targetId) {
      setIsLoadingDetails(false);
      return;
    }

    const fetchClientDetails = async () => {
      setIsLoadingDetails(true);
      const headers = getAuthHeaders();

      try {
        let detailUrl = `/api/expert-clients/client-detail/${targetId}`;
        if (specialistId && String(specialistId) !== "null") {
          detailUrl = `/api/expert-clients/client-detail/${specialistId}/${targetId}`;
        }

        let detailRes = await fetch(detailUrl, {
          headers,
          credentials: "include",
        });

        if (!detailRes.ok && detailUrl.includes(`/${specialistId}/`)) {
          detailRes = await fetch(`/api/expert-clients/client-detail/${targetId}`, {
            headers,
            credentials: "include",
          });
        }

        if (detailRes.ok) {
          const detailData = await detailRes.json();
          if (detailData?.client_info) {
            setClient(detailData.client_info);
            setTargetWeight(detailData.client_info.target_weight || null);
            setDailyCalorieTarget(
              detailData.client_info.expert_target_kcal ||
                detailData.client_info.daily_calorie_target ||
                detailData.client_info.daily_calories ||
                2000
            );
            setIsExpertCalorieSet(
              Boolean(detailData.client_info.expert_target_kcal)
            );
          }
          if (detailData?.notes) setNotes(detailData.notes);
          if (detailData?.assigned_programs) {
            setWorkoutPrograms(detailData.assigned_programs);
          }
        }

        const notesRes = await fetch(`/api/expert-clients/${targetId}/notes`, {
          headers,
          credentials: "include",
        });
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData.notes || notesData || []);
        }

        const summaryRes = await fetch(
          `/api/expert-clients/client-daily-summary?client_id=${targetId}&days=7`,
          {
            headers,
            credentials: "include",
          }
        );
        let backendLogs = [];
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          backendLogs = summaryData.days || summaryData || [];
        }
        const formattedDays = build7DaysChronological(backendLogs);
        setWeeklySummary(formattedDays);
        const todayIdx = formattedDays.findIndex((d) => d.isToday);
        setSelectedDayIndex(todayIdx !== -1 ? todayIdx : 6);

        const progRes = await fetch(
          `/api/expert-clients/workout-programs?client_id=${targetId}`,
          {
            headers,
            credentials: "include",
          }
        );
        if (progRes.ok) {
          const progData = await progRes.json();
          const fetchedProgs =
            progData.programs || progData.assigned_programs || [];
          if (fetchedProgs.length > 0) {
            setWorkoutPrograms(fetchedProgs);
          }
        }
      } catch (err) {
        console.error("Danışan detay verileri çekilemedi:", err);
        setWeeklySummary(build7DaysChronological([]));
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchClientDetails();
  }, [clientId, specialistId]);

  if (!isLoadingDetails && !client) {
    return (
      <div className="relative overflow-hidden bg-slate-900/60 border border-slate-800/80 rounded-3xl p-12 text-center space-y-6 backdrop-blur-2xl shadow-2xl flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 flex items-center justify-center shadow-[0_0_25px_rgba(245,158,11,0.2)] animate-pulse">
          <AlertCircle className="w-8 h-8" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-heading font-black text-white">
            Kayda Ulaşılamadı
          </h3>
          <p className="text-slate-300 font-medium text-xs">
            Seçilen danışan kaydı sistemde bulunamadı veya silinmiş olabilir.
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white rounded-xl text-xs font-heading font-black tracking-wider transition-all duration-300 flex items-center gap-2 shadow-[0_0_20px_rgba(249,115,22,0.3)] hover:scale-[1.02]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Listeye Geri Dön</span>
        </button>
      </div>
    );
  }

  const handleDeleteProgram = async (programId) => {
    try {
      const res = await fetch(
        `/api/expert-clients/workout-programs/${programId}`,
        {
          method: "DELETE",
          headers: getAuthHeaders(),
          credentials: "include",
        }
      );
      if (res.ok) {
        setWorkoutPrograms((prev) => prev.filter((p) => p.id !== programId));
      } else {
        setWorkoutPrograms((prev) => prev.filter((p) => p.id !== programId));
      }
    } catch (err) {
      console.error("Program silme hatası:", err);
      setWorkoutPrograms((prev) => prev.filter((p) => p.id !== programId));
    }
  };

  const handleEditProgram = (program) => {
    console.log("Program düzenleniyor:", program);
  };

  const handleAssignNewProgram = () => {
    console.log("Yeni program atama alanı tetiklendi.");
  };

  // Not Kaydetme (JWT Token & Dinamik Yetkilendirme)
  const handleAddNote = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!newNote.trim() || isSavingNote) return null;

    setIsSavingNote(true);
    const targetClientId = client?.id || client?.client_id || clientId;

    const notePayload = {
      client_id: parseInt(targetClientId),
      note_text: newNote,
      text: newNote,
    };

    if (specialistId && String(specialistId) !== "null") {
      notePayload.specialist_id = parseInt(specialistId);
    }

    try {
      const res = await fetch(`/api/expert-clients/${targetClientId}/notes`, {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify(notePayload),
      });

      if (res.ok) {
        const savedNote = await res.json();
        const createdNoteObj = savedNote.note || savedNote;
        
        const formattedNewNote = {
          id: createdNoteObj.id || `note-${Date.now()}`,
          created_at: createdNoteObj.created_at || "Bugün",
          date: createdNoteObj.date || createdNoteObj.created_at || "Bugün",
          note_text: createdNoteObj.note_text || createdNoteObj.text || newNote,
          text: createdNoteObj.note_text || createdNoteObj.text || newNote,
          author_name: createdNoteObj.author_name || createdNoteObj.author || "Uzman",
          author: createdNoteObj.author_name || createdNoteObj.author || "Uzman",
          author_role: createdNoteObj.author_role || createdNoteObj.role || "",
          role: createdNoteObj.author_role || createdNoteObj.role || "",
        };

        setNotes((prev) => [formattedNewNote, ...prev]);
        setNewNote("");
        return formattedNewNote;
      } else {
        const errData = await res.json().catch(() => ({}));
        alert(errData.detail || "Not kaydedilirken sunucu hatası oluştu.");
        return null;
      }
    } catch (err) {
      console.error("Not kaydetme hatası:", err);
      alert("Bağlantı hatası: Not kaydedilemedi.");
      return null;
    } finally {
      setIsSavingNote(false);
    }
  };

  const handleSaveTargetWeight = async () => {
    const parsedVal = parseFloat(targetWeightInput);
    if (isNaN(parsedVal)) return;

    const targetClientId = client?.id || client?.client_id || clientId;
    try {
      const res = await fetch("/api/expert-clients/set-target-weight", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          client_id: targetClientId,
          target_weight: parsedVal,
        }),
      });

      if (res.ok) {
        setTargetWeight(parsedVal);
        setIsWeightModalOpen(false);
        setTargetWeightInput("");
      } else {
        alert("Hedef kilo güncellenirken hata oluştu.");
      }
    } catch (err) {
      console.error("Hedef kilo güncellenemedi:", err);
    }
  };

  const handleSaveDailyCalorie = async () => {
    const parsedVal = parseInt(targetCalorieInput, 10);
    if (isNaN(parsedVal)) return;

    const targetClientId = client?.id || client?.client_id || clientId;
    try {
      const res = await fetch("/api/expert-clients/set-target-calorie", {
        method: "POST",
        headers: getAuthHeaders(),
        credentials: "include",
        body: JSON.stringify({
          client_id: targetClientId,
          expert_target_kcal: parsedVal,
        }),
      });

      if (res.ok) {
        setDailyCalorieTarget(parsedVal);
        setIsExpertCalorieSet(true);
        setIsCalorieModalOpen(false);
        setTargetCalorieInput("");
      } else {
        alert("Kalori hedefi güncellenirken hata oluştu.");
      }
    } catch (err) {
      console.error("Kalori hedefi güncellenemedi:", err);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-300 relative">
      <ClientHeader client={client} onBack={onBack} />

      {isLoadingDetails ? (
        <div className="flex flex-col items-center justify-center p-12 gap-3 bg-slate-900/60 backdrop-blur-2xl rounded-3xl border border-slate-800/80 shadow-2xl text-slate-300">
          <div className="w-10 h-10 rounded-2xl bg-orange-500/20 border border-orange-500/40 flex items-center justify-center text-orange-400 animate-pulse">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <span className="text-xs font-heading font-extrabold uppercase tracking-widest text-slate-200 animate-pulse">
            Danışan Verileri ve Aktivite Özetleri Yükleniyor...
          </span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <div className="lg:col-span-1 space-y-6">
              <ClientProfileCard client={client} />
              <ClientAssignedProgramsCard
                programs={workoutPrograms}
                onDeleteProgram={handleDeleteProgram}
                onEditProgram={handleEditProgram}
                onAssignNewProgram={handleAssignNewProgram}
              />
            </div>

            <div className="lg:col-span-3 space-y-6">
              <ClientMetricsCards
                client={client}
                targetWeight={targetWeight}
                dailyCalorieTarget={dailyCalorieTarget}
                isExpertCalorieSet={isExpertCalorieSet}
                onOpenWeightModal={() => {
                  setTargetWeightInput(
                    targetWeight ? String(targetWeight) : ""
                  );
                  setIsWeightModalOpen(true);
                }}
                onOpenCalorieModal={() => {
                  setTargetCalorieInput(
                    dailyCalorieTarget ? String(dailyCalorieTarget) : ""
                  );
                  setIsCalorieModalOpen(true);
                }}
              />

              <ClientWeeklyTracker
                weeklySummary={weeklySummary}
                selectedDayIndex={selectedDayIndex}
                setSelectedDayIndex={setSelectedDayIndex}
                dailyCalorieTarget={dailyCalorieTarget}
              />

              <ClientWeeklyScheduleCard weeklyPrograms={workoutPrograms} />
            </div>
          </div>
        </>
      )}

      {client?.id && (
        <ClientSubscriptionsManager clientId={client.id} client={client} />
      )}

      <ClientNotesSection
        notes={notes}
        newNote={newNote}
        setNewNote={setNewNote}
        isSavingNote={isSavingNote}
        onAddNote={handleAddNote}
      />

      <TargetWeightModal
        isOpen={isWeightModalOpen}
        onClose={() => setIsWeightModalOpen(false)}
        targetWeightInput={targetWeightInput}
        setTargetWeightInput={setTargetWeightInput}
        client={client}
        onSave={handleSaveTargetWeight}
      />

      <TargetCalorieModal
        isOpen={isCalorieModalOpen}
        onClose={() => setIsCalorieModalOpen(false)}
        targetCalorieInput={targetCalorieInput}
        setTargetCalorieInput={setTargetCalorieInput}
        client={client}
        onSave={handleSaveDailyCalorie}
      />
    </div>
  );
}