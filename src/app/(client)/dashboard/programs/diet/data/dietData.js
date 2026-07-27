// Mock Besin Veritabanı (1 Porsiyon Kalori Öğren İsteri)
export const FOOD_DATABASE = [
  { name: "Izgara Tavuk Göğsü", portion: "1 Porsiyon (150g)", kcal: 248, protein: "46g", carb: "0g", fat: "5g", category: "Protein" },
  { name: "Yulaf Ezmesi & Muz", portion: "1 Kase (200g)", kcal: 290, protein: "10g", carb: "54g", fat: "4.5g", category: "Karbonhidrat" },
  { name: "Fırınlanmış Somon Fleto", portion: "1 Porsiyon (180g)", kcal: 360, protein: "38g", carb: "0g", fat: "22g", category: "Sağlıklı Yağ" },
  { name: "Zeytinyağlı Yeşil Mercimek", portion: "1 Tabak (200g)", kcal: 230, protein: "14g", carb: "32g", fat: "6g", category: "Baklagil" },
  { name: "Avokadolu Yumurta Salatası", portion: "1 Porsiyon (160g)", kcal: 310, protein: "16g", carb: "6g", fat: "24g", category: "Kombin" },
  { name: "Kinoa & Izgara Sebze Kasesi", portion: "1 Tabak (220g)", kcal: 280, protein: "9g", carb: "48g", fat: "7g", category: "Vejetaryen" }
];

// Özel Diyet Programı Türleri (Yönerge İsteri)
export const DIET_PROGRAMS = {
  keto: {
    title: "Ketojenik Performans Protokolü",
    badge: "KETOJENİK",
    desc: "Yüksek sağlıklı yağ, düşük karbonhidrat ile yağ yakımını ve zihinsel odaklanmayı maksimuma çıkaran metabolik durum.",
    macros: { protein: "%25", carb: "%5", fat: "%70" },
    dailyKcal: "2,150 kcal",
    menu: [
      { time: "08:30", meal: "Kahvaltı", desc: "3 Organik Yumurta, 1/2 Avokado, Bol Yeşillik & Ceviz" },
      { time: "13:30", meal: "Öğle Yemeği", desc: "Zeytinyağlı Izgara Somon, Kuşkonmaz ve Cevizli Roka Salatası" },
      { time: "19:00", meal: "Akşam Yemeği", desc: "Tereyağlı Dana Antrikot (180g), Fırın Brokoli & Hindistan Cevizi Yağlı Kahve" }
    ]
  },
  vegetarian: {
    title: "Bitkisel Biyo-Aktif Beslenme",
    badge: "VEJETARYEN",
    desc: "Yüksek antioksidan, bitkisel protein kompleksleri ve mikrobiyom dostu lif kaynaklarıyla hücresel yenilenme.",
    macros: { protein: "%30", carb: "%50", fat: "%20" },
    dailyKcal: "2,300 kcal",
    menu: [
      { time: "08:30", meal: "Kahvaltı", desc: "Chia Tohumlu Badem Sütü Kasesi, Yaban Mersini & Badem Ezmesi" },
      { time: "13:30", meal: "Öğle Yemeği", desc: "Kinoa & Izgara Nohutlu Akdeniz Kasesi, Tahin Sos" },
      { time: "19:00", meal: "Akşam Yemeği", desc: "Tofu Steki, Fırınlanmış Tatlı Patates & Buharda Brüksel Lahanası" }
    ]
  },
  glutenfree: {
    title: "Çölyak & Hassasiyet Eliminasyon Diyetı",
    badge: "GLUTENSİZ",
    desc: "Sindirimi zorlayan tahıl ve gluten proteinlerinden arındırılmış, bağırsak sağlığı odaklı elit beslenme.",
    macros: { protein: "%35", carb: "%40", fat: "%25" },
    dailyKcal: "2,200 kcal",
    menu: [
      { time: "08:30", meal: "Kahvaltı", desc: "Glutensiz Karabuğday Ekmeği Üzerine Füme Hindi & Haşlanmış Yumurta" },
      { time: "13:30", meal: "Öğle Yemeği", desc: "Basmati Pirinç Pilavı & Zeytinyağlı Izgara Tavuk Göğsü" },
      { time: "19:00", meal: "Akşam Yemeği", desc: "Fırın Izgara Köfte, Glutensiz Mısır Makarnası & Yeşil Salata" }
    ]
  },
  balanced: {
    title: "Makro Dengeli Atletik Protokol",
    badge: "DENGELİ FIT",
    desc: "Geniş besin yelpazesi ile kas kütlesini korurken metabolik hızı artıran standart sporcu diyet programı.",
    macros: { protein: "%40", carb: "%40", fat: "%20" },
    dailyKcal: "2,450 kcal",
    menu: [
      { time: "08:30", meal: "Kahvaltı", desc: "Yulaf Ezmesi, Whey Protein, Muz & Fıstık Ezmesi" },
      { time: "13:30", meal: "Öğle Yemeği", desc: "Izgara Hindi Göğsü, Esmer Pirinç & Zeytinyağlı Brokoli" },
      { time: "19:00", meal: "Akşam Yemeği", desc: "Yağsız Biftek (200g), Fırınlanmış Patates & Çoban Salata" }
    ]
  }
};