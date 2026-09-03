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
          category: item.category || "protein",
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
          meals: (day.meals || []).map((m) => ({
            ...m,
            options: (m.options || []).map((opt) => ({
              ...opt,
              items: (opt.items || []).map((it) => ({
                ...it,
                category: it.category || "protein",
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

                      if (cPG === 0 && pPG === 0 && cbPG === 0 && fPG === 0) {
                        const oldGrams = (parseFloat(item.amount) || 100) * getUnitWeight(item.unit || "g");
                        if (oldGrams > 0) {
                          cPG = (Number(item.calories) || 0) / oldGrams;
                          pPG = (Number(item.protein) || 0) / oldGrams;
                          cbPG = (Number(item.carbs) || 0) / oldGrams;
                          fPG = (Number(item.fat) || 0) / oldGrams;
                        }
                      }

                      updatedItem.caloriesPerGram = cPG;
                      updatedItem.proteinPerGram = pPG;
                      updatedItem.carbsPerGram = cbPG;
                      updatedItem.fatPerGram = fPG;

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
      <div className="bg-[#141832] border border-emerald-500/30 w-full max-w-6xl h-full max-h-[calc(100vh-68px)] rounded-2xl sm:rounded-3xl shadow-[0_0_60px_rgba(16,185,129,0.18)] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Modal Başlığı */}
        <div className="px-6 py-3 bg-[#161b38] border-b border-slate-700/80 flex justify-between items-center shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-emerald-500/20 to-teal-500/10 text-emerald-400 rounded-2xl border border-emerald-500/40 shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Utensils size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-black text-white tracking-wide">
                  {initialData ? "Diyet Şablonunu Düzenle" : "Yeni Diyet & Beslenme Mimarı"}
                </h2>
                <span className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/40">
                  Diyetisyen Pro
                </span>
              </div>
              <p className="text-[11px] text-slate-300 font-medium mt-0.5">
                Danışanlarınıza özel seçenekli öğünler, dinamik makrolar ve diyet kuralları tasarlayın.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            type="button"
            disabled={isSaving}
            className="p-2 text-slate-400 hover:text-white rounded-xl bg-[#11142D] border border-slate-700 hover:border-emerald-500/50 transition-all hover:scale-105"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-5 overflow-y-auto space-y-4 custom-scrollbar flex-1">
          
          {/* Üst Bilgiler & Ayarlar */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3.5 bg-[#161b38]/50 p-3.5 rounded-2xl border border-slate-700/60">
            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <BookOpen size={14} className="text-emerald-400" />
                Plan Başlığı
              </label>
              <input
                type="text"
                required
                placeholder="Plan başlığı"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 focus:ring-2 focus:ring-emerald-500/30 transition-all placeholder-slate-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <Flame size={14} className="text-orange-400" />
                Hedef Kalori (kcal)
              </label>
              <input
                type="number"
                required
                min={500}
                max={10000}
                value={targetCalories}
                onChange={(e) => setTargetCalories(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-extrabold text-orange-400 rounded-xl border border-slate-700 focus:outline-none focus:border-orange-400 focus:ring-2 focus:ring-orange-500/30 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <SlidersHorizontal size={14} className="text-teal-400" />
                Hedef & Konsept
              </label>
              <select
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-500/30 transition-all cursor-pointer"
              >
                {Object.keys(DIET_CONCEPTS).map((key) => (
                  <option key={key} value={key}>
                    {DIET_CONCEPTS[key].label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
                <AlertCircle size={14} className="text-indigo-400" />
                Sapma Toleransı (±%)
              </label>
              <select
                value={tolerancePercent}
                onChange={(e) => setTolerancePercent(Number(e.target.value))}
                className="w-full px-3.5 py-2 bg-[#11142D] text-xs font-semibold text-indigo-300 rounded-xl border border-slate-700 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-500/30 transition-all cursor-pointer font-mono"
              >
                <option value={3}>±%3</option>
                <option value={5}>±%5</option>
                <option value={10}>±%10</option>
                <option value={15}>±%15</option>
              </select>
            </div>
          </div>

          {/* KALORİ VE MAKRO ÖZET KARTLARI (YÜZDELİKLER VE İLERLEME BARLARI) */}
          <div className="bg-gradient-to-r from-[#161b38] via-[#141832] to-[#161b38] p-3 rounded-2xl border border-emerald-500/25 shadow-[0_4px_25px_rgba(0,0,0,0.3)] grid grid-cols-2 md:grid-cols-4 gap-3">
            {/* KALORİ */}
            <div className="p-3 rounded-xl bg-[#11142D]/90 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Flame size={12} className="text-orange-400" />
                  KALORİ
                </span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border font-mono ${
                    calStatus.inRange
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {calStatus.formatted}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-black text-white">
                  {activeDayTotals.calories}
                </span>
                <span className="text-[11px] text-slate-300 font-bold">
                  / {targetCalories} kcal
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    calStatus.inRange
                      ? "bg-gradient-to-r from-orange-500 to-amber-400"
                      : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (activeDayTotals.calories / (targetCalories || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* PROTEİN */}
            <div className="p-3 rounded-xl bg-[#11142D]/90 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Beef size={12} className="text-rose-400" />
                  PROTEİN
                </span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border font-mono ${
                    pStatus.inRange
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {pStatus.formatted}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-black text-rose-400">
                  {activeDayTotals.protein}g
                </span>
                <span className="text-[11px] text-slate-300 font-bold">
                  / {targetMacros.proteinGrams}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    pStatus.inRange ? "bg-rose-500" : "bg-rose-700"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (activeDayTotals.protein / (targetMacros.proteinGrams || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* KARBONHİDRAT */}
            <div className="p-3 rounded-xl bg-[#11142D]/90 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Wheat size={12} className="text-amber-400" />
                  KARB
                </span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border font-mono ${
                    cStatus.inRange
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {cStatus.formatted}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-black text-amber-400">
                  {activeDayTotals.carbs}g
                </span>
                <span className="text-[11px] text-slate-300 font-bold">
                  / {targetMacros.carbsGrams}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    cStatus.inRange ? "bg-amber-400" : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (activeDayTotals.carbs / (targetMacros.carbsGrams || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>

            {/* YAĞ */}
            <div className="p-3 rounded-xl bg-[#11142D]/90 border border-slate-700/80 flex flex-col justify-between">
              <div className="flex justify-between items-center">
                <span className="text-[10px] text-slate-300 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Droplet size={12} className="text-cyan-400" />
                  YAĞ
                </span>
                <span
                  className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded border font-mono ${
                    fStatus.inRange
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/40"
                      : "bg-rose-500/20 text-rose-300 border-rose-500/40"
                  }`}
                >
                  {fStatus.formatted}
                </span>
              </div>
              <div className="mt-1.5 flex items-baseline justify-between">
                <span className="text-base font-black text-cyan-400">
                  {activeDayTotals.fat}g
                </span>
                <span className="text-[11px] text-slate-300 font-bold">
                  / {targetMacros.fatGrams}g
                </span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    fStatus.inRange ? "bg-cyan-400" : "bg-rose-500"
                  }`}
                  style={{
                    width: `${Math.min(
                      100,
                      (activeDayTotals.fat / (targetMacros.fatGrams || 1)) * 100
                    )}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Hızlı Besin Ekleme Veritabanı */}
          <div className="bg-[#161b38]/60 p-3 rounded-2xl border border-slate-700/80 space-y-2">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div className="flex items-center gap-2">
                <Sparkles size={15} className="text-emerald-400" />
                <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
                  Hızlı Besin Ekleme Veritabanı
                  {isLoadingFoods && (
                    <Loader2 size={13} className="animate-spin text-emerald-400" />
                  )}
                </h4>
                {selectedMealId && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 border border-amber-500/30">
                    Hedef:{" "}
                    {currentDay?.meals?.find((m) => m.id === selectedMealId)?.name || "Seçili Öğün"}
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1 overflow-x-auto max-w-full pb-1 sm:pb-0">
                {PRESET_FOOD_CATEGORIES.map((category) => (
                  <button
                    key={category.id}
                    type="button"
                    onClick={() => setSelectedCategory(category.id)}
                    className={`px-2.5 py-1 text-[10px] font-bold rounded-lg transition-all shrink-0 ${
                      selectedCategory === category.id
                        ? "bg-emerald-500 text-white shadow-[0_0_10px_rgba(16,185,129,0.4)]"
                        : "bg-[#11142D] text-slate-300 hover:text-white border border-slate-700"
                    }`}
                  >
                    {category.label}
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
                className="w-full pl-9 pr-3 py-1.5 bg-[#11142D] text-xs font-semibold text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 placeholder-slate-500"
              />
            </div>

            <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar pt-1">
              {filteredPresetFoods.length > 0 ? (
                filteredPresetFoods.map((food) => (
                  <button
                    key={food.id}
                    type="button"
                    onClick={() => handleAddItemToActiveOption(selectedMealId, food)}
                    className="group flex items-center gap-1.5 px-2.5 py-1 bg-[#11142D] hover:bg-emerald-950/80 border border-slate-700 hover:border-emerald-500/50 rounded-lg transition-all text-xs"
                  >
                    <span className="font-bold text-slate-200 group-hover:text-emerald-300">
                      {food.name}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({food.amount}{food.unit} • {food.calories}kcal)
                    </span>
                    <Plus size={12} className="text-emerald-400 ml-0.5 group-hover:scale-125 transition-transform" />
                  </button>
                ))
              ) : (
                <div className="text-[11px] text-slate-400 py-1 italic">
                  Aramanıza uygun besin bulunamadı.
                </div>
              )}
            </div>
          </div>

          {/* Günler ve Öğün Mimarı */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-700/80">
              {dayTypes.map((day, index) => (
                <div
                  key={day.id || index}
                  onClick={() => setActiveDayIndex(index)}
                  className={`group relative flex items-center gap-2 px-3.5 py-2 rounded-t-xl font-bold text-xs cursor-pointer border-t border-x transition-all shrink-0 ${
                    activeDayIndex === index
                      ? "bg-[#161b38] border-emerald-500/50 text-white"
                      : "bg-[#11142D]/60 border-slate-800 text-slate-400 hover:text-slate-200"
                  }`}
                >
                  <Layers
                    size={14}
                    className={activeDayIndex === index ? "text-emerald-400" : "text-slate-500"}
                  />
                  <span className="text-xs font-black text-white">{day.name}</span>
                  {dayTypes.length > 1 && (
                    <button
                      type="button"
                      onClick={(e) => handleRemoveDayType(index, e)}
                      className="text-slate-500 hover:text-rose-400 p-0.5 transition-colors ml-1"
                    >
                      <X size={13} />
                    </button>
                  )}
                </div>
              ))}

              {canAddMoreDays && (
                <button
                  type="button"
                  onClick={handleAddDayType}
                  className="flex items-center gap-1 px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 rounded-xl border border-emerald-500/30 text-xs font-bold transition-all shrink-0 ml-1"
                >
                  <Plus size={14} />
                  Yeni Gün Ekle
                </button>
              )}

              <button
                type="button"
                onClick={handleAddMeal}
                className="flex items-center gap-1 px-3 py-1.5 bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 rounded-xl border border-teal-500/30 text-xs font-bold transition-all shrink-0 ml-1 shadow-[0_0_12px_rgba(20,184,166,0.15)]"
              >
                <Plus size={14} />
                Yeni Öğün Ekle
              </button>
            </div>

            {/* Öğün Listesi */}
            <div className="space-y-4">
              {currentDay?.meals?.map((meal) => {
                const isSelected = selectedMealId === meal.id;
                const activeOptIdx = meal.activeOptionIndex || 0;
                const activeOpt = meal.options?.[activeOptIdx] || meal.options?.[0] || { items: [] };

                return (
                  <div
                    key={meal.id}
                    onClick={() => setSelectedMealId(meal.id)}
                    className={`p-4 rounded-2xl border transition-all ${
                      isSelected
                        ? "bg-[#161b38] border-emerald-500/50 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
                        : "bg-[#141832]/80 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3 pb-2.5 border-b border-slate-700/60">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <Utensils size={16} className="text-emerald-400 shrink-0" />
                        <input
                          type="text"
                          value={meal.name}
                          onChange={(e) => {
                            const value = e.target.value;
                            setDayTypes((prev) =>
                              prev.map((day, dayIndex) =>
                                dayIndex !== activeDayIndex
                                  ? day
                                  : {
                                      ...day,
                                      meals: day.meals.map((item) =>
                                        item.id === meal.id ? { ...item, name: value } : item
                                      ),
                                    }
                              )
                            );
                          }}
                          className="bg-[#11142D] border border-slate-700 focus:border-emerald-400 px-2.5 py-1 rounded-lg text-xs font-black text-white w-36 focus:outline-none"
                        />

                        <div className="flex items-center gap-1 bg-[#11142D] border border-slate-700 px-2 py-1 rounded-lg">
                          <Clock size={12} className="text-slate-400" />
                          <input
                            type="text"
                            value={meal.time || "08:30"}
                            onChange={(e) => {
                              const value = e.target.value;
                              setDayTypes((prev) =>
                                prev.map((day, dayIndex) =>
                                  dayIndex !== activeDayIndex
                                    ? day
                                    : {
                                        ...day,
                                        meals: day.meals.map((item) =>
                                          item.id === meal.id ? { ...item, time: value } : item
                                        ),
                                      }
                                )
                              );
                            }}
                            className="bg-transparent border-none text-[11px] font-mono text-slate-300 w-12 focus:outline-none"
                          />
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-auto">
                        <button
                          type="button"
                          onClick={() => handleAddOptionToMeal(meal.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-300 border border-teal-500/30 rounded-lg transition-all flex items-center gap-1"
                        >
                          <Plus size={12} />
                          Alternatif Seçenek Ekle
                        </button>

                        <button
                          type="button"
                          onClick={() => handleRemoveMeal(meal.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-all"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>

                    {/* Alternatif Seçenek Sekmeleri */}
                    <div className="flex items-center gap-1.5 mb-3 overflow-x-auto pb-1">
                      {meal.options?.map((option, optionIndex) => (
                        <div
                          key={option.id || optionIndex}
                          onClick={() => handleSelectOptionTab(meal.id, optionIndex)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all ${
                            activeOptIdx === optionIndex
                              ? "bg-emerald-500 text-white shadow-md"
                              : "bg-[#11142D] text-slate-400 border border-slate-700 hover:text-slate-200"
                          }`}
                        >
                          <span>{option.title || `Seçenek ${optionIndex + 1}`}</span>
                          {meal.options.length > 1 && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveOptionFromMeal(meal.id, optionIndex);
                              }}
                              className="hover:text-rose-200 ml-1"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Besin Tablosu (Kategori DDL Dahil) */}
                    <div className="space-y-2">
                      {activeOpt.items?.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="text-[10px] font-bold uppercase text-slate-400 border-b border-slate-700/60">
                                <th className="py-1.5 px-2">Besin Adı</th>
                                <th className="py-1.5 px-2 w-32">Kategori (DDL)</th>
                                <th className="py-1.5 px-2 w-20">Miktar</th>
                                <th className="py-1.5 px-2 w-20">Birim</th>
                                <th className="py-1.5 px-2 w-20 text-right">Kcal</th>
                                <th className="py-1.5 px-2 w-16 text-right">Prot(g)</th>
                                <th className="py-1.5 px-2 w-16 text-right">Karb(g)</th>
                                <th className="py-1.5 px-2 w-16 text-right">Yağ(g)</th>
                                <th className="py-1.5 px-2 w-8 text-center" />
                              </tr>
                            </thead>

                            <tbody className="divide-y divide-slate-800/60 text-xs">
                              {activeOpt.items.map((item) => (
                                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                                  {/* Besin Adı */}
                                  <td className="py-1.5 px-2 font-semibold text-white">
                                    <input
                                      type="text"
                                      value={item.foodName || ""}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "foodName", e.target.value)
                                      }
                                      placeholder="Besin adı..."
                                      className="bg-transparent border-none focus:outline-none w-full text-xs text-white"
                                    />
                                  </td>

                                  {/* Kategori DDL */}
                                  <td className="py-1.5 px-2">
                                    <select
                                      value={item.category || "protein"}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "category", e.target.value)
                                      }
                                      className="w-full bg-[#11142D] border border-slate-700 rounded px-1.5 py-1 text-xs text-emerald-300 font-semibold focus:outline-none focus:border-emerald-400 cursor-pointer"
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
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "amount", e.target.value)
                                      }
                                      className="w-16 bg-[#11142D] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-center text-white font-mono focus:outline-none focus:border-emerald-400"
                                    />
                                  </td>

                                  {/* Birim */}
                                  <td className="py-1.5 px-2">
                                    <select
                                      value={item.unit || "g"}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "unit", e.target.value)
                                      }
                                      className="bg-[#11142D] border border-slate-700 rounded px-1 py-0.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                                    >
                                      <option value="g">g</option>
                                      <option value="ml">ml</option>
                                      <option value="adet">adet</option>
                                      <option value="dilim">dilim</option>
                                      <option value="tbsp">Yemek Kş.</option>
                                      <option value="tsp">Tatlı Kş.</option>
                                      <option value="avuç">avuç</option>
                                      <option value="porsiyon">porsiyon</option>
                                      <option value="kase">kase</option>
                                    </select>
                                  </td>

                                  {/* Kcal */}
                                  <td className="py-1.5 px-2 text-right">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={item.calories ?? 0}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "calories", e.target.value)
                                      }
                                      className="w-16 bg-[#11142D] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-orange-400 font-bold font-mono focus:outline-none focus:border-orange-400"
                                    />
                                  </td>

                                  {/* Protein */}
                                  <td className="py-1.5 px-2 text-right">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={item.protein ?? 0}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "protein", e.target.value)
                                      }
                                      className="w-14 bg-[#11142D] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-rose-400 font-mono focus:outline-none focus:border-rose-400"
                                    />
                                  </td>

                                  {/* Karbonhidrat */}
                                  <td className="py-1.5 px-2 text-right">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={item.carbs ?? 0}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "carbs", e.target.value)
                                      }
                                      className="w-14 bg-[#11142D] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-amber-400 font-mono focus:outline-none focus:border-amber-400"
                                    />
                                  </td>

                                  {/* Yağ */}
                                  <td className="py-1.5 px-2 text-right">
                                    <input
                                      type="number"
                                      step="any"
                                      min="0"
                                      value={item.fat ?? 0}
                                      onChange={(e) =>
                                        handleUpdateItem(meal.id, item.id, "fat", e.target.value)
                                      }
                                      className="w-14 bg-[#11142D] border border-slate-700 rounded px-1.5 py-0.5 text-xs text-right text-cyan-400 font-mono focus:outline-none focus:border-cyan-400"
                                    />
                                  </td>

                                  {/* Sil */}
                                  <td className="py-1.5 px-2 text-center">
                                    <button
                                      type="button"
                                      onClick={() => handleRemoveItem(meal.id, item.id)}
                                      className="text-slate-500 hover:text-rose-400 transition-colors p-1"
                                    >
                                      <X size={13} />
                                    </button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <div className="text-center py-3 border border-dashed border-slate-800 rounded-xl text-xs text-slate-500">
                          Bu seçeneğe henüz besin eklenmedi.
                        </div>
                      )}

                      <button
                        type="button"
                        onClick={() => handleAddItemToActiveOption(meal.id)}
                        className="w-full py-1.5 border border-dashed border-slate-700 hover:border-emerald-500/50 hover:bg-emerald-500/5 text-slate-400 hover:text-emerald-300 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1 mt-2"
                      >
                        <Plus size={14} />
                        Manuel Öğün Öğesi Ekle
                      </button>
                    </div>
                  </div>
                );
              })}

              <button
                type="button"
                onClick={handleAddMeal}
                className="w-full py-3 border-2 border-dashed border-teal-500/40 hover:border-teal-400 bg-teal-500/5 hover:bg-teal-500/10 text-teal-300 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                <Plus size={16} />
                Aktif Güne Yeni Öğün Ekle
              </button>
            </div>
          </div>

          {/* Diyet Kuralları & Genel Notlar */}
          <div className="bg-[#161b38]/50 p-4 rounded-2xl border border-slate-700/60 space-y-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <CheckSquare size={15} className="text-emerald-400" />
              Diyet Kuralları & Genel Notlar
            </h4>

            <div className="flex flex-wrap gap-1.5">
              {PRESET_DIET_NOTES.map((note, index) => {
                const isChecked = generalNotes.includes(note);
                return (
                  <button
                    key={index}
                    type="button"
                    onClick={() => togglePresetNote(note)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5 text-left ${
                      isChecked
                        ? "bg-emerald-500/20 border border-emerald-500/50 text-emerald-300"
                        : "bg-[#11142D] border border-slate-700 text-slate-400 hover:text-slate-200"
                    }`}
                  >
                    <CheckCircle2
                      size={13}
                      className={isChecked ? "text-emerald-400" : "text-slate-600"}
                    />
                    <span>{note}</span>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-1">
              <input
                type="text"
                placeholder="Ek tavsiye veya kural yazın..."
                value={customNoteInput}
                onChange={(e) => setCustomNoteInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddCustomNote();
                  }
                }}
                className="flex-1 px-3 py-1.5 bg-[#11142D] text-xs text-white rounded-xl border border-slate-700 focus:outline-none focus:border-emerald-400 placeholder-slate-500"
              />
              <button
                type="button"
                onClick={handleAddCustomNote}
                className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs rounded-xl transition-all"
              >
                Ekle
              </button>
            </div>

            {generalNotes.length > 0 && (
              <div className="space-y-1.5 pt-2 border-t border-slate-800">
                {generalNotes.map((note, index) => (
                  <div
                    key={index}
                    className="flex justify-between items-center text-xs bg-[#11142D] px-3 py-1.5 rounded-lg border border-slate-800"
                  >
                    <span className="text-slate-200 font-medium">• {note}</span>
                    <button
                      type="button"
                      onClick={() => handleRemoveNote(index)}
                      className="text-slate-500 hover:text-rose-400 p-0.5"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Alt Aksiyon Butonları */}
          <div className="pt-2 border-t border-slate-800 flex justify-end gap-3 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-5 py-2.5 bg-[#11142D] hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-all"
            >
              Vazgeç
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-xs rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.4)] transition-all flex items-center gap-2"
            >
              {isSaving ? (
                <>
                  <Loader2 size={15} className="animate-spin" />
                  Kaydediliyor...
                </>
              ) : (
                <>
                  <Check size={15} />
                  Diyet Şablonunu Kaydet
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}