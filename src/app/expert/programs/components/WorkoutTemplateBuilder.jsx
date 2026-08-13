"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  Plus,
  Trash2,
  Save,
  Dumbbell,
  Video,
  Upload,
  FileVideo,
  Loader2,
  Sparkles,
  ChevronDown,
  Check
} from "lucide-react";
import MuscleSelector from "./MuscleSelector";

// Anatomi Key'lerini DB Muscle Group / Target Muscles etiketleriyle eşleme haritası
const MUSCLE_MAP = {
  CORE_UPPER_ABS: ["core", "üst karın", "karın", "abs"],
  CORE_LOWER_ABS: ["core", "alt karın", "karın", "abs"],
  CORE_OBLES: ["core", "yan karın", "oblik", "karın", "abs"],
  CHEST_UPPER: ["göğüs", "üst göğüs", "chest"],
  CHEST_MID: ["göğüs", "orta göğüs", "chest"],
  CHEST_LOWER: ["göğüs", "alt göğüs", "chest"],
  BACK_LATS: ["sırt", "kanat", "lats", "back"],
  BACK_MID: ["sırt", "orta sırt", "back"],
  BACK_TRAPS: ["trapez", "sırt", "back"],
  BACK_LOWER: ["alt bel", "bel", "sırt", "lower back"],
  SHOULDER_FRONT: ["ön omuz", "omuz", "shoulder"],
  SHOULDER_SIDE: ["yan omuz", "omuz", "shoulder"],
  SHOULDER_REAR: ["arka omuz", "omuz", "shoulder"],
  ARM_BICEPS: ["biceps", "pazu", "kol", "arm"],
  ARM_TRICEPS: ["triceps", "arka kol", "kol", "arm"],
  ARM_FOREARM: ["ön kol", "forearm", "kol"],
  LEG_QUADRICEPS: ["quadriceps", "ön bacak", "bacak", "leg"],
  LEG_HAMSTRING: ["hamstring", "arka bacak", "bacak", "leg"],
  LEG_GLUTE: ["glute", "kalça", "bacak"],
  LEG_CALVES: ["baldır", "kalf", "calves", "bacak"]
};

// Türkçe Karakter Duyarsız Arama Yardımcısı
const trNormalize = (str) => {
  if (!str) return "";
  return str
    .toString()
    .replace(/İ/g, "i")
    .replace(/I/g, "ı")
    .toLowerCase()
    .replace(/ç/g, "c")
    .replace(/ğ/g, "g")
    .replace(/ı/g, "i")
    .replace(/ö/g, "o")
    .replace(/ş/g, "s")
    .replace(/ü/g, "u")
    .trim();
};

// Kas grubu eşleşme kontrolü
const isMuscleMatch = (targetKey, exerciseMuscleGroup, exerciseTargets) => {
  const normTarget = trNormalize(targetKey);
  const mappedKeywords = MUSCLE_MAP[targetKey] || [normTarget];

  const normGroup = trNormalize(exerciseMuscleGroup);
  let normTargets = [];
  if (Array.isArray(exerciseTargets)) {
    normTargets = exerciseTargets.map(trNormalize);
  } else if (typeof exerciseTargets === "string") {
    normTargets = [trNormalize(exerciseTargets)];
  }

  return mappedKeywords.some((keyword) => {
    const normKeyword = trNormalize(keyword);
    if (normGroup.includes(normKeyword) || normKeyword.includes(normGroup)) return true;
    return normTargets.some((t) => t.includes(normKeyword) || normKeyword.includes(t));
  });
};

export default function WorkoutTemplateBuilder({ isOpen, onClose, onSave, initialData }) {
  const [mounted, setMounted] = useState(false);
  const [title, setTitle] = useState("");
  const [level, setLevel] = useState("Başlangıç");
  const [duration, setDuration] = useState("");
  const [targetMuscles, setTargetMuscles] = useState([]);
  const [exercises, setExercises] = useState([]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  // Önerilen Hareketler State'leri
  const [availableExercises, setAvailableExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [activeDropdownId, setActiveDropdownId] = useState(null);

  const dropdownRefs = useRef({});

  useEffect(() => {
    setMounted(true);
  }, []);

  // Kütüphanedeki hareketleri canlı API'den çek
  useEffect(() => {
    if (!isOpen) return;

    const fetchAvailableExercises = async () => {
      setLoadingExercises(true);
      try {
        let res = await fetch("/api/expert/exercises");
        if (!res.ok) {
          res = await fetch("/api/exercises");
        }
        if (res.ok) {
          const data = await res.json();
          const list = Array.isArray(data) ? data : data.exercises || data.data || [];
          setAvailableExercises(list);
        } else {
          setAvailableExercises([]);
        }
      } catch (err) {
        console.error("Önerilen hareketler yüklenirken hata oluştu:", err);
        setAvailableExercises([]);
      } finally {
        setLoadingExercises(false);
      }
    };

    fetchAvailableExercises();
  }, [isOpen]);

  // Dropdown dışına tıklandığında menüyü kapatma
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (activeDropdownId !== null) {
        const currentRef = dropdownRefs.current[activeDropdownId];
        if (currentRef && !currentRef.contains(event.target)) {
          setActiveDropdownId(null);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdownId]);

  // initialData veya modal açıldığında form alanlarını sıfırla / doldur
  useEffect(() => {
    if (isOpen && initialData) {
      setTitle(initialData.title || initialData.name || "");
      setLevel(initialData.level || initialData.difficulty_level || initialData.difficulty || "Başlangıç");
      setDuration(initialData.duration || initialData.duration_minutes || "");
      setTargetMuscles(initialData.targetMuscles || initialData.target_muscles || []);

      if (initialData.exercises && initialData.exercises.length > 0) {
        setExercises(
          initialData.exercises.map((ex, idx) => {
            const videoUrl = ex.video_url || ex.mediaLink || ex.media_link || ex.videoUrl || "";
            let mediaType = ex.mediaType || ex.media_type || "none";

            if ((!mediaType || mediaType === "none") && videoUrl) {
              mediaType = videoUrl.includes("youtube") || videoUrl.includes("youtu.be") ? "youtube" : "file";
            }

            return {
              id: ex.id || Date.now() + idx,
              exercise_id: ex.exercise_id || ex.exerciseId || null,
              name: ex.name || ex.exercise_name || "",
              sets: ex.sets !== undefined && ex.sets !== null ? String(ex.sets) : "3",
              reps: ex.reps !== undefined && ex.reps !== null ? String(ex.reps) : "12",
              mediaType: mediaType,
              mediaLink: videoUrl,
              mediaFile: null
            };
          })
        );
      } else {
        setExercises([
          { id: Date.now(), exercise_id: null, name: "", sets: "", reps: "", mediaType: "none", mediaLink: "", mediaFile: null }
        ]);
      }
    } else if (isOpen) {
      setTitle("");
      setLevel("Başlangıç");
      setDuration("");
      setTargetMuscles([]);
      setExercises([
        { id: Date.now(), exercise_id: null, name: "", sets: "", reps: "", mediaType: "none", mediaLink: "", mediaFile: null }
      ]);
    }
    setErrorMessage("");
  }, [isOpen, initialData]);

  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen || !mounted) return null;

  const addExercise = () => {
    setExercises([
      ...exercises,
      { id: Date.now(), exercise_id: null, name: "", sets: "", reps: "", mediaType: "none", mediaLink: "", mediaFile: null }
    ]);
  };

  const updateExercise = (id, field, value) => {
    setExercises((prev) => prev.map((ex) => (ex.id === id ? { ...ex, [field]: value } : ex)));
  };

  const ALLOWED_EXTENSIONS = ["mp4", "webm", "gif"];

  const handleFileSelect = (id, file) => {
    if (!file) return;
    const ext = file.name.split(".").pop().toLowerCase();
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      alert("Sadece .mp4, .webm veya .gif uzantılı dosyalar yüklenebilir.");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setExercises((prev) =>
      prev.map((ex) => (ex.id === id ? { ...ex, mediaFile: file, mediaLink: previewUrl } : ex))
    );
  };

  const removeExercise = (id) => {
    setExercises(exercises.filter((ex) => ex.id !== id));
  };

  // Önerilen hareketlerden seçim yapıldığında ilgili satırı dinamik güncelle
  const handleSelectSuggestedExercise = (rowId, suggestedEx) => {
    const videoUrl = suggestedEx.video_url || suggestedEx.videoUrl || suggestedEx.mediaLink || "";
    let mediaType = "none";
    if (videoUrl) {
      mediaType = videoUrl.includes("youtube") || videoUrl.includes("youtu.be") ? "youtube" : "file";
    }

    setExercises((prev) =>
      prev.map((ex) => {
        if (ex.id === rowId) {
          return {
            ...ex,
            exercise_id: suggestedEx.id || ex.exercise_id,
            name: suggestedEx.name || ex.name,
            mediaType: mediaType,
            mediaLink: videoUrl,
            mediaFile: null
          };
        }
        return ex;
      })
    );
    setActiveDropdownId(null);
  };

  // Hızlı Öneri çiplerinden tıklandığında ekleme yapma
  const handleQuickAddSuggested = (suggestedEx) => {
    const videoUrl = suggestedEx.video_url || suggestedEx.videoUrl || suggestedEx.mediaLink || "";
    let mediaType = "none";
    if (videoUrl) {
      mediaType = videoUrl.includes("youtube") || videoUrl.includes("youtu.be") ? "youtube" : "file";
    }

    const lastEx = exercises[exercises.length - 1];
    if (lastEx && !lastEx.name.trim()) {
      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === lastEx.id
            ? {
                ...ex,
                exercise_id: suggestedEx.id || null,
                name: suggestedEx.name,
                mediaType: mediaType,
                mediaLink: videoUrl,
                mediaFile: null
              }
            : ex
        )
      );
    } else {
      setExercises((prev) => [
        ...prev,
        {
          id: Date.now(),
          exercise_id: suggestedEx.id || null,
          name: suggestedEx.name,
          sets: "3",
          reps: "12",
          mediaType: mediaType,
          mediaLink: videoUrl,
          mediaFile: null
        }
      ]);
    }
  };

  // Tamamen Dinamik Filtreleme Fonksiyonu
  const getFilteredSuggestions = (searchQuery = "") => {
    if (!availableExercises || availableExercises.length === 0) return [];

    const normQuery = trNormalize(searchQuery);

    return availableExercises.filter((item) => {
      // 1. Arama Metni Filtresi (İsim, Kas Grubu veya Target Muscle uyuşması)
      let matchesQuery = true;
      if (normQuery) {
        const nameMatch = trNormalize(item.name).includes(normQuery);
        const groupMatch = trNormalize(item.muscle_group).includes(normQuery);
        let targetMatch = false;

        if (Array.isArray(item.target_muscles)) {
          targetMatch = item.target_muscles.some((tm) => trNormalize(tm).includes(normQuery));
        } else if (typeof item.target_muscles === "string") {
          targetMatch = trNormalize(item.target_muscles).includes(normQuery);
        }

        matchesQuery = nameMatch || groupMatch || targetMatch;
      }

      if (!matchesQuery) return false;

      // 2. Seçili Kas Grubu Katı Filtresi
      // Hedef kas seçilmişse SADECE o kas grubuna uyan hareketler gelsin!
      if (targetMuscles && targetMuscles.length > 0) {
        const matchesMuscle = targetMuscles.some((targetKey) =>
          isMuscleMatch(targetKey, item.muscle_group, item.target_muscles)
        );
        return matchesMuscle;
      }

      return true;
    });
  };

  const filteredSuggestionsForBar = getFilteredSuggestions("");

  const handleSave = async () => {
    try {
      setErrorMessage("");
      if (!title.trim()) {
        setErrorMessage("Lütfen bir program adı girin.");
        return;
      }
      if (exercises.length === 0) {
        setErrorMessage("En az bir egzersiz eklemelisiniz.");
        return;
      }

      setIsSubmitting(true);

      const formData = new FormData();
      if (initialData?.id) {
        formData.append("id", initialData.id);
      }
      formData.append("title", title);
      formData.append("level", level);
      formData.append("duration", Number(duration) || 0);
      formData.append("trainer_id", initialData?.trainer_id || 4);

      formData.append("targetMuscles", JSON.stringify(targetMuscles));
      formData.append("target_muscles", JSON.stringify(targetMuscles));

      const exercisesPayload = exercises.map((ex, idx) => {
        if (ex.mediaFile) {
          formData.append(`exercise_file_${idx}`, ex.mediaFile);
        }
        return {
          id: ex.id,
          exercise_id: ex.exercise_id || null,
          name: ex.name,
          sets: Number(ex.sets) || 3,
          reps: String(ex.reps || "12"),
          mediaType: ex.mediaType,
          mediaLink: ex.mediaType === "youtube" ? ex.mediaLink : ex.mediaFile ? `exercise_file_${idx}` : ex.mediaLink
        };
      });

      formData.append("exercises", JSON.stringify(exercisesPayload));

      const endpoint = initialData?.id
        ? `/api/expert/workout-templates/${initialData.id}`
        : `/api/expert/workout-templates`;

      const method = initialData?.id ? "PUT" : "POST";

      const response = await fetch(endpoint, {
        method: method,
        body: formData
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || errorData.message || "Şablon kaydedilirken bir sunucu hatası oluştu.");
      }

      let savedTemplate = {};
      const contentType = response.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        savedTemplate = await response.json();
      }

      if (onSave) {
        onSave(savedTemplate);
      }
      onClose();
    } catch (err) {
      console.error("Kayıt hatası:", err);
      setErrorMessage(err.message || "Bağlantı hatası oluştu.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-8 sm:pt-12 p-4 bg-black/85 backdrop-blur-md animate-in fade-in overflow-y-auto">
      <div className="bg-[#11142D] border border-slate-700/80 w-full max-w-4xl max-h-[85vh] overflow-y-auto rounded-3xl shadow-[0_0_50px_rgba(0,0,0,0.8)] flex flex-col text-sm text-slate-100 selection:bg-orange-500 selection:text-white -translate-y-11">
        
        {/* Header */}
        <div className="sticky top-0 bg-[#11142D]/95 backdrop-blur-xl z-20 flex justify-between items-center px-6 py-5 border-b border-slate-700/50">
          <div>
            <h2 className="text-lg font-black text-white">
              {initialData ? "Şablonu Düzenle" : "Yeni Antrenman Şablonu"}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">Elit danışanlarınız için kusursuz bir program tasarlayın.</p>
          </div>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="p-2 bg-slate-800/80 hover:bg-slate-700 rounded-full text-slate-300 transition-colors disabled:opacity-50"
          >
            <X size={16} />
          </button>
        </div>

        {/* Hata Alanı */}
        {errorMessage && (
          <div className="mx-6 mt-4 p-3 bg-rose-500/10 border border-rose-500/30 text-rose-400 rounded-xl text-xs font-semibold flex items-center justify-between">
            <span>{errorMessage}</span>
            <button onClick={() => setErrorMessage("")} className="text-rose-300 hover:text-white font-bold">
              &times;
            </button>
          </div>
        )}

        {/* Body */}
        <div className="p-6 md:p-8 space-y-6">
          {/* Form Alanları */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Program Adı</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Hipertrofi Göğüs & Biceps"
                className="w-full bg-[#11142D]/60 border border-slate-700/70 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Zorluk Seviyesi</label>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="w-full bg-[#11142D]/60 border border-slate-700/70 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none appearance-none cursor-pointer"
              >
                <option value="Başlangıç" className="bg-[#11142D]">Başlangıç Seviye</option>
                <option value="Orta Seviye" className="bg-[#11142D]">Orta Seviye</option>
                <option value="İleri Seviye" className="bg-[#11142D]">İleri Seviye</option>
                <option value="Elit Atlet" className="bg-[#11142D]">Elit Atlet</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Tahmini Süre (Dk)</label>
              <input
                type="number"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="Örn: 45"
                className="w-full bg-[#11142D]/60 border border-slate-700/70 text-white rounded-xl p-3 text-sm focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all placeholder:text-slate-500"
              />
            </div>
          </div>

          {/* Muscle Selector */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-white">Hedef Kas Grupları</h3>
            <MuscleSelector selectedMuscles={targetMuscles} onChange={setTargetMuscles} />
          </div>

          {/* Dinamik Önerilen Hareketler Barı */}
          <div className="bg-[#181C3B]/80 border border-slate-700/60 rounded-2xl p-4 space-y-2.5 shadow-inner">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-amber-400 animate-pulse" />
                <span className="text-xs font-bold text-amber-300 tracking-wide uppercase">
                  Önerilen Hareketler {targetMuscles.length > 0 ? "(Seçili Kas Grubu İçin)" : ""}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">Tıklayarak programa ekleyebilirsiniz</span>
            </div>

            {loadingExercises ? (
              <div className="flex items-center gap-2 text-xs text-slate-400 py-2">
                <Loader2 size={14} className="animate-spin text-orange-400" /> Hareketler yükleniyor...
              </div>
            ) : filteredSuggestionsForBar.length > 0 ? (
              <div className="flex flex-wrap gap-2 pt-1">
                {filteredSuggestionsForBar.slice(0, 8).map((sugEx) => {
                  const isAlreadyAdded = exercises.some(
                    (ex) => trNormalize(ex.name) === trNormalize(sugEx.name)
                  );
                  return (
                    <button
                      key={sugEx.id}
                      type="button"
                      onClick={() => handleQuickAddSuggested(sugEx)}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all duration-200 border ${
                        isAlreadyAdded
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20"
                          : "bg-slate-800/90 border-slate-700/80 text-slate-200 hover:border-orange-500/60 hover:bg-orange-500/10 hover:text-orange-300 shadow-sm"
                      }`}
                    >
                      {isAlreadyAdded ? <Check size={13} className="text-emerald-400" /> : <Plus size={13} className="text-orange-400" />}
                      <span>{sugEx.name}</span>
                      {sugEx.muscle_group && (
                        <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-black/30 text-slate-400 font-mono">
                          {sugEx.muscle_group}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 text-xs text-slate-400 italic bg-black/20 rounded-xl">
                {targetMuscles.length > 0
                  ? "Seçtiğiniz kas grubuna ait veritabanında henüz hareket bulunmuyor."
                  : "Veritabanında kayıtlı egzersiz bulunamadı."}
              </div>
            )}
          </div>

          {/* Egzersiz Listesi */}
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-700/50 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Dumbbell size={16} className="text-orange-500" />
                Egzersiz Listesi
              </h3>
              <button
                onClick={addExercise}
                type="button"
                className="flex items-center gap-1.5 text-xs font-bold text-orange-400 hover:text-orange-300 transition-colors bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/30"
              >
                <Plus size={14} />
                Hareket Ekle
              </button>
            </div>

            <div className="space-y-4">
              {exercises.map((ex, index) => {
                const searchResults = getFilteredSuggestions(ex.name);

                return (
                  <div key={ex.id} className="bg-[#11142D]/40 border border-slate-700/50 rounded-2xl p-5 relative group backdrop-blur-sm shadow-md">
                    <div className="absolute -left-2.5 -top-2.5 bg-gradient-to-r from-orange-600 to-amber-500 text-white w-6 h-6 rounded-full flex items-center justify-center font-black text-xs border-[3px] border-[#11142D] shadow-lg">
                      {index + 1}
                    </div>
                    <button
                      onClick={() => removeExercise(ex.id)}
                      type="button"
                      className="absolute top-4 right-4 text-slate-400 hover:text-rose-400 p-1.5 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 size={15} />
                    </button>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 mt-1.5">
                      {/* Hareket Adı Input ve Canlı Dropdown */}
                      <div className="lg:col-span-4 space-y-1 relative" ref={(el) => (dropdownRefs.current[ex.id] = el)}>
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex items-center justify-between">
                          <span>Hareket Adı</span>
                          {availableExercises.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveDropdownId(activeDropdownId === ex.id ? null : ex.id)}
                              className="text-[10px] text-orange-400 hover:text-orange-300 font-medium flex items-center gap-1 hover:underline"
                            >
                              <Sparkles size={10} />
                              Canlı Öneriler
                            </button>
                          )}
                        </label>

                        <div className="relative">
                          <input
                            type="text"
                            placeholder="Örn: Incline Bench Press"
                            value={ex.name}
                            onFocus={() => setActiveDropdownId(ex.id)}
                            onChange={(e) => {
                              updateExercise(ex.id, "name", e.target.value);
                              if (activeDropdownId !== ex.id) setActiveDropdownId(ex.id);
                            }}
                            className="w-full bg-[#11142D] border border-slate-700/70 text-white text-xs rounded-xl p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none placeholder:text-slate-500 transition-all pr-8"
                          />
                          {availableExercises.length > 0 && (
                            <button
                              type="button"
                              onClick={() => setActiveDropdownId(activeDropdownId === ex.id ? null : ex.id)}
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                            >
                              <ChevronDown size={14} className={`transition-transform duration-200 ${activeDropdownId === ex.id ? "rotate-180 text-orange-400" : ""}`} />
                            </button>
                          )}
                        </div>

                        {/* Dropdown Öneri Menüsü */}
                        {activeDropdownId === ex.id && availableExercises.length > 0 && (
                          <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-[#161938] border border-slate-700/90 rounded-xl shadow-2xl overflow-hidden max-h-56 overflow-y-auto divide-y divide-slate-800/80 backdrop-blur-2xl animate-in fade-in zoom-in-95">
                            <div className="p-2 bg-[#11142D] text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-800">
                              <span className="flex items-center gap-1">
                                <Sparkles size={11} className="text-amber-400" /> Hareket Kütüphanesi
                              </span>
                              <span>{searchResults.length} Sonuç</span>
                            </div>

                            {searchResults.length > 0 ? (
                              searchResults.map((sug) => {
                                const isSelected = trNormalize(ex.name) === trNormalize(sug.name);
                                return (
                                  <button
                                    key={sug.id}
                                    type="button"
                                    onClick={() => handleSelectSuggestedExercise(ex.id, sug)}
                                    className={`w-full text-left p-2.5 hover:bg-orange-500/15 transition-colors flex items-center justify-between group ${
                                      isSelected ? "bg-orange-500/10 border-l-2 border-orange-500" : ""
                                    }`}
                                  >
                                    <div className="space-y-0.5 pr-2">
                                      <div className="text-xs font-semibold text-slate-100 group-hover:text-orange-300 transition-colors flex items-center gap-1.5">
                                        <span>{sug.name}</span>
                                        {(sug.video_url || sug.mediaLink) && (
                                          <Video size={12} className="text-red-400 flex-shrink-0" />
                                        )}
                                      </div>
                                      <div className="flex items-center gap-2 text-[10px] text-slate-400">
                                        {sug.muscle_group && <span className="text-amber-400 font-medium">{sug.muscle_group}</span>}
                                        {sug.difficulty_level && <span className="text-slate-500">• {sug.difficulty_level}</span>}
                                      </div>
                                    </div>
                                    {isSelected ? (
                                      <Check size={14} className="text-orange-400 flex-shrink-0" />
                                    ) : (
                                      <Plus size={14} className="text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                                    )}
                                  </button>
                                );
                              })
                            ) : (
                              <div className="p-3 text-center text-xs text-slate-400">
                                Aranan kriterde hareket bulunamadı. Kendi tanımınızı bırakabilirsiniz.
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Set */}
                      <div className="lg:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Set</label>
                        <input
                          type="number"
                          placeholder="Örn: 4"
                          value={ex.sets}
                          onChange={(e) => updateExercise(ex.id, "sets", e.target.value)}
                          className="w-full bg-[#11142D] border border-slate-700/70 text-white text-xs rounded-xl p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none placeholder:text-slate-500 transition-all"
                        />
                      </div>

                      {/* Tekrar */}
                      <div className="lg:col-span-2 space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide">Tekrar</label>
                        <input
                          type="text"
                          placeholder="Örn: 10-12"
                          value={ex.reps}
                          onChange={(e) => updateExercise(ex.id, "reps", e.target.value)}
                          className="w-full bg-[#11142D] border border-slate-700/70 text-white text-xs rounded-xl p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none placeholder:text-slate-500 transition-all"
                        />
                      </div>

                      {/* Medya Seçimi */}
                      <div className="lg:col-span-4 space-y-1">
                        <label className="text-[10px] font-bold text-slate-300 uppercase tracking-wide flex items-center gap-1">
                          <Video size={11} /> Medya Seçimi
                        </label>
                        <div className="flex gap-2">
                          <select
                            value={ex.mediaType}
                            onChange={(e) => {
                              const newType = e.target.value;
                              updateExercise(ex.id, "mediaType", newType);
                              updateExercise(ex.id, "mediaLink", "");
                              updateExercise(ex.id, "mediaFile", null);
                            }}
                            className="w-1/3 bg-[#11142D] border border-slate-700/70 text-white text-xs rounded-xl p-3 outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500 cursor-pointer"
                          >
                            <option value="none" className="bg-[#11142D]">Yok</option>
                            <option value="youtube" className="bg-[#11142D]">YouTube</option>
                            <option value="file" className="bg-[#11142D]">Dosya</option>
                          </select>

                          <div className="w-2/3">
                            {ex.mediaType === "youtube" && (
                              <input
                                type="text"
                                placeholder="YouTube URL..."
                                value={ex.mediaLink}
                                onChange={(e) => updateExercise(ex.id, "mediaLink", e.target.value)}
                                className="w-full bg-[#11142D] border border-slate-700/70 text-white text-xs rounded-xl p-3 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none placeholder:text-slate-500 transition-all"
                              />
                            )}

                            {ex.mediaType === "file" && (
                              <div className="flex items-center gap-2">
                                <input
                                  type="file"
                                  id={`media-file-${ex.id}`}
                                  accept=".mp4,.webm,.gif,video/mp4,video/webm,image/gif"
                                  onChange={(e) => handleFileSelect(ex.id, e.target.files?.[0])}
                                  className="hidden"
                                />
                                <label
                                  htmlFor={`media-file-${ex.id}`}
                                  className="flex items-center justify-center gap-1.5 w-full bg-[#11142D] border border-dashed border-slate-600 hover:border-orange-500 text-slate-300 hover:text-white text-xs rounded-xl p-3 cursor-pointer transition-colors"
                                >
                                  <Upload size={12} />
                                  {ex.mediaFile ? "Değiştir" : "Dosya Seç (.mp4 / .webm / .gif)"}
                                </label>
                              </div>
                            )}

                            {ex.mediaType === "none" && (
                              <input
                                type="text"
                                disabled
                                placeholder="Medya tipi seçin..."
                                className="w-full bg-[#11142D] border border-slate-700/70 text-white text-xs rounded-xl p-3 outline-none placeholder:text-slate-600 disabled:opacity-50"
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-[#11142D]/95 backdrop-blur-xl border-t border-slate-700/50 p-4 px-6 flex justify-end gap-3 z-20">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800 transition-colors text-xs font-bold disabled:opacity-50"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-gradient-to-r from-orange-600 to-amber-500 hover:from-orange-500 hover:to-amber-400 text-white px-6 py-2.5 rounded-xl font-bold text-xs shadow-lg shadow-orange-500/20 transition-all disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Kaydediliyor...
              </>
            ) : (
              <>
                <Save size={14} /> Şablonu Kaydet
              </>
            )}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}