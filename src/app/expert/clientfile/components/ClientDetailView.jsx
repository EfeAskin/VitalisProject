"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Loader2 } from "lucide-react";

import ClientHeader from "./ClientHeader";
import ClientProfileCard from "./ClientProfileCard";
import ClientMetricsCards from "./ClientMetricsCards";
import ClientWeeklyTracker from "./ClientWeeklyTracker";
import ClientSubscriptionsManager from "./ClientSubscriptionsManager";
import ClientNotesSection from "./ClientNotesSection";
import TargetWeightModal from "./TargetWeightModal";
import TargetCalorieModal from "./TargetCalorieModal";

// Yerel tarih dizesi oluşturucu (UTC saat dilimi kaymalarını engeller)
const getLocalDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ClientDetailView({
  clientId,
  clients = [],
  specialistId = 4,
  onBack,
}) {
  const client =
    clients.find((c) => String(c.id) === String(clientId)) || clients[0] || null;

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
  const [targetWeight, setTargetWeight] = useState(client?.target_weight || null);
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(
    client?.expert_target_kcal || client?.daily_calories || 2863
  );
  const [isExpertCalorieSet, setIsExpertCalorieSet] = useState(
    Boolean(client?.expert_target_kcal)
  );

  // Son 7 Günlük Aktivite Verileri
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(6);

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
    if (!client?.id) return;

    setTargetWeight(client?.target_weight || null);
    setDailyCalorieTarget(
      client?.expert_target_kcal || client?.daily_calories || 2863
    );
    setIsExpertCalorieSet(Boolean(client?.expert_target_kcal));

    const fetchClientDetails = async () => {
      setIsLoadingDetails(true);
      try {
        const notesRes = await fetch(`/api/expert-clients/${client.id}/notes`);
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData.notes || notesData || []);
        } else {
          setNotes(client.notes || []);
        }

        const summaryRes = await fetch(
          `/api/expert-clients/client-daily-summary?client_id=${client.id}&days=7`
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
      } catch (err) {
        console.error("Danışan detay verileri çekilemedi:", err);
        setWeeklySummary(build7DaysChronological([]));
      } finally {
        setIsLoadingDetails(false);
      }
    };

    fetchClientDetails();
  }, [
    client?.id,
    client?.target_weight,
    client?.expert_target_kcal,
    client?.daily_calories,
  ]);

  if (!client) {
    return (
      <div className="flex flex-col items-center justify-center p-12 bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <AlertCircle className="w-10 h-10 text-amber-500" />
        <p className="text-slate-400 font-semibold text-sm">
          Danışan kaydı bulunamadı.
        </p>
        <button
          onClick={onBack}
          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold transition-all"
        >
          Geri Dön
        </button>
      </div>
    );
  }

  // Not Kaydetme
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || isSavingNote) return;

    setIsSavingNote(true);
    const notePayload = {
      specialist_id: specialistId,
      client_id: parseInt(client.id),
      note_text: newNote,
    };

    try {
      const res = await fetch(`/api/expert-clients/${client.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notePayload),
      });

      if (res.ok) {
        const savedNote = await res.json();
        const createdNoteObj = savedNote.note || savedNote;
        setNotes((prev) => [
          {
            id: createdNoteObj.id || `temp-${Date.now()}`,
            created_at: "Bugün",
            note_text: newNote,
            author: "Uzman PT",
          },
          ...prev,
        ]);
        setNewNote("");
      } else {
        alert("Not kaydedilirken sunucu hatası oluştu.");
      }
    } catch (err) {
      console.error("Not kaydetme hatası:", err);
    } finally {
      setIsSavingNote(false);
    }
  };

  // Hedef Kilo Güncelleme
  const handleSaveTargetWeight = async () => {
    const parsedVal = parseFloat(targetWeightInput);
    if (isNaN(parsedVal)) return;

    try {
      const res = await fetch("/api/expert-clients/set-target-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client.id, target_weight: parsedVal }),
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

  // Günlük Kalori Hedefi Güncelleme
  const handleSaveDailyCalorie = async () => {
    const parsedVal = parseInt(targetCalorieInput, 10);
    if (isNaN(parsedVal)) return;

    try {
      const res = await fetch("/api/expert-clients/set-target-calorie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          client_id: client.id,
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
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER */}
      <ClientHeader client={client} onBack={onBack} />

      {/* YÜKLENİYOR BİLDİRİMİ */}
      {isLoadingDetails ? (
        <div className="flex items-center justify-center p-12 text-slate-400 gap-3 bg-slate-900/50 rounded-3xl border border-slate-800">
          <Loader2 className="w-6 h-6 animate-spin text-[#EA580C]" />
          <span className="text-xs font-bold">
            Danışan verileri ve aktivite özetleri yükleniyor...
          </span>
        </div>
      ) : (
        <>
          {/* PROFİL & METRİKLER & AKTİVİTE */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* SOL KOLLON: Profil Kartı */}
            <ClientProfileCard client={client} />

            {/* SAĞ KOLON: Metrikler & Haftalık Tracker */}
            <div className="lg:col-span-3 space-y-6">
              <ClientMetricsCards
                client={client}
                targetWeight={targetWeight}
                dailyCalorieTarget={dailyCalorieTarget}
                isExpertCalorieSet={isExpertCalorieSet}
                onOpenWeightModal={() => {
                  setTargetWeightInput(targetWeight ? String(targetWeight) : "");
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
            </div>
          </div>
        </>
      )}

      {/* YENİ MODÜL: ABONELİKLER VE ALINAN HİZMETLER */}
      <ClientSubscriptionsManager clientId={client.id} client={client} />

      {/* UZMAN NOTLARI */}
      <ClientNotesSection
        notes={notes}
        newNote={newNote}
        setNewNote={setNewNote}
        isSavingNote={isSavingNote}
        onAddNote={handleAddNote}
      />

      {/* MODALLAR */}
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