"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  X,
  Plus,
  Utensils,
  Flame,
  Beef,
  Wheat,
  Droplet,
  Trash2,
  Check,
  Sparkles,
  Clock,
  Layers,
  BookOpen,
  Search,
  CheckCircle2,
  SlidersHorizontal,
  Loader2,
  AlertCircle,
  CheckSquare,
} from "lucide-react";

const WEEK_DAYS = ["Pzt", "Sal", "Çar", "Per", "Cum", "Cmt", "Paz"];

const DIET_CONCEPTS = {
  "Ketojenik & Düşük Karb": {
    pRatio: 0.2,
    cRatio: 0.05,
    fRatio: 0.75,
    label: "Ketojenik (%20 P / %5 K / %75 Yağ)",
  },
  "Vejeteryan Beslenme": {
    pRatio: 0.2,
    cRatio: 0.55,
    fRatio: 0.25,
    label: "Vejeteryan (%20 P / %55 K / %25 Yağ)",
  },
  "Glutensiz & Detoks": {
    pRatio: 0.2,
    cRatio: 0.55,
    fRatio: 0.25,
    label: "Glutensiz & Detoks (%20 P / %55 K / %25 Yağ)",
  },
  "Dengeli Beslenme & Sağlık": {
    pRatio: 0.25,
    cRatio: 0.5,
    fRatio: 0.25,
    label: "Dengeli Beslenme (%25 P / %50 K / %25 Yağ)",
  },
  "Kilo Verme & Definisyon": {
    pRatio: 0.35,
    cRatio: 0.4,
    fRatio: 0.25,
    label: "Kilo Verme & Definisyon (%35 P / %40 K / %25 Yağ)",
  },
  "Kas Kazanımı & Hipertrofi": {
    pRatio: 0.3,
    cRatio: 0.5,
    fRatio: 0.2,
    label: "Kas Kazanımı (%30 P / %50 K / %20 Yağ)",
  },
  "Akdeniz Diyeti": {
    pRatio: 0.2,
    cRatio: 0.45,
    fRatio: 0.35,
    label: "Akdeniz Diyeti (%20 P / %45 K / %35 Yağ)",
  },
};

const PRESET_FOOD_CATEGORIES = [
  { id: "all", label: "Tümü" },
  { id: "protein", label: "Yüksek Protein" },
  { id: "carbs", label: "Kompleks Karb" },
  { id: "fat", label: "Sağlıklı Yağ" },
  { id: "dairy", label: "Süt & Süt Ürünleri" },
  { id: "veg_fruit", label: "Sebze & Meyve" },
];

const PRESET_DIET_NOTES = [
  "Günlük en az 2.5 – 3 Litre taze su tüketilmelidir.",
  "Günde 8.000 – 10.000 adım atarak aktif kalmaya özen gösteriniz.",
  "Salatalarda yağ miktarını 1 tatlı kaşığı sızma zeytinyağı ile sınırlayınız.",
  "Son ana öğününüzü uykudan en az 3 saat önce tamamlayınız.",
  "Öğün aralarında şekersiz yeşil çay veya sade maden suyu tercih edebilirsiniz.",
  "Yemeklerde tuz kullanımını minimuma indirip baharatlardan destek alınız.",
];

const getUnitWeight = (unit) => {
  switch (unit) {
    case "g":
    case "ml":
      return 1;
    case "adet":
      return 50;
    case "dilim":
      return 30;
    case "tbsp":
      return 15;
    case "tsp":
      return 5;
    case "avuç":
      return 30;
    case "porsiyon":
      return 100;
    case "kase":
      return 200;
    default:
      return 1;
  }
};

export default function DietTemplateBuilder({
  isOpen,
  onClose,
  onSave,
  initialData,
  dietitianId,
}) {
  const [title, setTitle] = useState("");
  const [targetCalories, setTargetCalories] = useState(2000);
  const [goal, setGoal] = useState("Kilo Verme & Definisyon");
  const [tolerancePercent, setTolerancePercent] = useState(5);

  const [dayTypes, setDayTypes] = useState([]);
  const [activeDayIndex, setActiveDayIndex] = useState(0);
  const [selectedMealId, setSelectedMealId] = useState(null);

  const [generalNotes, setGeneralNotes] = useState([]);
  const [customNoteInput, setCustomNoteInput] = useState("");

  const [presetFoods, setPresetFoods] = useState([]);
  const [isLoadingFoods, setIsLoadingFoods] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    if (!isOpen) return;

    const fetchPresetFoods = async () => {
      setIsLoadingFoods(true);

      try {
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("token") ||
              localStorage.getItem("access_token")
            : null;

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
        };

        if (token && token !== "null" && token !== "undefined") {
          headers.Authorization = token.startsWith("Bearer ")
            ? token
            : `Bearer ${token}`;
        }

        if (!token || token === "null" || token === "undefined") {
          setPresetFoods([]);
          return;
        }

        const meRes = await fetch("/api/auth/me", {
          method: "GET",
          headers,
          credentials: "include",
        });

        if (!meRes.ok) {
          setPresetFoods([]);
          return;
        }

        const meData = await meRes.json();
        const currentUser = meData?.user || meData;

        const authenticatedUserId =
          currentUser?.id ??
          currentUser?.user_id ??
          currentUser?.userId ??
          currentUser?._id ??
          null;

        const authenticatedDietitianId =
          currentUser?.dietitian_id ??
          currentUser?.dietitianId ??
          authenticatedUserId ??
          null;

        const activeDietitianId =
          authenticatedDietitianId ??
          dietitianId ??
          initialData?.dietitian_id ??
          initialData?.dietitianId ??
          null;

        if (!activeDietitianId) {
          setPresetFoods([]);
          return;
        }

        const res = await fetch(
          `/api/expert-diet-program/foods?dietitian_id=${encodeURIComponent(
            activeDietitianId
          )}`,
          {
            method: "GET",
            headers,
            credentials: "include",
          }
        );

        if (!res.ok) {
          setPresetFoods([]);
          return;
        }

        const data = await res.json();
        const rawFoods = Array.isArray(data)
          ? data
          : data.foods || data.data || [];

        const mappedFoods = rawFoods.map((item) => ({
          id: item.id || `food-${Math.random()}`,
          name: item.name || "",
          category: item.category || "all",
          amount: Number(item.portion_amount ?? item.amount ?? 100),
          unit: item.unit || "g",
          calories: Number(item.calories) || 0,
          protein: Number(item.protein) || 0,
          carbs: Number(item.carbs) || 0,
          fat: Number(item.fat) || 0,
        }));

        setPresetFoods(mappedFoods);
      } catch (err) {
        setPresetFoods([]);
      } finally {
        setIsLoadingFoods(false);
      }
    };

    fetchPresetFoods();
  }, [isOpen, dietitianId, initialData]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (initialData) {
      setTitle(initialData.title || "");
      setTargetCalories(
        Number(initialData.target_calories ?? initialData.targetCalories) || 2000
      );
      setGoal(initialData.goal || "Kilo Verme & Definisyon");
      setTolerancePercent(
        Number(initialData.tolerance_percent ?? initialData.tolerancePercent ?? 5) || 5
      );
      setGeneralNotes(initialData.general_notes || initialData.generalNotes || []);

      const existingDayTypes = initialData.day_types || initialData.dayTypes;

      if (existingDayTypes && existingDayTypes.length > 0) {
        const mappedDays = existingDayTypes.map((day, idx) => ({
          ...day,
          name: day.name && !day.name.includes("Gün") ? day.name : WEEK_DAYS[idx % 7],
          meals: (day.meals || []).map((m, mIdx) => ({
            ...m,
            options: (m.options || []).map((opt) => ({
              ...opt,
              items: (opt.items || []).map((it) => ({
                ...it,
                category: it.category || "protein", // Kategori yoksa varsayılan
              })),
            })),
          })),
        }));
        setDayTypes(mappedDays);
      } else {
        createDefaultState();
      }
    } else {
      createDefaultState();
    }
  }, [initialData, isOpen]);

  const createDefaultState = () => {
    setTitle("");
    setTargetCalories(2000);
    setGoal("Kilo Verme & Definisyon");
    setGeneralNotes([]);
    setTolerancePercent(5);
    setActiveDayIndex(0);

    const mealId = `m-${Date.now()}-1`;
    const optionId = `opt-${Date.now()}-1`;

    const defaultMeals = [
      {
        id: mealId,
        name: "ANA ÖĞÜN 1",
        time: "08:30",
        activeOptionIndex: 0,
        options: [
          {
            id: optionId,
            title: "Seçenek 1",
            items: [],
          },
        ],
      },
    ];

    setDayTypes([
      {
        id: `day-${Date.now()}-1`,
        name: WEEK_DAYS[0],
        meals: defaultMeals,
      },
    ]);
    setSelectedMealId(mealId);
  };

  const currentDay = useMemo(
    () => dayTypes[activeDayIndex] || dayTypes[0] || { meals: [] },
    [dayTypes, activeDayIndex]
  );

  useEffect(() => {
    if (currentDay?.meals?.length > 0) {
      if (!selectedMealId || !currentDay.meals.some((m) => m.id === selectedMealId)) {
        setSelectedMealId(currentDay.meals[0].id);
      }
    } else {
      setSelectedMealId(null);
    }
  }, [activeDayIndex, dayTypes, currentDay, selectedMealId]);

  const targetMacros = useMemo(() => {
    const concept = DIET_CONCEPTS[goal] || DIET_CONCEPTS["Kilo Verme & Definisyon"];
    const calories = targetCalories || 2000;
    return {
      proteinGrams: Math.round((calories * concept.pRatio) / 4),
      carbsGrams: Math.round((calories * concept.cRatio) / 4),
      fatGrams: Math.round((calories * concept.fRatio) / 9),
      ratios: concept,
    };
  }, [targetCalories, goal]);

  const activeDayTotals = useMemo(() => {
    const activeDay = dayTypes[activeDayIndex] || dayTypes[0];
    if (!activeDay?.meals) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

    let calories = 0, protein = 0, carbs = 0, fat = 0;

    activeDay.meals.forEach((meal) => {
      const activeOptIndex = meal.activeOptionIndex || 0;
      const activeOpt = meal.options ? meal.options[activeOptIndex] || meal.options[0] : null;
      if (!activeOpt?.items) return;

      activeOpt.items.forEach((item) => {
        calories += Number(item.calories) || 0;
        protein += Number(item.protein) || 0;
        carbs += Number(item.carbs) || 0;
        fat += Number(item.fat) || 0;
      });
    });

    return {
      calories: Math.round(calories * 10) / 10,
      protein: Math.round(protein * 10) / 10,
      carbs: Math.round(carbs * 10) / 10,
      fat: Math.round(fat * 10) / 10,
    };
  }, [dayTypes, activeDayIndex]);

  const getToleranceStatus = (actual, target) => {
    if (!target || target === 0) return { inRange: true, diffPercent: 0, formatted: "0%" };
    const diffPercent = ((actual - target) / target) * 100;
    return {
      inRange: Math.abs(diffPercent) <= tolerancePercent,
      diffPercent: Math.round(diffPercent * 10) / 10,
      formatted: diffPercent > 0 ? `+${diffPercent.toFixed(1)}%` : `${diffPercent.toFixed(1)}%`,
    };
  };

  const handleAddDayType = () => {
    if (dayTypes.length >= 7) return;
    const existingNames = dayTypes.map((d) => d.name);
    const nextDayName = WEEK_DAYS.find((d) => !existingNames.includes(d));
    if (!nextDayName) return;

    const timestamp = Date.now();
    const newMealId = `m-${timestamp}`;
    const newDay = {
      id: `day-${timestamp}`,
      name: nextDayName,
      meals: [
        {
          id: newMealId,
          name: "ANA ÖĞÜN 1",
          time: "08:30",
          activeOptionIndex: 0,
          options: [{ id: `opt-${timestamp}`, title: "Seçenek 1", items: [] }],
        },
      ],
    };

    setDayTypes((prev) => [...prev, newDay]);
    setActiveDayIndex(dayTypes.length);
    setSelectedMealId(newMealId);
  };

  const handleRemoveDayType = (index, e) => {
    e.stopPropagation();
    if (dayTypes.length <= 1) return;
    setDayTypes((prev) => prev.filter((_, i) => i !== index));
    if (activeDayIndex >= dayTypes.length - 1) {
      setActiveDayIndex(Math.max(0, dayTypes.length - 2));
    }
  };

  const handleAddMeal = () => {
    const timestamp = Date.now();
    const newMealId = `m-${timestamp}`;

    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        const meals = [...(day.meals || [])];
        meals.push({
          id: newMealId,
          name: `ANA ÖĞÜN ${meals.length + 1}`,
          time: "12:00",
          activeOptionIndex: 0,
          options: [{ id: `opt-${timestamp}`, title: "Seçenek 1", items: [] }],
        });
        return { ...day, meals };
      })
    );
    setSelectedMealId(newMealId);
  };

  const handleRemoveMeal = (mealId) => {
    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return { ...day, meals: day.meals.filter((m) => m.id !== mealId) };
      })
    );
    if (selectedMealId === mealId) {
      const remaining = (currentDay?.meals || []).filter((m) => m.id !== mealId);
      setSelectedMealId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleAddOptionToMeal = (mealId) => {
    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== mealId) return meal;
            const options = [
              ...(meal.options || []),
              { id: `opt-${Date.now()}`, title: `Seçenek ${(meal.options?.length || 0) + 1}`, items: [] },
            ];
            return { ...meal, options, activeOptionIndex: options.length - 1 };
          }),
        };
      })
    );
  };

  const handleRemoveOptionFromMeal = (mealId, optIndex) => {
    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== mealId || meal.options.length <= 1) return meal;
            const newOptions = meal.options.filter((_, idx) => idx !== optIndex);
            return {
              ...meal,
              options: newOptions,
              activeOptionIndex: Math.min(meal.activeOptionIndex, newOptions.length - 1),
            };
          }),
        };
      })
    );
  };

  const handleSelectOptionTab = (mealId, optIndex) => {
    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => (meal.id === mealId ? { ...meal, activeOptionIndex: optIndex } : meal)),
        };
      })
    );
  };

  const handleAddItemToActiveOption = (mealIdTarget, foodPreset = null) => {
    const targetId = mealIdTarget || selectedMealId || currentDay?.meals?.[0]?.id;
    if (!targetId) return;

    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== targetId) return meal;
            const activeOptIndex = meal.activeOptionIndex || 0;
            return {
              ...meal,
              options: meal.options.map((option, optionIndex) => {
                if (optionIndex !== activeOptIndex) return option;

                const amount = foodPreset ? Number(foodPreset.amount) || 100 : 100;
                const unit = foodPreset?.unit || "g";
                const unitWeight = getUnitWeight(unit);
                const totalGrams = amount * unitWeight || 100;

                const calories = foodPreset ? Number(foodPreset.calories) || 0 : 0;
                const protein = foodPreset ? Number(foodPreset.protein) || 0 : 0;
                const carbs = foodPreset ? Number(foodPreset.carbs) || 0 : 0;
                const fat = foodPreset ? Number(foodPreset.fat) || 0 : 0;
                const category = foodPreset?.category || "protein";

                const newItem = {
                  id: `i-${Date.now()}-${Math.random()}`,
                  foodName: foodPreset?.name || "",
                  category,
                  amount,
                  unit,
                  caloriesPerGram: totalGrams > 0 ? calories / totalGrams : 0,
                  proteinPerGram: totalGrams > 0 ? protein / totalGrams : 0,
                  carbsPerGram: totalGrams > 0 ? carbs / totalGrams : 0,
                  fatPerGram: totalGrams > 0 ? fat / totalGrams : 0,
                  calories,
                  protein,
                  carbs,
                  fat,
                };

                return { ...option, items: [...(option.items || []), newItem] };
              }),
            };
          }),
        };
      })
    );
  };

  const handleRemoveItem = (mealId, itemId) => {
    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== mealId) return meal;
            const activeOptIndex = meal.activeOptionIndex || 0;
            return {
              ...meal,
              options: meal.options.map((option, optionIndex) => {
                if (optionIndex !== activeOptIndex) return option;
                return { ...option, items: option.items.filter((item) => item.id !== itemId) };
              }),
            };
          }),
        };
      })
    );
  };

  const handleUpdateItem = (mealId, itemId, field, value) => {
    setDayTypes((prevDays) =>
      prevDays.map((day, dayIndex) => {
        if (dayIndex !== activeDayIndex) return day;
        return {
          ...day,
          meals: day.meals.map((meal) => {
            if (meal.id !== mealId) return meal;
            const activeOptIndex = meal.activeOptionIndex || 0;
            return {
              ...meal,
              options: meal.options.map((option, optionIndex) => {
                if (optionIndex !== activeOptIndex) return option;
                return {
                  ...option,
                  items: option.items.map((item) => {
                    if (item.id !== itemId) return item;
                    const updatedItem = { ...item, [field]: value };

                    let currentAmount = field === "amount" ? parseFloat(value) || 0 : parseFloat(item.amount) || 0;
                    let currentUnit = field === "unit" ? value : item.unit || "g";

                    if (field === "amount" || field === "unit") {
                      const unitWeight = getUnitWeight(currentUnit);
                      const totalGrams = currentAmount * unitWeight;

                      let cPG = item.caloriesPerGram ?? 0;
                      let pPG = item.proteinPerGram ?? 0;
                      let cbPG = item.carbsPerGram ?? 0;
                      let fPG = item.fatPerGram ?? 0;

                      updatedItem.calories = Math.round(totalGrams * cPG * 10) / 10;
                      updatedItem.protein = Math.round(totalGrams * pPG * 10) / 10;
                      updatedItem.carbs = Math.round(totalGrams * cbPG * 10) / 10;
                      updatedItem.fat = Math.round(totalGrams * fPG * 10) / 10;
                    }

                    if (["calories", "protein", "carbs", "fat"].includes(field)) {
                      const numericValue = Number(value) || 0;
                      updatedItem[field] = numericValue;
                      const currentGrams = (parseFloat(updatedItem.amount) || 1) * getUnitWeight(updatedItem.unit || "g");
                      if (currentGrams > 0) {
                        if (field === "calories") updatedItem.caloriesPerGram = numericValue / currentGrams;
                        if (field === "protein") updatedItem.proteinPerGram = numericValue / currentGrams;
                        if (field === "carbs") updatedItem.carbsPerGram = numericValue / currentGrams;
                        if (field === "fat") updatedItem.fatPerGram = numericValue / currentGrams;
                      }
                    }

                    return updatedItem;
                  }),
                };
              }),
            };
          }),
        };
      })
    );
  };

  const filteredPresetFoods = useMemo(() => {
    const normalizedQuery = searchQuery.toLowerCase();
    return presetFoods.filter((food) => {
      const matchesCategory = selectedCategory === "all" || food.category === selectedCategory;
      const matchesQuery = food.name.toLowerCase().includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [presetFoods, selectedCategory, searchQuery]);

  const togglePresetNote = (noteText) => {
    if (generalNotes.includes(noteText)) {
      setGeneralNotes(generalNotes.filter((note) => note !== noteText));
    } else {
      setGeneralNotes([...generalNotes, noteText]);
    }
  };

  const handleAddCustomNote = () => {
    const note = customNoteInput.trim();
    if (!note) return;
    setGeneralNotes([...generalNotes, note]);
    setCustomNoteInput("");
  };

  const handleRemoveNote = (noteIndex) => {
    setGeneralNotes(generalNotes.filter((_, index) => index !== noteIndex));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Lütfen diyet şablonu için geçerli bir başlık giriniz.");
      return;
    }

    setIsSaving(true);
    try {
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("token") || localStorage.getItem("access_token")
          : null;

      if (!token) {
        alert("Oturum bilgisi bulunamadı. Lütfen tekrar giriş yapınız.");
        return;
      }

      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: token.startsWith("Bearer ") ? token : `Bearer ${token}`,
      };

      const meRes = await fetch("/api/auth/me", { method: "GET", headers, credentials: "include" });
      if (!meRes.ok) {
        alert("Aktif kullanıcı bilgisi alınamadı.");
        return;
      }

      const meData = await meRes.json();
      const currentUser = meData?.user || meData;
      const activeDietitianId =
        currentUser?.dietitian_id ?? currentUser?.dietitianId ?? currentUser?.id ?? dietitianId;

      if (!activeDietitianId) {
        alert("Aktif diyetisyen ID'si bulunamadı.");
        return;
      }

      const payload = {
        dietitian_id: Number(activeDietitianId),
        title: title.trim(),
        targetCalories: Number(targetCalories) || 2000,
        goal: goal || "Kilo Verme & Definisyon",
        targetProteinGrams: Number(targetMacros.proteinGrams) || 0,
        targetCarbsGrams: Number(targetMacros.carbsGrams) || 0,
        targetFatGrams: Number(targetMacros.fatGrams) || 0,
        generalNotes: generalNotes || [],
        dayTypes: dayTypes || [],
      };

      const isEdit = initialData?.id && Number(initialData.id) > 0;
      const url = isEdit ? `/api/expert-diet-program/templates/${initialData.id}` : "/api/expert-diet-program/templates";
      const method = isEdit ? "PUT" : "POST";

      const res = await fetch(url, {
        method,
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ detail: "Sunucu hatası" }));
        throw new Error(errData.detail);
      }

      const savedData = await res.json();
      if (onSave) onSave(savedData);
      if (onClose) onClose();
    } catch (err) {
      alert(`Şablon kaydedilemedi: ${err?.message || "Bilinmeyen hata"}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const calStatus = getToleranceStatus(activeDayTotals.calories, targetCalories);
  const pStatus = getToleranceStatus(activeDayTotals.protein, targetMacros.proteinGrams);
  const cStatus = getToleranceStatus(activeDayTotals.carbs, targetMacros.carbsGrams);
  const fStatus = getToleranceStatus(activeDayTotals.fat, targetMacros.fatGrams);

  const canAddMoreDays =
    dayTypes.length < 7 && WEEK_DAYS.some((day) => !dayTypes.map((item) => item.name).includes(day));

  return (
    <div className="fixed inset-0 top-[64px] z-50 flex items-center justify-center bg-[#11142D]/90 backdrop-blur-xl p-1.5 sm:p-2 overflow-hidden">
      <div className="bg-[#141832] border border-emerald-500/30 w-full max-w-6xl h-full max-h-[calc(100vh-68px)] rounded-2xl shadow-xl overflow-hidden flex flex-col">
        <div className="px-6 py-3 bg-[#161b38] border-b border-slate-700 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/40">
              <Utensils size={18} />
            </div>
            <div>
              <h2 className="text-base font-black text-white">
                {initialData ? "Diyet Şablonunu Düzenle" : "Yeni Diyet & Beslenme Mimarı"}
              </h2>
              <p className="text-[11px] text-slate-300 font-medium">Danışan şablonlarını yönetin.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#11142D] border border-slate-700"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          {/* Üst Bilgiler */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 bg-[#161b38]/50 p-3.5 rounded-2xl border border-slate-700">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Plan Başlığı</label>
              <input
                type="text"
                required
                placeholder="Plan başlığı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Hedef Kalori (kcal)</label>
              <input
                type="number"
                required
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-extrabold text-orange-400 rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Hedef & Konsept</label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700"
              >
                {Object.keys(DIET_CONCEPTS).map((key) => (
                  <option key={key} value={key}>{DIET_CONCEPTS[key].label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5">Sapma Toleransı</label>
              <select
                value={tolerancePercent}
                onChange={(e) => setTolerancePercent(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-indigo-300 rounded-xl border border-slate-700"
              >
                <option value={3}>±%3</option>
                <option value={5}>±%5</option>
                <option value={10}>±%10</option>
              </select>
            </div>
          </div>

          {/* Hızlı Besin Arama */}
          <div className="bg-[#161b38]/60 p-3 rounded-2xl border border-slate-700 space-y-2">
            <div className="flex justify-between items-center">
              <h4 className="text-xs font-black text-white uppercase flex items-center gap-2">
                Hızlı Besin Ekleme Veritabanı {isLoadingFoods && <Loader2 size={13} className="animate-spin text-emerald-400" />}
              </h4>
              <div className="flex items-center gap-1 overflow-x-auto pb-1">
                {PRESET_FOOD_CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all ${
                      selectedCategory === cat.id ? "bg-emerald-500 text-white" : "bg-[#11142D] text-slate-300 border border-slate-700"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Besin ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
              {filteredPresetFoods.map((food) => (
                <button
                  key={food.id}
                  type="button"
                  onClick={() => handleAddItemToActiveOption(selectedMealId, food)}
                  className="group flex items-center gap-1.5 px-2.5 py-1 bg-[#11142D] hover:bg-emerald-950 border border-slate-700 rounded-lg text-xs"
                >
                  <span className="font-bold text-slate-200">{food.name}</span>
                  <span className="text-[10px] text-slate-400">({food.amount}{food.unit} • {food.calories}kcal)</span>
                  <Plus size={12} className="text-emerald-400" />
                </button>
              ))}
            </div>
          </div>

          {/* Günler ve Öğünler */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-700">
              {dayTypes.map((day, index) => (
                <div
                  key={day.id || index}
                  onClick={() => setActiveDayIndex(index)}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-t-xl font-bold text-xs cursor-pointer border-t border-x ${
                    activeDayIndex === index ? "bg-[#161b38] border-emerald-500 text-white" : "bg-[#11142D] border-slate-800 text-slate-400"
                  }`}
                >
                  <span>{day.name}</span>
                  {dayTypes.length > 1 && (
                    <button type="button" onClick={(e) => handleRemoveDayType(index, e)}>
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}
              {canAddMoreDays && (
                <button type="button" onClick={handleAddDayType} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-xl text-xs font-bold">
                  + Yeni Gün Ekle
                </button>
              )}
              <button type="button" onClick={handleAddMeal} className="px-3 py-1.5 bg-teal-500/10 text-teal-300 rounded-xl text-xs font-bold">
                + Yeni Öğün Ekle
              </button>
            </div>

            <div className="space-y-4">
              {currentDay?.meals?.map((meal) => {
                const isSelected = selectedMealId === meal.id;
                const activeOptIdx = meal.activeOptionIndex || 0;
                const activeOpt = meal.options?.[activeOptIdx] || meal.options?.[0] || { items: [] };

                return (
                  <div
                    key={meal.id}
                    onClick={() => setSelectedMealId(meal.id)}
                    className={`p-4 rounded-2xl border ${isSelected ? "bg-[#161b38] border-emerald-500/50" : "bg-[#141832] border-slate-800"}`}
                  >
                    <div className="flex justify-between items-center mb-3 pb-2.5 border-b border-slate-700">
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => {
                            const val = e.target.value;
                            setDayTypes((prev) =>
                              prev.map((d, dIdx) =>
                                dIdx !== activeDayIndex ? d : {
                                  ...d,
                                  meals: d.meals.map((m) => m.id === meal.id ? { ...m, name: val } : m),
                                }
                              )
                            );
                          }}
                          className="bg-[#11142D] border border-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold text-white w-36"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <button type="button" onClick={() => handleAddOptionToMeal(meal.id)} className="px-2.5 py-1 text-[11px] font-bold bg-teal-500/10 text-teal-300 rounded-lg">
                          + Alternatif Ekle
                        </button>
                        <button type="button" onClick={() => handleRemoveMeal(meal.id)} className="text-slate-400 hover:text-rose-400">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Besin Tablosu */}
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-700">
                            <th className="py-1.5 px-2">Besin Adı</th>
                            <th className="py-1.5 px-2 w-32">Kategori (DDL)</th>
                            <th className="py-1.5 px-2 w-20">Miktar</th>
                            <th className="py-1.5 px-2 w-20">Birim</th>
                            <th className="py-1.5 px-2 w-20 text-right">Kcal</th>
                            <th className="py-1.5 px-2 w-16 text-right">Prot</th>
                            <th className="py-1.5 px-2 w-16 text-right">Karb</th>
                            <th className="py-1.5 px-2 w-16 text-right">Yağ</th>
                            <th className="py-1.5 px-2 w-8" />
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800 text-xs">
                          {activeOpt.items?.map((item) => (
                            <tr key={item.id} className="hover:bg-slate-800/30">
                              {/* Besin Adı */}
                              <td className="py-1.5 px-2">
                                <input
                                  type="text"
                                  value={item.foodName || ""}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "foodName", e.target.value)}
                                  placeholder="Besin adı"
                                  className="bg-transparent border-none text-white w-full focus:outline-none"
                                />
                              </td>
                              {/* Kategori DDL (İstediğiniz Açılır Menü Alanı) */}
                              <td className="py-1.5 px-2">
                                <select
                                  value={item.category || "protein"}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "category", e.target.value)}
                                  className="w-full bg-[#11142D] border border-slate-700 rounded px-1.5 py-1 text-xs text-emerald-300 font-semibold focus:outline-none"
                                >
                                  <option value="protein">Yüksek Protein</option>
                                  <option value="carbs">Kompleks Karb</option>
                                  <option value="fat">Sağlıklı Yağ</option>
                                  <option value="dairy">Süt & Süt Ürünleri</option>
                                  <option value="veg_fruit">Sebze & Meyve</option>
                                </select>
                              </td>
                              {/* Miktar */}
                              <td className="py-1.5 px-2">
                                <input
                                  type="number"
                                  value={item.amount}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "amount", e.target.value)}
                                  className="w-16 bg-[#11142D] border border-slate-700 rounded px-1 text-center text-white"
                                />
                              </td>
                              {/* Birim */}
                              <td className="py-1.5 px-2">
                                <select
                                  value={item.unit || "g"}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "unit", e.target.value)}
                                  className="bg-[#11142D] border border-slate-700 rounded px-1 text-slate-300"
                                >
                                  <option value="g">g</option>
                                  <option value="ml">ml</option>
                                  <option value="adet">adet</option>
                                  <option value="dilim">dilim</option>
                                  <option value="porsiyon">porsiyon</option>
                                </select>
                              </td>
                              {/* Kalori */}
                              <td className="py-1.5 px-2 text-right">
                                <input
                                  type="number"
                                  value={item.calories ?? 0}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "calories", e.target.value)}
                                  className="w-16 bg-[#11142D] border border-slate-700 rounded px-1 text-right text-orange-400 font-bold"
                                />
                              </td>
                              {/* Protein */}
                              <td className="py-1.5 px-2 text-right">
                                <input
                                  type="number"
                                  value={item.protein ?? 0}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "protein", e.target.value)}
                                  className="w-14 bg-[#11142D] border border-slate-700 rounded px-1 text-right text-rose-400"
                                />
                              </td>
                              {/* Karb */}
                              <td className="py-1.5 px-2 text-right">
                                <input
                                  type="number"
                                  value={item.carbs ?? 0}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "carbs", e.target.value)}
                                  className="w-14 bg-[#11142D] border border-slate-700 rounded px-1 text-right text-amber-400"
                                />
                              </td>
                              {/* Yağ */}
                              <td className="py-1.5 px-2 text-right">
                                <input
                                  type="number"
                                  value={item.fat ?? 0}
                                  onChange={(e) => handleUpdateItem(meal.id, item.id, "fat", e.target.value)}
                                  className="w-14 bg-[#11142D] border border-slate-700 rounded px-1 text-right text-cyan-400"
                                />
                              </td>
                              <td className="py-1.5 px-2 text-center">
                                <button type="button" onClick={() => handleRemoveItem(meal.id, item.id)} className="text-slate-500 hover:text-rose-400">
                                  <X size={13} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddItemToActiveOption(meal.id)}
                      className="w-full py-1.5 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-400 hover:text-emerald-300 rounded-xl text-xs font-bold mt-2"
                    >
                      + Manuel Öğün Öğesi Ekle
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Kaydet Butonu */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-3">
            <button type="button" onClick={onClose} disabled={isSaving} className="px-5 py-2.5 bg-[#11142D] text-slate-300 font-bold text-xs rounded-xl border border-slate-700">
              Vazgeç
            </button>
            <button type="submit" disabled={isSaving} className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg flex items-center gap-2">
              {isSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Diyet Şablonunu Kaydet
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}