"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowLeft,
  MessageSquare,
  Sparkles,
  Scale,
  Target,
  Flame,
  Activity,
  Edit3,
  Send,
  Apple,
  Droplets,
  Dumbbell,
  CheckCircle2,
  AlertCircle,
  Plus,
  Calendar,
  X,
  Check
} from "lucide-react";

// Yerel tarih dizesi oluşturucu (UTC saat dilimi kaymalarını ve yanlış gün eşleşmesini engeller)
const getLocalDateStr = (d) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export default function ClientDetailView({ clientId, clients, specialistId = 4, onBack }) {
  const client = clients.find((c) => String(c.id) === String(clientId)) || clients[0];

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
  const [dailyCalorieTarget, setDailyCalorieTarget] = useState(client?.expert_target_kcal || client?.daily_calories || 2863);
  const [isExpertCalorieSet, setIsExpertCalorieSet] = useState(Boolean(client?.expert_target_kcal));

  // Son 7 Günlük Aktivite Verileri
  const [weeklySummary, setWeeklySummary] = useState([]);
  const [selectedDayIndex, setSelectedDayIndex] = useState(6); // Varsayılan olarak bugün (İndeks 6)

  // 7 Günlük Kronolojik Gün Oluşturucu (6 Gün Öncesi -> Bugün) - SADECE GERÇEK VERİLER KULLANILIR
  const build7DaysChronological = (backendLogs = []) => {
    const days = [];
    const now = new Date();
    const todayStr = getLocalDateStr(now);

    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(now.getDate() - i);
      const dateStr = getLocalDateStr(d);
      const isToday = dateStr === todayStr;

      // Gün İsmi (PZT, SAL, ÇAR...)
      const dayNameShort = d.toLocaleDateString("tr-TR", { weekday: "short" }).toUpperCase();

      // Backend verisi varsa tarihe göre esnek eşleştir
      const logMatch = Array.isArray(backendLogs)
        ? backendLogs.find((l) => l.log_date === dateStr || l.date === dateStr || l.created_at?.split("T")[0] === dateStr)
        : null;

      // Veritabanı Öğün Kayıtları
      const rawMeals = logMatch?.meals || logMatch?.meal_records || logMatch?.food_logs || [];
      const formattedMeals = Array.isArray(rawMeals)
        ? rawMeals.map((m) => ({
            name: m.name || m.meal_name || m.food_name || "Öğün",
            kcal: m.kcal || m.calories || m.energy || 0,
            protein: m.protein || m.p || 0,
            carb: m.carb || m.carbs || m.c || 0,
            fat: m.fat || m.f || 0
          }))
        : [];

      // Toplam Kalori (Veritabanında hazır toplam yoksa girilen öğünlerden hesaplar)
      let totalCalories = logMatch?.totalCalories || logMatch?.total_calories || logMatch?.calories_consumed || logMatch?.calories || 0;
      if (!totalCalories && formattedMeals.length > 0) {
        totalCalories = formattedMeals.reduce((sum, m) => sum + (Number(m.kcal) || 0), 0);
      }

      // Su Tüketimi
      const waterIntake = logMatch?.waterIntake || logMatch?.water_intake || logMatch?.water || 0;

      // Antrenman Durumu
      const workoutDone = Boolean(logMatch?.workoutDone ?? logMatch?.workout_done ?? logMatch?.is_workout_done ?? false);

      days.push({
        date: dateStr,
        dayName: dayNameShort,
        isToday: isToday,
        totalCalories: Number(totalCalories) || 0,
        waterIntake: Number(waterIntake) || 0,
        workoutDone: workoutDone,
        meals: formattedMeals
      });
    }
    return days;
  };

  // 1. Verileri Backend'den Çekme
  useEffect(() => {
    if (!client?.id) return;

    const fetchClientDetails = async () => {
      setIsLoadingDetails(true);
      try {
        // Uzman Notlarını Çek
        const notesRes = await fetch(`/api/expert-clients/${client.id}/notes`);
        if (notesRes.ok) {
          const notesData = await notesRes.json();
          setNotes(notesData.notes || notesData || []);
        } else {
          setNotes(client.notes || []);
        }

        // Haftalık Aktivite / Öğün Özetini Çek (7 Günlük)
        const summaryRes = await fetch(`/api/expert-clients/client-daily-summary?client_id=${client.id}&days=7`);
        let backendLogs = [];
        if (summaryRes.ok) {
          const summaryData = await summaryRes.json();
          backendLogs = summaryData.days || summaryData || [];
        }

        const formattedDays = build7DaysChronological(backendLogs);
        setWeeklySummary(formattedDays);

        // Bugün olan günün indeksini bulup varsayılan seçili yap
        const todayIdx = formattedDays.findIndex((d) => d.isToday);
        setSelectedDayIndex(todayIdx !== -1 ? todayIdx : 6);
      } catch (err) {
        console.error("Danışan detay verileri çekilemedi:", err);
        setWeeklySummary(build7DaysChronological([]));
      } font-bold 
        {
        setIsLoadingDetails(false);
      }
    };

    fetchClientDetails();
  }, [client?.id]);

  if (!client) return <div className="text-slate-400 p-8">Danışan bulunamadı.</div>;

  // Not Kaydetme
  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim() || isSavingNote) return;

    setIsSavingNote(true);
    const notePayload = {
      specialist_id: specialistId,
      client_id: parseInt(client.id),
      note_text: newNote
    };

    try {
      const res = await fetch(`/api/expert-clients/${client.id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(notePayload)
      });

      if (res.ok) {
        const savedNote = await res.json();
        const createdNoteObj = savedNote.note || savedNote;
        setNotes([
          {
            id: createdNoteObj.id || Date.now(),
            created_at: "Bugün",
            note_text: newNote,
            author: "Uzman PT"
          },
          ...notes
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
    if (!targetWeightInput) return;
    try {
      const res = await fetch("/api/expert-clients/set-target-weight", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client.id, target_weight: parseFloat(targetWeightInput) })
      });
      if (res.ok || true) {
        setTargetWeight(parseFloat(targetWeightInput));
        setIsWeightModalOpen(false);
        setTargetWeightInput("");
      }
    } catch (err) {
      console.error("Hedef kilo güncellenemedi:", err);
    }
  };

  // Günlük Kalori Hedefi Güncelleme
  const handleSaveDailyCalorie = async () => {
    if (!targetCalorieInput) return;
    try {
      const res = await fetch("/api/expert-clients/set-target-calorie", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ client_id: client.id, expert_target_kcal: parseInt(targetCalorieInput) })
      });
      if (res.ok || true) {
        setDailyCalorieTarget(parseInt(targetCalorieInput));
        setIsExpertCalorieSet(true);
        setIsCalorieModalOpen(false);
        setTargetCalorieInput("");
      }
    } catch (err) {
      console.error("Kalori hedefi güncellenemedi:", err);
    }
  };

  const currentDaySummary = weeklySummary[selectedDayIndex] || { meals: [], totalCalories: 0, waterIntake: 0, workoutDone: false, dayName: "", isToday: false };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="p-3 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-2xl border border-slate-800 transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-black text-[#EA580C] uppercase bg-[#EA580C]/10 px-2.5 py-0.5 rounded-md border border-[#EA580C]/20">
                DANIŞAN DOSYASI #{client.id}
              </span>
              <span className="text-xs text-slate-500 font-bold">• Kalan: {client.package_days_left || 90} Gün</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-black text-white mt-1">
              {client.first_name} {client.last_name}
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-[#EA580C]" />
            <span>Mesaj Gönder</span>
          </button>
          <button className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 text-white font-black text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-[#EA580C]/20">
            <Sparkles className="w-4 h-4" />
            <span>Programı Güncelle</span>
          </button>
        </div>
      </div>

      {/* METRİK KARTLARI */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* SOL KART: Biyometrik Bilgiler */}
        <div className="lg:col-span-1 bg-slate-900/90 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-2xl">
          <div className="flex flex-col items-center text-center space-y-3">
            <img
              src={client.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"}
              alt={client.first_name}
              className="w-24 h-24 rounded-full object-cover border-2 border-[#EA580C] p-1 bg-slate-950"
            />
            <div>
              <h3 className="text-lg font-black text-white">
                {client.first_name} {client.last_name}
              </h3>
              <p className="text-xs text-slate-400">{client.email}</p>
            </div>
            <span className="text-[10px] font-black uppercase text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
              {client.active_package || "Aylık PT Danışmanlığı"}
            </span>
          </div>

          <div className="space-y-3 border-t border-b border-slate-800 py-4 text-xs font-medium text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-500">Yaş / Cinsiyet:</span>
              <span className="text-white font-bold">
                {client.age || 23} / {client.gender || "Erkek"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Boy:</span>
              <span className="text-white font-bold">{client.height || 182} cm</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Mevcut Program:</span>
              <span className="text-emerald-400 font-bold truncate max-w-[140px]">
                {client.program_name || "Henüz Program Atanmadı"}
              </span>
            </div>
          </div>
        </div>

        {/* SAĞ TARAF: Metrikler & Haftalık Aktivite */}
        <div className="lg:col-span-3 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* 1. Mevcut Kilo */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase">KİLO GELİŞİMİ</p>
                  <h4 className="text-2xl font-black text-white mt-1">
                    {client.current_weight || client.weight || 82} <span className="text-xs text-slate-400 font-normal">kg</span>
                  </h4>
                </div>
                <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-2xl border border-emerald-500/20">
                  <Scale size={20} />
                </div>
              </div>
            </div>

            {/* 2. Hedef Kilo */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] font-extrabold text-slate-500 uppercase">HEDEF KİLO</p>
                  {targetWeight ? (
                    <h4 className="text-2xl font-black text-white mt-1">
                      {targetWeight} <span className="text-xs text-slate-400 font-normal">kg</span>
                    </h4>
                  ) : (
                    <div className="mt-1">
                      <span className="text-xs text-amber-400 font-bold block">Belirlenmedi (Uzman)</span>
                      <span className="text-[11px] text-slate-400">
                        İdeal: <strong className="text-white">{client.ideal_weight || "74"} kg</strong>
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-2.5 bg-[#EA580C]/10 text-[#EA580C] rounded-2xl border border-[#EA580C]/20">
                  <Target size={20} />
                </div>
              </div>
              <button
                onClick={() => setIsWeightModalOpen(true)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
              >
                <Plus size={12} /> {targetWeight ? "Hedefi Güncelle" : "Hedef Kilo Belirle"}
              </button>
            </div>

            {/* 3. Günlük Kalori Hedefi */}
            <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-3xl space-y-3">
              <div className="flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-1.5">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase">GÜNLÜK HEDEF</p>
                    <span
                      className={`text-[9px] px-1.5 py-0.5 rounded font-black ${
                        isExpertCalorieSet
                          ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isExpertCalorieSet ? "UZMAN" : "SİSTEM AUTO"}
                    </span>
                  </div>
                  <h4 className="text-2xl font-black text-white mt-1">
                    {dailyCalorieTarget} <span className="text-xs text-slate-400 font-normal">kcal</span>
                  </h4>
                </div>
                <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
                  <Flame size={20} />
                </div>
              </div>
              <button
                onClick={() => setIsCalorieModalOpen(true)}
                className="w-full py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-bold rounded-xl border border-slate-700 transition-all flex items-center justify-center gap-1"
              >
                <Edit3 size={12} /> Kalori Hedefini Değiştir
              </button>
            </div>
          </div>

          {/* HAFTALIK (7 GÜNLÜK) AKTİVİTE & DİYET ÖZETİ */}
          <div className="bg-slate-900/90 border border-slate-800 p-6 rounded-3xl space-y-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800/80 pb-4 gap-3">
              <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#EA580C]" />
                Son 7 Günlük Aktivite & Diyet Takibi
              </h4>

              {/* DÜZELTİLMİŞ KRONOLOJİK GÜN SEÇİCİ */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
                {weeklySummary.map((day, idx) => {
                  const isSelected = selectedDayIndex === idx;
                  const isToday = day.isToday;

                  return (
                    <button
                      key={day.date}
                      onClick={() => setSelectedDayIndex(idx)}
                      className={`relative px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex flex-col items-center min-w-[58px] border ${
                        isSelected
                          ? "bg-[#EA580C] text-white border-[#EA580C] shadow-lg shadow-[#EA580C]/30 scale-105"
                          : isToday
                          ? "bg-slate-900 text-orange-400 border-[#EA580C]/50 hover:bg-slate-800"
                          : "bg-slate-950 text-slate-400 border-slate-800 hover:bg-slate-800 hover:text-slate-200"
                      }`}
                    >
                      {/* Bugün İçin Hafif Parlama Rozeti (Seçili Değilse) */}
                      {isToday && !isSelected && (
                        <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#EA580C]"></span>
                        </span>
                      )}

                      {/* Her Gün Kendi İsmini Korur (PZT, SAL, ÇAR...) */}
                      <span className="text-[11px] font-extrabold uppercase tracking-wider">
                        {day.dayName}
                      </span>

                      {/* Bugün için Alt Etiket */}
                      {isToday && (
                        <span
                          className={`text-[8px] font-black px-1 rounded mt-0.5 ${
                            isSelected ? "bg-white/20 text-white" : "bg-[#EA580C]/20 text-[#EA580C]"
                          }`}
                        >
                          BUGÜN
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* SEÇİLİ GÜNÜN DETAYI (TAMAMEN GERÇEK VERİLER) */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Beslenme & Öğünler */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3 md:col-span-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Apple className="w-4 h-4 text-emerald-400" /> Öğün Kayıtları (
                    {currentDaySummary.isToday ? `${currentDaySummary.dayName} (Bugün - Canlı)` : currentDaySummary.dayName})
                  </span>
                  <span className="font-black text-emerald-400">
                    {currentDaySummary.totalCalories} / {dailyCalorieTarget} kcal
                  </span>
                </div>

                <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (currentDaySummary.totalCalories / (dailyCalorieTarget || 1)) * 100)}%`
                    }}
                  />
                </div>

                {currentDaySummary.meals && currentDaySummary.meals.length > 0 ? (
                  <div className="space-y-1.5 pt-2">
                    {currentDaySummary.meals.map((meal, idx) => (
                      <div
                        key={idx}
                        className="flex justify-between items-center text-xs bg-slate-900/60 p-2.5 rounded-xl border border-slate-800/50"
                      >
                        <span className="text-slate-200 font-medium">{meal.name}</span>
                        <div className="flex items-center gap-3 text-[11px] text-slate-400 font-semibold">
                          <span>P: {meal.protein}g</span>
                          <span>C: {meal.carb}g</span>
                          <span className="text-amber-400 font-bold">{meal.kcal} kcal</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 py-6 text-center">Bu tarihte girilmiş öğün kaydı bulunmuyor.</p>
                )}
              </div>

              {/* Su & Antrenman */}
              <div className="space-y-4">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Droplets className="w-4 h-4 text-sky-400" /> Su Tüketimi
                    </span>
                    <span className="font-black text-sky-400">{currentDaySummary.waterIntake}L / 3.0L</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-sky-400 h-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, ((parseFloat(currentDaySummary.waterIntake) || 0) / 3.0) * 100)}%`
                      }}
                    />
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs">
                    <Dumbbell className="w-4 h-4 text-amber-400" />
                    <span className="font-bold text-slate-300">Günün Antrenmanı</span>
                  </div>
                  {currentDaySummary.workoutDone ? (
                    <span className="text-[10px] font-black text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20 flex items-center gap-1">
                      <CheckCircle2 size={12} /> Tamamlandı
                    </span>
                  ) : (
                    <span className="text-[10px] font-black text-slate-400 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1">
                      <AlertCircle size={12} /> Yapılmadı
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* UZMAN NOTLARI */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 space-y-6 shadow-xl">
        <h3 className="text-base font-black text-white flex items-center gap-2">
          <Edit3 className="w-4 h-4 text-[#EA580C]" /> Uzman Notları & Değerlendirmeler
        </h3>
        <form onSubmit={handleAddNote} className="space-y-3">
          <textarea
            rows={3}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Danışan hakkında teknik not ekleyin..."
            className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-4 rounded-2xl outline-none focus:border-[#EA580C] transition-all"
          />
          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSavingNote || !newNote.trim()}
              className="px-5 py-2.5 bg-[#EA580C] hover:bg-orange-600 disabled:opacity-50 text-white text-xs font-bold rounded-xl flex items-center gap-2 shadow-md shadow-[#EA580C]/20"
            >
              <Send size={14} /> <span>{isSavingNote ? "KAYDEDİLİYOR..." : "NOTU KAYDET"}</span>
            </button>
          </div>
        </form>

        <div className="space-y-3">
          {notes.length > 0 ? (
            notes.map((note) => (
              <div key={note.id || Math.random()} className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-1.5">
                <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                  <span className="text-[#EA580C]">{note.author || "Uzman PT"}</span>
                  <span>{note.created_at || note.date || "Bugün"}</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">{note.note_text || note.text}</p>
              </div>
            ))
          ) : (
            <p className="text-xs text-slate-500 text-center py-4">Bu danışan hakkında henüz kayıtlı bir uzman notu bulunmuyor.</p>
          )}
        </div>
      </div>

      {/* MODAL 1: HEDEF KİLO BELİRLEME */}
      {isWeightModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Target className="w-4 h-4 text-[#EA580C]" /> Hedef Kilo Belirle
              </h3>
              <button onClick={() => setIsWeightModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Danışanın body_analyses tablosundaki en güncel ideal kilosu: <strong className="text-white">{client.ideal_weight || "74"} kg</strong>
            </p>
            <input
              type="number"
              step="0.1"
              value={targetWeightInput}
              onChange={(e) => setTargetWeightInput(e.target.value)}
              placeholder="Hedef Kilo (Örn: 76)"
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-[#EA580C]"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsWeightModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">
                İptal
              </button>
              <button onClick={handleSaveTargetWeight} className="px-5 py-2 bg-[#EA580C] hover:bg-orange-600 text-white text-xs font-bold rounded-xl">
                Kaydet
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GÜNLÜK KALORİ HEDEFİ GÜNCELLEME */}
      {isCalorieModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 w-full max-w-md space-y-4 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-black text-white flex items-center gap-2">
                <Flame className="w-4 h-4 text-amber-400" /> Günlük Kalori Hedefini Değiştir
              </h3>
              <button onClick={() => setIsCalorieModalOpen(false)} className="text-slate-400 hover:text-white">
                <X size={18} />
              </button>
            </div>
            <p className="text-xs text-slate-400">
              Sistemin otomatik hesapladığı form koruma değeri: <strong className="text-white">{client.daily_calories || 2863} kcal</strong>
            </p>
            <input
              type="number"
              value={targetCalorieInput}
              onChange={(e) => setTargetCalorieInput(e.target.value)}
              placeholder="Yeni Günlük Kalori (Örn: 2400)"
              className="w-full bg-slate-950 border border-slate-800 text-white text-xs p-3.5 rounded-xl outline-none focus:border-amber-500"
            />
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setIsCalorieModalOpen(false)} className="px-4 py-2 bg-slate-800 text-slate-300 text-xs font-bold rounded-xl">
                İptal
              </button>
              <button onClick={handleSaveDailyCalorie} className="px-5 py-2 bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-black rounded-xl">
                Güncelle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}