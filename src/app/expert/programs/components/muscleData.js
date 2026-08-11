// src/app/expert/programs/components/muscleData.js
// Tek gerçek kaynak (single source of truth): kas hiyerarşisi + anatomik SVG id eşleşmeleri.
// Yeni bir kas eklemek / yeniden adlandırmak istersen sadece bu dosyayı güncelle,
// AnatomyFigure ve MuscleSelector otomatik olarak senkron kalır.

// Her leaf (yaprak) düğüm, AnatomyFigure.jsx içindeki <path id="..."> değerlerine karşılık gelir.
// "view" alanı, o kas seçildiğinde figürün hangi tarafını (ön/arka) öne çıkarması gerektiğini UI'a söyler.

export const MUSCLE_TREE = [
  {
    id: "upper_body",
    label: "Üst Vücut",
    groups: [
      {
        id: "chest",
        label: "Göğüs",
        leaves: [
          { key: "chest_upper", label: "Üst Göğüs", view: "front", svgIds: ["chest_upper_l", "chest_upper_r"] },
          { key: "chest_middle", label: "Orta Göğüs", view: "front", svgIds: ["chest_middle_l", "chest_middle_r"] },
          { key: "chest_lower", label: "Alt Göğüs", view: "front", svgIds: ["chest_lower_l", "chest_lower_r"] },
        ],
      },
      {
        id: "shoulders",
        label: "Omuz",
        leaves: [
          { key: "shoulder_front", label: "Ön Omuz", view: "front", svgIds: ["shoulder_front_l", "shoulder_front_r"] },
          {
            key: "shoulder_side",
            label: "Yan Omuz",
            view: "both",
            svgIds: ["shoulder_side_l", "shoulder_side_r", "shoulder_side_back_l", "shoulder_side_back_r"],
          },
          { key: "shoulder_rear", label: "Arka Omuz", view: "back", svgIds: ["shoulder_rear_l", "shoulder_rear_r"] },
        ],
      },
      {
        id: "back",
        label: "Sırt",
        leaves: [
          { key: "back_lats", label: "Kanatlar", view: "back", svgIds: ["lats_l", "lats_r"] },
          { key: "back_mid", label: "Orta Sırt", view: "back", svgIds: ["mid_back_l", "mid_back_r"] },
          { key: "back_traps", label: "Trapez", view: "back", svgIds: ["traps_l", "traps_r"] },
          { key: "back_lower", label: "Alt Bel", view: "back", svgIds: ["lower_back"] },
        ],
      },
      {
        id: "arms",
        label: "Kol",
        leaves: [
          { key: "arm_biceps", label: "Biceps", view: "front", svgIds: ["biceps_l", "biceps_r"] },
          { key: "arm_triceps", label: "Triceps", view: "back", svgIds: ["triceps_l", "triceps_r"] },
          {
            key: "arm_forearm",
            label: "Ön Kol",
            view: "both",
            svgIds: ["forearm_front_l", "forearm_front_r", "forearm_back_l", "forearm_back_r"],
          },
        ],
      },
      {
        id: "core",
        label: "Core",
        leaves: [
          { key: "core_upper_abs", label: "Üst Karın", view: "front", svgIds: ["abs_upper_l", "abs_upper_r"] },
          { key: "core_lower_abs", label: "Alt Karın", view: "front", svgIds: ["abs_lower_l", "abs_lower_r", "abs_bottom"] },
          { key: "core_obliques", label: "Yan Karın", view: "front", svgIds: ["obliques_l", "obliques_r"] },
        ],
      },
    ],
  },
  {
    id: "lower_body",
    label: "Alt Vücut",
    groups: [
      {
        id: "legs",
        label: "Bacak",
        leaves: [
          { key: "leg_quad", label: "Quadriceps", view: "front", svgIds: ["quad_l", "quad_r"] },
          { key: "leg_hamstring", label: "Hamstring", view: "back", svgIds: ["hamstring_l", "hamstring_r"] },
          { key: "leg_glute", label: "Glute", view: "back", svgIds: ["glutes_l", "glutes_r"] },
          {
            key: "leg_calf",
            label: "Baldır",
            view: "both",
            svgIds: ["calf_front_l", "calf_front_r", "calf_back_l", "calf_back_r"],
          },
        ],
      },
    ],
  },
];

// Düz (flat) liste — arama / hızlı erişim için
export const ALL_LEAVES = MUSCLE_TREE.flatMap((region) =>
  region.groups.flatMap((group) =>
    group.leaves.map((leaf) => ({ ...leaf, groupId: group.id, groupLabel: group.label, regionId: region.id, regionLabel: region.label }))
  )
);

export const LEAF_BY_KEY = Object.fromEntries(ALL_LEAVES.map((l) => [l.key, l]));

// Sık kullanılan hazır kombinasyonlar (örn. antrenman şablonu önerileri için).
export const PRESET_COMBOS = {
  "Bench Press": ["chest_middle", "chest_upper", "shoulder_front", "arm_triceps"],
  "Incline Bench Press": ["chest_upper", "shoulder_front", "arm_triceps"],
  "Squat": ["leg_quad", "leg_glute", "core_lower_abs"],
  "Deadlift": ["back_lower", "leg_hamstring", "leg_glute", "back_lats"],
  "Pull Up": ["back_lats", "arm_biceps", "back_mid"],
  "Overhead Press": ["shoulder_front", "shoulder_side", "arm_triceps"],
};

export function leafKeysToSvgIds(leafKeys = []) {
  const set = new Set();
  leafKeys.forEach((key) => {
    const leaf = LEAF_BY_KEY[key];
    if (leaf) leaf.svgIds.forEach((id) => set.add(id));
  });
  return set;
}