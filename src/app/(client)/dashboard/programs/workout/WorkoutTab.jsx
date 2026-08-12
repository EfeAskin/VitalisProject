"use client";

import React, { useState, useEffect } from "react";
import { 
  Play, 
  Home, 
  Building, 
  ChevronLeft, 
  Sparkles,
  Swords,       // Dövüş sporları ikonu
  Activity,     // Esnetme / Mobilite ikonu
  ShieldCheck,  // Güvenli / Form İpuçları ikonu
  Flame,
  Dumbbell,
  Info,
  Star,
  Compass
} from "lucide-react";

export default function WorkoutTab() {
  // --- STATE TANIMLAMALARI ---
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [workoutEnvironment, setWorkoutEnvironment] = useState("gym"); // 'gym' veya 'home'

  // --- DİNAMİK VERİ TABANINA BAĞLANABİLİR LOCAL STATE YAPILARI ---
  
  // 1. Ana Önerilen Program (user_programs tablosundan çekilecek)
  const [activeProgram, setActiveProgram] = useState({
    id: "active-prog-1",
    title: "Strong Beginnings",
    subtitle: "ÖNERİLEN PROGRAM",
    description: "Vücudunu güçlendirmek ve sıkı bir temel atmak için tasarlanmış, bilimsel olarak planlanmış tüm vücut adaptasyon programı.",
    duration: "4 Hafta",
    workoutsCount: "16 Antrenman",
    imageUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRUXtezMraIEvfDM3o0nH7-6YuunnJYEJenN4eFdymTXarbDkCIjPBuTeQ&s=10"
  });

  // 2. Kategori Kartları (workout_categories tablosundan çekilecek)
  const [categories, setCategories] = useState([
    { id: "my-creations", title: "BENİM OLUŞTURDUKLARIM", bg: "https://www.macfit.com/wp-content/uploads/2025/09/fitness-antrenman-header-43.jpg" },
    { id: "from-coach", title: "EĞİTMENDEN GELENLER", bg: "https://img-hopi.mncdn.com/42/fd/42fd9ec31d0246fe846a4d4157032d9a.jpeg", premium: true },
    { id: "favorites", title: "FAVORİLERİM", bg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcThkLkfcbdPChAuJbYQkmMqeIOgBSLdVrc7rQG-9jt0rdE57S9K_h1ZvdP4&s=10" },
    { id: "last-done", title: "EN SON YAPTIKLARIM", bg: "https://www.macfit.com/wp-content/uploads/2025/09/fitness-antrenman-programi-nasil-olmali.jpg?q=80&w=600" }
  ]);

  // 3. TOP 10 Antrenman (top_workouts tablosundan çekilecek)
  const [top10Workouts, setTop10Workouts] = useState([
    { id: 1, title: "Güçlü ve Şekilli Kollar - 1", level: "Başlangıç", duration: "27 dk", exercises: 12, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXe2TcUY2eOVMXZaVpcntnD3E-38oZBuL1T6vLD6CQfgSVHmzZI7gceBIu&s=10" },
    { id: 2, title: "Güçlü ve Geniş Omuzlar - 2", level: "Orta", duration: "46 dk", exercises: 16, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQWpz4WYpfZawbazM4l8QHCE4q-oLXp5DHW8pBbfbWNWpLem8GXfqJ3GJJm&s=10" }
    
  ]);

  // 4. ⭐ STAJ AMİRİ İSTERİ: Dövüş Sporları Aktiviteleri (combat_workouts tablosundan çekilecek)
  const [combatWorkouts, setCombatWorkouts] = useState([
    { id: "combat-1", title: "Kickboks Güç Antrenmanı", level: "İleri", duration: "45 dk", kcal: "620 kcal", img: "https://www.dfasportscenter.com/images/branslarimiz/kickboks.jpg?q=80&w=600", desc: "Alt ve üst vücut koordinasyonunu artıran, patlayıcı güç odaklı teknik tekme ve yumruk serileri." },
    { id: "combat-2", title: "Boks Temelleri & Kondisyon", level: "Orta", duration: "35 dk", kcal: "480 kcal", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeWoTNR6kiJVtuPrHQrtXouyi942T1Ib3EgWsgh9ea1dv5WunBbtYY-lbG&s=10", desc: "Gölge boksu, gard alma ve yüksek tempolu kardiyovasküler boks kombinasyonları." }
    
  ]);

  // 5. ⭐ STAJ AMİRİ İSTERİ: Esnetme & Mobilite Antrenmanları (stretching_workouts tablosundan çekilecek)
  const [stretchingWorkouts, setStretchingWorkouts] = useState([
    { id: "stretch-1", title: "Tüm Vücut Esnetme & Mobilite", level: "Her Seviye", duration: "20 dk", focus: "Esneklik", img: "https://www.macfit.com/wp-content/uploads/2022/09/esneme-hareketlerinin-yararlari-.jpg", desc: "Eklemleri rahatlatan, kas boyunu uzatan ve antrenman sonrası toparlanmayı hızlandıran rutin." },
    { id: "stretch-2", title: "Statik Post-Workout Recovery", level: "Başlangıç", duration: "15 dk", focus: "Rejenerasyon", img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSNT2FbVQrr5ClhdJCp0FtHIKco7SGU2plLAKIQcVIEjcw2EA2XpSPpH4I&s=10", desc: "Ağır bacak antrenmanları sonrasında laktik asit birikimini azaltacak statik esnemeler." }
  ]);

  // 6. Detaylı Egzersiz Veritabanı ve Form Açıklamaları (exercises tablosundan çekilecek)
  // ⭐ STAJ AMİRİ İSTERİ: "Egzersiz ve Detaylı Açıklamaları" için açıklamalar zenginleştirildi.
  const [exerciseDatabase, setExerciseDatabase] = useState({
    gym: [
      { 
        name: "Incline Barbell Bench Press", 
        sets: "4 Set x 10 Tekrar", 
        tip: "Üst göğüs odaklı, kontrollü negatif.",
        instructions: "Sehpayı 30-45 derece açıya ayarlayın. Barı omuz genişliğinden biraz daha geniş tutun. Nefes alarak barı köprücük kemiğinize doğru kontrollü indirin, nefes vererek patlayıcı güçle yukarı itin." 
      },
      { 
        name: "Dumbbell Flyes (Düz Sehpa)", 
        sets: "3 Set x 12 Tekrar", 
        tip: "Göğüs kaslarını iyice esneterek sıkıştır.",
        instructions: "Düz sehpaya uzanın, dambılları yukarıda birleştirin. Dirseklerinizi hafif bükük tutarak kollarınızı iki yana açın. Göğüs kaslarındaki gerilimi hissedene kadar inin, ardından kucaklama hareketiyle yukarı kaldırın."
      },
      { 
        name: "Cable Crossover", 
        sets: "4 Set x 15 Tekrar", 
        tip: "Alt ve iç göğüs lifleri için tepe noktada kas.",
        instructions: "Makaraları üst seviyeye ayarlayın. Bir adım öne çıkıp gövdenizi hafifçe öne eğin. Kollarınızı aşağı ve öne doğru yay çizerek birleştirin. En dip noktada göğüs kaslarınızı 1 saniye sıkın."
      }
    ],
    home: [
      { 
        name: "Decline Push-Ups (Ayaklar Yukarıda)", 
        sets: "4 Set x Maksimum Tekrar", 
        tip: "Üst göğüs liflerini hedeflemek için mükemmel bir vücut ağırlığı hareketi.",
        instructions: "Ayaklarınızı bir koltuk, yatak veya sehpa üzerine yerleştirin. Ellerinizi yerde omuz genişliğinde açın. Gövdenizi düz bir çizgi halinde tutarak göğsünüz yere yaklaşana kadar inin ve kendinizi yukarı itin."
      },
      { 
        name: "Direnç Bandı ile Chest Press", 
        sets: "4 Set x 15 Tekrar", 
        tip: "Bant gerginliğini hareket boyu korumaya odaklanın.",
        instructions: "Direnç bandını arkanızdaki sabit bir direğe veya kapı aparatına sabitleyin. Bandın uçlarını tutarak öne adım atın. Dirsekleriniz 90 derecedeyken bandı öne doğru itin ve göğüs kaslarınızı sıkıştırarak yavaşça bırakın."
      },
      { 
        name: "Geniş Tutuş Şınav", 
        sets: "3 Set x 20 Tekrar", 
        tip: "Yavaş iniş, patlayıcı kalkış ile kas aktivasyonunu maksimize edin.",
        instructions: "Klasik şınav pozisyonu alın ancak ellerinizi omuz genişliğinden belirgin şekilde daha dışarı yerleştirin. Karın ve kalçanızı sıkarak kontrollü bir şekilde göğsünüzü yere yaklaştırın ve itin."
      }
    ]
  });

  // --- NEON DB FETCH ŞABLONU (YARIN KULLANACAĞIN KOD) ---
  /*
  useEffect(() => {
    async function fetchWorkoutTabContent() {
      setIsLoading(true);
      try {
        const response = await fetch('/api/workouts'); 
        if (!response.ok) throw new Error('Antrenman tab verileri yüklenirken bir sorun oluştu.');
        const data = await response.json();
        
        // Veritabanından gelen verilerle stateleri besliyoruz:
        if (data.activeProgram) setActiveProgram(data.activeProgram);
        if (data.categories) setCategories(data.categories);
        if (data.topWorkouts) setTop10Workouts(data.topWorkouts);
        if (data.combatWorkouts) setCombatWorkouts(data.combatWorkouts);
        if (data.stretchingWorkouts) setStretchingWorkouts(data.stretchingWorkouts);
        if (data.exerciseDb) setExerciseDatabase(data.exerciseDb);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    }
    fetchWorkoutTabContent();
  }, []);
  */

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#11142D] flex items-center justify-center">
        <div className="animate-spin rounded-full h-14 w-14 border-t-2 border-b-2 border-amber-400 shadow-[0_0_25px_rgba(251,191,36,0.6)]"></div>
      </div>
    );
  }

  // ================= DETAY SAYFASI GÖRÜNÜMÜ =================
  if (selectedWorkout) {
    const activeExercises = exerciseDatabase[workoutEnvironment] || [];

    return (
      <div className="animate-fadeIn max-w-5xl mx-auto px-1 space-y-8">
        
        {/* Geri Dönüş Butonu */}
        <button 
          onClick={() => setSelectedWorkout(null)}
          className="flex items-center gap-2 text-sm font-bold text-amber-400/80 hover:text-amber-300 transition-all duration-300 group bg-amber-950/30 border border-amber-500/30 px-5 py-2.5 rounded-full backdrop-blur-xl shadow-[0_0_15px_rgba(245,158,11,0.15)] hover:shadow-[0_0_25px_rgba(245,158,11,0.35)]"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform text-amber-400" /> Geri Dön
        </button>

        {/* Antrenman Detay Başlığı */}
        <div className="relative rounded-3xl overflow-hidden h-[280px] shadow-[0_0_50px_rgba(0,0,0,0.8)] border border-amber-500/30 bg-amber-950/20 backdrop-blur-2xl group">
          <img 
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200" 
            alt="Göğüs" 
            className="w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#11142D] via-[#11142D]/50 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-amber-300 tracking-widest uppercase bg-amber-500/20 border border-amber-400/40 px-3.5 py-1.5 rounded-full shadow-[0_0_12px_rgba(245,158,11,0.3)] backdrop-blur-md">
                GÖĞÜS HEDEFİ
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-[0_2px_10px_rgba(0,0,0,0.9)]">
                Göğüs & Üst Vücut Parçalama
              </h1>
              <p className="text-xs text-amber-100/70 max-w-xl font-medium leading-relaxed">
                Omuz eklemini koruyan, kas liflerini maksimum derecede esneten profesyonel hipertrofi planı.
              </p>
            </div>

            {/* ⭐ STAJ AMİRİ İSTERİ: Ev / Salon Switch'i */}
            <div className="flex bg-[#11142D]/90 border border-amber-500/40 p-1.5 rounded-full shadow-[0_0_20px_rgba(0,0,0,0.6)] backdrop-blur-xl self-start md:self-auto">
              <button
                onClick={() => setWorkoutEnvironment("home")}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
                  workoutEnvironment === "home" 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.6)]" 
                    : "text-amber-200/60 hover:text-amber-100"
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Evde
              </button>
              <button
                onClick={() => setWorkoutEnvironment("gym")}
                className={`flex items-center gap-1.5 px-5 py-2 rounded-full text-xs font-black tracking-wider transition-all duration-300 ${
                  workoutEnvironment === "gym" 
                    ? "bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.6)]" 
                    : "text-amber-200/60 hover:text-amber-100"
                }`}
              >
                <Building className="w-3.5 h-3.5" /> Salonda
              </button>
            </div>
          </div>
        </div>

        {/* Egzersiz Listesi & Açıklamaları */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-amber-500/20 pb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.8)]" />
              <h3 className="font-black tracking-wider text-amber-100 text-lg uppercase">
                HAREKETLER ({activeExercises.length})
              </h3>
            </div>
            <span className="text-xs text-amber-300 font-extrabold uppercase tracking-widest bg-amber-500/10 px-4 py-1.5 rounded-full border border-amber-500/30 backdrop-blur-md shadow-[0_0_15px_rgba(245,158,11,0.15)]">
              {workoutEnvironment === "gym" ? "Salon Ekipmanları Aktif" : "Ev Ekipmanları / Vücut Ağırlığı"}
            </span>
          </div>

          {/* ⭐ STAJ AMİRİ İSTERİ: Çeşitli Egzersizler ve Detaylı Açıklamaları */}
          <div className="grid grid-cols-1 gap-6">
            {activeExercises.map((exercise, idx) => (
              <div 
                key={idx} 
                className="bg-amber-950/20 border border-amber-500/30 hover:border-amber-400/60 p-6 rounded-3xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-500 hover:shadow-[0_0_30px_rgba(245,158,11,0.2)] group backdrop-blur-xl"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-slate-950 bg-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.8)] w-7 h-7 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-black text-white text-lg group-hover:text-amber-300 transition-colors">
                      {exercise.name}
                    </h4>
                  </div>
                  
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 tracking-wide">
                    <Activity className="w-3.5 h-3.5 text-emerald-400 drop-shadow-[0_0_6px_rgba(52,211,153,0.8)]" /> {exercise.sets}
                  </p>

                  <div className="bg-[#11142D]/80 border border-amber-500/20 p-4 rounded-2xl space-y-2 mt-2 backdrop-blur-md">
                    <p className="text-[11px] text-amber-300 font-bold italic flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" /> Tüyo: {exercise.tip}
                    </p>
                    <p className="text-xs text-amber-100/70 leading-relaxed pt-2 border-t border-amber-500/10">
                      {exercise.instructions}
                    </p>
                  </div>
                </div>
                
                <a 
                  href="https://www.youtube.com/shorts/RC0YI91ZOII" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-13 h-13 bg-gradient-to-br from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-slate-950 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-[0_0_20px_rgba(245,158,11,0.4)] hover:shadow-[0_0_30px_rgba(245,158,11,0.7)] self-end md:self-auto group-hover:scale-110"
                >
                  <Play className="w-6 h-6 fill-slate-950 ml-0.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ⭐ STAJ AMİRİ İSTERİ: Güvenlik ve Form Rehberi Bölümü (Detaylı Açıklamalar Desteği) */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent border border-emerald-500/40 p-6 rounded-3xl space-y-3 backdrop-blur-xl shadow-[0_0_30px_rgba(16,185,129,0.15)]">
          <h4 className="font-black text-sm text-emerald-300 tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.8)]" /> Profesyonel Form & Emniyet Rehberi
          </h4>
          <p className="text-xs text-emerald-100/70 leading-relaxed font-medium">
            Antrenmandan maksimum verimi almak ve sakatlık riskini sıfıra indirmek için hareket formunu bozmamaya özen gösterin. İtiş aşamalarında nefes verin, ağırlığı indirirken (negatif fazda) nefes alarak kası kontrollü şekilde uzatın.
          </p>
        </div>
      </div>
    );
  }

  // ================= ANA ANTRENMAN TAB İÇERİĞİ =================
  return (
    <div className="space-y-12 animate-fadeIn">
      
      {/* 1. SEKTÖR: Senin Programın */}
      <div>
        <h4 className="text-xs font-black tracking-widest text-amber-400/90 mb-4 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]"></span> SENİN PROGRAMIN
        </h4>
        <div className="bg-gradient-to-br from-amber-950/30 via-slate-900/40 to-amber-900/10 border border-amber-500/40 rounded-3xl overflow-hidden relative group hover:border-amber-400/70 transition-all duration-500 shadow-[0_0_35px_rgba(245,158,11,0.15)] hover:shadow-[0_0_50px_rgba(245,158,11,0.25)] backdrop-blur-2xl">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="p-8 md:col-span-7 flex flex-col justify-between z-10 space-y-6">
              <div>
                <span className="text-[10px] font-black tracking-widest text-amber-300 bg-amber-500/20 px-3.5 py-1.5 rounded-full border border-amber-400/30 uppercase shadow-[0_0_12px_rgba(245,158,11,0.2)] backdrop-blur-md">
                  {activeProgram.subtitle}
                </span>
                <h2 className="text-3xl font-black tracking-tight mt-4 mb-2 text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-100 to-amber-300 drop-shadow-[0_2px_8px_rgba(0,0,0,0.8)]">
                  {activeProgram.title}
                </h2>
                <p className="text-amber-100/70 text-xs leading-relaxed max-w-md font-medium">
                  {activeProgram.description}
                </p>
                <div className="flex gap-4 mt-5 text-xs text-amber-300/80 font-bold">
                  <span className="flex items-center gap-1.5 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/20">⏱️ {activeProgram.duration}</span>
                  <span className="flex items-center gap-1.5 bg-amber-950/40 px-3 py-1 rounded-lg border border-amber-500/20">🏋️ {activeProgram.workoutsCount}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWorkout(activeProgram.id)}
                className="bg-gradient-to-r from-amber-400 via-orange-500 to-amber-500 hover:from-amber-300 hover:to-orange-400 text-slate-950 font-black py-4 px-8 rounded-2xl text-xs tracking-widest transition-all duration-300 self-start flex items-center gap-2.5 shadow-[0_0_25px_rgba(245,158,11,0.5)] hover:shadow-[0_0_40px_rgba(245,158,11,0.8)] hover:scale-105"
              >
                <Play className="w-4 h-4 fill-slate-950" /> PROGRAMA BAŞLA
              </button>
            </div>
            <div className="hidden md:block md:col-span-5 relative min-h-[280px] overflow-hidden">
              <img 
                src={activeProgram.imageUrl} 
                alt="Gym" 
                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-[#11142D] via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEKTÖR: Kategoriler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black tracking-widest text-purple-400/90 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 shadow-[0_0_8px_rgba(192,132,252,1)]"></span> KATEGORİLER & KÜTÜPHANEM
          </h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setSelectedWorkout("dynamic-category")}
              className={`group relative rounded-3xl overflow-hidden aspect-video md:aspect-square cursor-pointer border transition-all duration-500 backdrop-blur-xl bg-purple-950/20 ${
                cat.premium 
                  ? 'border-purple-500/60 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:border-purple-400 hover:shadow-[0_0_35px_rgba(168,85,247,0.4)]' 
                  : 'border-purple-500/20 hover:border-purple-400/50 shadow-[0_0_15px_rgba(0,0,0,0.5)]'
              }`}
            >
              <img src={cat.bg} alt={cat.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11142D] via-[#11142D]/30 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-between h-auto">
                <h5 className="font-black text-xs tracking-wider text-purple-100 mb-1 uppercase group-hover:text-purple-300 transition-colors">{cat.title}</h5>
                {cat.premium && (
                  <span className="text-[9px] font-black text-purple-300 flex items-center gap-1 bg-purple-500/30 px-2.5 py-1 rounded-full border border-purple-400/40 w-fit backdrop-blur-md shadow-[0_0_10px_rgba(168,85,247,0.3)]">
                    <Sparkles className="w-3 h-3 text-purple-300 animate-pulse" /> Eğitmen Yazdı!
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ STAJ AMİRİ İSTERİ: Dövüş Sporları Aktiviteleri (Combat Sports) */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Swords className="w-4 h-4 text-rose-400 drop-shadow-[0_0_8px_rgba(244,63,94,0.8)]" />
            <h4 className="text-xs font-black tracking-widest text-rose-400/90 uppercase flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(244,63,94,1)]"></span> DÖVÜŞ SPORLARI AKTİVİTELERİ
            </h4>
          </div>
          <span className="text-[10px] text-rose-300/80 font-black tracking-wider bg-rose-950/40 border border-rose-500/30 px-3 py-1 rounded-full">Premium Akademik Eğitim</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {combatWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => setSelectedWorkout(workout.id)}
              className="bg-rose-950/20 border border-rose-500/30 rounded-3xl overflow-hidden flex flex-col sm:flex-row cursor-pointer group hover:border-rose-400 hover:shadow-[0_0_30px_rgba(244,63,94,0.25)] transition-all duration-500 backdrop-blur-2xl"
            >
              <div className="w-full sm:w-[150px] h-[150px] relative overflow-hidden flex-shrink-0">
                <img src={workout.img} alt={workout.title} className="w-full h-full object-cover brightness-[0.45] group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h4 className="font-black text-white text-base leading-snug group-hover:text-rose-300 transition-colors">
                    {workout.title}
                  </h4>
                  <p className="text-[11px] text-rose-100/70 line-clamp-2 mt-1 leading-relaxed font-medium">
                    {workout.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-black text-rose-200 bg-rose-950/60 border border-rose-500/20 px-2.5 py-1 rounded-full">{workout.level}</span>
                    <span className="text-[9px] font-black text-rose-200 bg-rose-950/60 border border-rose-500/20 px-2.5 py-1 rounded-full">⏱️ {workout.duration}</span>
                    <span className="text-[9px] font-black text-rose-300 bg-rose-500/20 border border-rose-400/30 px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(244,63,94,0.2)]">🔥 {workout.kcal}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ⭐ STAJ AMİRİ İSTERİ: Esnetme & Mobilite Antrenmanları (Stretching) */}
      <div>
        <div className="flex items-center gap-2 mb-4">
          <Activity className="w-4 h-4 text-emerald-400 drop-shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
          <h4 className="text-xs font-black tracking-widest text-emerald-400/90 uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,1)]"></span> ESNETME & MOBİLİTE REHBERİ
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stretchingWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => setSelectedWorkout(workout.id)}
              className="bg-emerald-950/20 border border-emerald-500/30 rounded-3xl overflow-hidden flex flex-col sm:flex-row cursor-pointer group hover:border-emerald-400 hover:shadow-[0_0_30px_rgba(16,185,129,0.25)] transition-all duration-500 backdrop-blur-2xl"
            >
              <div className="w-full sm:w-[150px] h-[150px] relative overflow-hidden flex-shrink-0">
                <img src={workout.img} alt={workout.title} className="w-full h-full object-cover brightness-[0.45] group-hover:scale-110 transition-transform duration-700" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h4 className="font-black text-white text-base leading-snug group-hover:text-emerald-300 transition-colors">
                    {workout.title}
                  </h4>
                  <p className="text-[11px] text-emerald-100/70 line-clamp-2 mt-1 leading-relaxed font-medium">
                    {workout.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-black text-emerald-200 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-full">{workout.level}</span>
                    <span className="text-[9px] font-black text-emerald-200 bg-emerald-950/60 border border-emerald-500/20 px-2.5 py-1 rounded-full">⏱️ {workout.duration}</span>
                    <span className="text-[9px] font-black text-emerald-300 bg-emerald-500/20 border border-emerald-400/30 px-2.5 py-1 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.2)]">🎯 {workout.focus}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SEKTÖR: TOP 10 Antrenman */}
      <div>
        <h4 className="text-xs font-black tracking-widest text-amber-400/90 mb-4 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,1)]"></span> TOP 10 ANTRENMAN
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {top10Workouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => setSelectedWorkout(workout.id)}
              className="bg-amber-950/20 border border-amber-500/30 rounded-3xl overflow-hidden flex cursor-pointer group hover:border-amber-400 hover:shadow-[0_0_30px_rgba(245,158,11,0.25)] transition-all duration-500 backdrop-blur-2xl"
            >
              <div className="w-[140px] relative overflow-hidden flex-shrink-0">
                <img src={workout.img} alt={workout.title} className="w-full h-full object-cover brightness-[0.45] group-hover:scale-110 transition-transform duration-700" />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-950/90 backdrop-blur-md border border-amber-400/50 flex items-center justify-center font-black text-xs text-amber-300 shadow-[0_0_10px_rgba(245,158,11,0.5)]">
                  {workout.id}
                </div>
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="font-black text-white text-base leading-snug group-hover:text-amber-300 transition-colors">{workout.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] text-amber-200/80 bg-amber-950/60 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">{workout.level}</span>
                    <span className="text-[10px] text-amber-200/80 bg-amber-950/60 border border-amber-500/20 px-2.5 py-1 rounded-full font-bold">⏱️ {workout.duration}</span>
                  </div>
                </div>
                <span className="text-[11px] text-amber-400 font-black tracking-widest uppercase mt-4 block group-hover:text-amber-300 transition-colors">GÖRÜNTÜLE & BAŞLA</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SEKTÖR: Keşfet */}
      <div>
        <h4 className="text-xs font-black tracking-widest text-cyan-400/90 mb-4 uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,1)]"></span> DENEYİMİ KEŞFEDİN
        </h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "UZMANLARI KEŞFET", desc: "Abonelik alıp özel program yazdırmak için yüzlerce antrenörü keşfet.", bg: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTYXZh1IOxz6DfrbZaJLBsSv1wV42L7arQGSMJZMZeL90BTnWrBVeJLR3k&s=10" },
            { title: "GRUP DERSLERİ", desc: "Online canlı veya video destekli topluluk derslerine katılın.", bg: "https://www.macfit.com/wp-content/uploads/2024/12/Grup-Dersi-Sayfasi-Go%CC%88rselleri_hero_1920x640-1.jpg" },
            { title: "AKSESUAR & EKİPMAN", desc: "Evde antrenman yapanlar için direnç bantları ve dambıllar.", bg: "https://cdn-s3.pttavm.com/pimages/592/190/741/629f9fc50662b.jpg" }
          ].map((item, idx) => (
            <div key={idx} className="relative rounded-3xl overflow-hidden aspect-[4/3] group cursor-pointer border border-cyan-500/30 hover:border-cyan-400 transition-all duration-500 backdrop-blur-2xl bg-cyan-950/20 hover:shadow-[0_0_30px_rgba(34,211,238,0.2)]">
              <img src={item.bg} alt={item.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute inset-0 bg-gradient-to-t from-[#11142D] via-[#11142D]/40 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h5 className="font-black text-base text-white tracking-wider group-hover:text-cyan-300 transition-colors">{item.title}</h5>
                <p className="text-[10px] text-cyan-100/70 mt-1.5 leading-relaxed font-medium">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}