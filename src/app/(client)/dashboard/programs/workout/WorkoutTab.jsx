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
    imageUrl: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600"
  });

  // 2. Kategori Kartları (workout_categories tablosundan çekilecek)
  const [categories, setCategories] = useState([
    { id: "my-creations", title: "BENİM OLUŞTURDUKLARIM", bg: "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?q=80&w=600" },
    { id: "from-coach", title: "EĞİTMENDEN GELENLER", bg: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=600", premium: true },
    { id: "favorites", title: "FAVORİLERİM", bg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=600" },
    { id: "last-done", title: "EN SON YAPTIKLARIM", bg: "https://www.macfit.com/wp-content/uploads/2025/09/fitness-antrenman-programi-nasil-olmali.jpg?q=80&w=600" }
  ]);

  // 3. TOP 10 Antrenman (top_workouts tablosundan çekilecek)
  const [top10Workouts, setTop10Workouts] = useState([
    { id: 1, title: "Güçlü ve Geniş Omuzlar - 2", level: "Orta", duration: "46 dk", exercises: 16, img: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=600" },
    { id: 2, title: "Güçlü ve Şekilli Kollar - 1", level: "Başlangıç", duration: "27 dk", exercises: 12, img: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRXe2TcUY2eOVMXZaVpcntnD3E-38oZBuL1T6vLD6CQfgSVHmzZI7gceBIu&s=10" }
  ]);

  // 4. ⭐ STAJ AMİRİ İSTERİ: Dövüş Sporları Aktiviteleri (combat_workouts tablosundan çekilecek)
  const [combatWorkouts, setCombatWorkouts] = useState([
    { id: "combat-1", title: "Boks Temelleri & Kondisyon", level: "Orta", duration: "35 dk", kcal: "480 kcal", img: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=600", desc: "Gölge boksu, gard alma ve yüksek tempolu kardiyovasküler boks kombinasyonları." },
    { id: "combat-2", title: "Kickboks Güç Antrenmanı", level: "İleri", duration: "45 dk", kcal: "620 kcal", img: "https://www.dfasportscenter.com/images/branslarimiz/kickboks.jpg?q=80&w=600", desc: "Alt ve üst vücut koordinasyonunu artıran, patlayıcı güç odaklı teknik tekme ve yumruk serileri." }
  ]);

  // 5. ⭐ STAJ AMİRİ İSTERİ: Esnetme & Mobilite Antrenmanları (stretching_workouts tablosundan çekilecek)
  const [stretchingWorkouts, setStretchingWorkouts] = useState([
    { id: "stretch-1", title: "Tüm Vücut Esnetme & Mobilite", level: "Her Seviye", duration: "20 dk", focus: "Esneklik", img: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600", desc: "Eklemleri rahatlatan, kas boyunu uzatan ve antrenman sonrası toparlanmayı hızlandıran rutin." },
    { id: "stretch-2", title: "Statik Post-Workout Recovery", level: "Başlangıç", duration: "15 dk", focus: "Rejenerasyon", img: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?q=80&w=600", desc: "Ağır bacak antrenmanları sonrasında laktik asit birikimini azaltacak statik esnemeler." }
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
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
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
          className="flex items-center gap-2 text-sm font-semibold text-slate-400 hover:text-orange-400 transition-all duration-300 group"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Geri Dön
        </button>

        {/* Antrenman Detay Başlığı */}
        <div className="relative rounded-3xl overflow-hidden h-[280px] shadow-2xl border border-slate-800/80 group">
          <img 
            src="https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=1200" 
            alt="Göğüs" 
            className="w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-700" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
          
          <div className="absolute bottom-6 left-6 right-6 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2">
              <span className="text-[10px] font-black text-orange-400 tracking-widest uppercase bg-orange-500/10 border border-orange-500/20 px-3 py-1 rounded-full">
                GÖĞÜS HEDEFİ
              </span>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white drop-shadow-md">
                Göğüs & Üst Vücut Parçalama
              </h1>
              <p className="text-xs text-slate-400 max-w-xl">
                Omuz eklemini koruyan, kas liflerini maksimum derecede esneten profesyonel hipertrofi planı.
              </p>
            </div>

            {/* ⭐ STAJ AMİRİ İSTERİ: Ev / Salon Switch'i */}
            <div className="flex bg-slate-900/90 border border-slate-800 p-1.5 rounded-full shadow-2xl backdrop-blur-md self-start md:self-auto">
              <button
                onClick={() => setWorkoutEnvironment("home")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  workoutEnvironment === "home" 
                    ? "bg-orange-500 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Home className="w-3.5 h-3.5" /> Evde
              </button>
              <button
                onClick={() => setWorkoutEnvironment("gym")}
                className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold transition-all duration-300 ${
                  workoutEnvironment === "gym" 
                    ? "bg-orange-500 text-slate-950 shadow-[0_0_15px_rgba(249,115,22,0.4)]" 
                    : "text-slate-400 hover:text-slate-200"
                }`}
              >
                <Building className="w-3.5 h-3.5" /> Salonda
              </button>
            </div>
          </div>
        </div>

        {/* Egzersiz Listesi & Açıklamaları */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-slate-900 pb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-orange-500" />
              <h3 className="font-extrabold tracking-wider text-slate-200 text-lg uppercase">
                HAREKETLER ({activeExercises.length})
              </h3>
            </div>
            <span className="text-xs text-orange-400 font-bold uppercase tracking-wider bg-orange-500/10 px-3 py-1 rounded-full border border-orange-500/20">
              {workoutEnvironment === "gym" ? "Salon Ekipmanları Aktif" : "Ev Ekipmanları / Vücut Ağırlığı"}
            </span>

          </div>

          {/* ⭐ STAJ AMİRİ İSTERİ: Çeşitli Egzersizler ve Detaylı Açıklamaları */}
          <div className="grid grid-cols-1 gap-6">
            {activeExercises.map((exercise, idx) => (
              <div 
                key={idx} 
                className="bg-slate-900/60 border border-slate-800/80 hover:border-orange-500/30 p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-300 hover:shadow-[0_4px_20px_rgba(249,115,22,0.05)] group"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-black text-orange-500 bg-orange-500/10 w-6 h-6 rounded-full flex items-center justify-center">
                      {idx + 1}
                    </span>
                    <h4 className="font-bold text-white text-lg group-hover:text-orange-400 transition-colors">
                      {exercise.name}
                    </h4>
                  </div>
                  
                  <p className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-orange-500" /> {exercise.sets}
                  </p>

                  <div className="bg-slate-950/80 border border-slate-800/50 p-4 rounded-xl space-y-2 mt-2">
                    <p className="text-[11px] text-orange-400/90 font-semibold italic flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Tüyo: {exercise.tip}
                    </p>
                    <p className="text-xs text-slate-400 leading-relaxed pt-1 border-t border-slate-900">
                      {exercise.instructions}
                    </p>
                  </div>
                </div>
                
                <a 
                  href="https://www.youtube.com/shorts/RC0YI91ZOII" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 bg-slate-800 hover:bg-orange-500 text-white hover:text-slate-950 rounded-2xl flex items-center justify-center transition-all duration-300 shadow-md self-end md:self-auto group-hover:scale-105"
                >
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* ⭐ STAJ AMİRİ İSTERİ: Güvenlik ve Form Rehberi Bölümü (Detaylı Açıklamalar Desteği) */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-900/40 border border-slate-800 p-6 rounded-3xl space-y-3">
          <h4 className="font-black text-sm text-white tracking-widest uppercase flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-500" /> Profesyonel Form & Emniyet Rehberi
          </h4>
          <p className="text-xs text-slate-400 leading-relaxed">
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
        <h4 className="text-xs font-black tracking-widest text-slate-400 mb-4 uppercase">SENİN PROGRAMIN</h4>
        <div className="bg-slate-900 border border-slate-800/85 rounded-3xl overflow-hidden relative group hover:border-orange-500/20 transition-all duration-500 shadow-xl">
          <div className="grid grid-cols-1 md:grid-cols-12">
            <div className="p-8 md:col-span-7 flex flex-col justify-between z-10 space-y-6">
              <div>
                <span className="text-[10px] font-black tracking-widest text-orange-400 bg-orange-500/10 px-3 py-1.5 rounded-full border border-orange-500/20 uppercase">
                  {activeProgram.subtitle}
                </span>
                <h2 className="text-3xl font-black tracking-tight mt-4 mb-2 text-white">
                  {activeProgram.title}
                </h2>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                  {activeProgram.description}
                </p>
                <div className="flex gap-4 mt-5 text-xs text-slate-400 font-semibold">
                  <span className="flex items-center gap-1">⏱️ {activeProgram.duration}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">🏋️ {activeProgram.workoutsCount}</span>
                </div>
              </div>
              <button 
                onClick={() => setSelectedWorkout(activeProgram.id)}
                className="bg-orange-500 hover:bg-orange-600 text-slate-950 font-bold py-3.5 px-8 rounded-2xl text-xs tracking-wider transition-all duration-300 self-start flex items-center gap-2 shadow-[0_4px_20px_rgba(249,115,22,0.3)] hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" /> PROGRAMA BAŞLA
              </button>
            </div>
            <div className="hidden md:block md:col-span-5 relative min-h-[280px] overflow-hidden">
              <img 
                src={activeProgram.imageUrl} 
                alt="Gym" 
                className="absolute inset-0 w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-700" 
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-900 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>

      {/* 2. SEKTÖR: Kategoriler */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">KATEGORİLER & KÜTÜPHANEM</h4>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <div 
              key={cat.id}
              onClick={() => setSelectedWorkout("dynamic-category")}
              className={`group relative rounded-2xl overflow-hidden aspect-video md:aspect-square cursor-pointer border transition-all duration-300 ${
                cat.premium 
                  ? 'border-orange-500/50 shadow-[0_0_15px_rgba(249,115,22,0.1)]' 
                  : 'border-slate-800 hover:border-slate-700'
              }`}
            >
              <img src={cat.bg} alt={cat.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.4] group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
              <div className="absolute bottom-4 left-4 right-4 flex flex-col justify-between h-auto">
                <h5 className="font-extrabold text-xs tracking-wider text-white mb-1 uppercase">{cat.title}</h5>
                {cat.premium && (
                  <span className="text-[9px] font-bold text-orange-400 flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Eğitmen Yazdı!
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
            <Swords className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">
              DÖVÜŞ SPORLARI AKTİVİTELERİ
            </h4>
          </div>
          <span className="text-[10px] text-slate-500 font-bold">Premium Akademik Eğitim</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {combatWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => setSelectedWorkout(workout.id)}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col sm:flex-row cursor-pointer group hover:border-orange-500/30 hover:shadow-[0_4px_20px_rgba(249,115,22,0.05)] transition-all duration-300"
            >
              <div className="w-full sm:w-[150px] h-[150px] relative overflow-hidden flex-shrink-0">
                <img src={workout.img} alt={workout.title} className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h4 className="font-black text-white text-base leading-snug group-hover:text-orange-400 transition-colors">
                    {workout.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {workout.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{workout.level}</span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">⏱️ {workout.duration}</span>
                    <span className="text-[9px] font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-full">🔥 {workout.kcal}</span>
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
          <Activity className="w-4 h-4 text-emerald-500" />
          <h4 className="text-xs font-black tracking-widest text-slate-400 uppercase">
            ESNETME & MOBİLİTE REHBERİ
          </h4>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {stretchingWorkouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => setSelectedWorkout(workout.id)}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden flex flex-col sm:flex-row cursor-pointer group hover:border-emerald-500/30 hover:shadow-[0_4px_20px_rgba(16,185,129,0.05)] transition-all duration-300"
            >
              <div className="w-full sm:w-[150px] h-[150px] relative overflow-hidden flex-shrink-0">
                <img src={workout.img} alt={workout.title} className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500" />
              </div>
              <div className="p-5 flex flex-col justify-between flex-1 space-y-3">
                <div>
                  <h4 className="font-black text-white text-base leading-snug group-hover:text-emerald-400 transition-colors">
                    {workout.title}
                  </h4>
                  <p className="text-[11px] text-slate-400 line-clamp-2 mt-1 leading-relaxed">
                    {workout.desc}
                  </p>
                  <div className="flex flex-wrap gap-2 mt-3">
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">{workout.level}</span>
                    <span className="text-[9px] font-bold text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">⏱️ {workout.duration}</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full">🎯 {workout.focus}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. SEKTÖR: TOP 10 Antrenman */}
      <div>
        <h4 className="text-xs font-black tracking-widest text-slate-400 mb-4 uppercase">TOP 10 ANTRENMAN</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {top10Workouts.map((workout) => (
            <div 
              key={workout.id} 
              onClick={() => setSelectedWorkout(workout.id)}
              className="bg-slate-900 border border-slate-800/80 rounded-3xl overflow-hidden flex cursor-pointer group hover:border-orange-500/20 transition-all duration-300"
            >
              <div className="w-[140px] relative overflow-hidden flex-shrink-0">
                <img src={workout.img} alt={workout.title} className="w-full h-full object-cover brightness-75 group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute top-2 left-2 w-8 h-8 rounded-full bg-slate-950/90 backdrop-blur-md border border-slate-800 flex items-center justify-center font-black text-xs text-orange-400">
                  {workout.id}
                </div>
              </div>
              <div className="p-5 flex flex-col justify-between flex-1">
                <div>
                  <h4 className="font-black text-white text-base leading-snug group-hover:text-orange-400 transition-colors">{workout.title}</h4>
                  <div className="flex flex-wrap gap-2 mt-2">
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-semibold">{workout.level}</span>
                    <span className="text-[10px] text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full font-semibold">⏱️ {workout.duration}</span>
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-bold tracking-widest uppercase mt-4 block group-hover:text-orange-400 transition-colors">GÖRÜNTÜLE & BAŞLA</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. SEKTÖR: Keşfet */}
      <div>
        <h4 className="text-xs font-black tracking-widest text-slate-400 mb-4 uppercase">DENEYİMİ KEŞFEDİN</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: "UZMANLARI KEŞFET", desc: "Abonelik alıp özel program yazdırmak için yüzlerce antrenörü keşfet.", bg: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=400" },
            { title: "GRUP DERSLERİ", desc: "Online canlı veya video destekli topluluk derslerine katılın.", bg: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=400" },
            { title: "AKSESUAR & EKİPMAN", desc: "Evde antrenman yapanlar için direnç bantları ve dambıllar.", bg: "https://fidrop.com.tr/fi-cont-fi/uploads/2025/02/3D-Baski-ile-Kisisel-Spor-Ekipmani-Tasarla-Performans-ve-Ergonomi-fidrop.webp" }
          ].map((item, idx) => (
            <div key={idx} className="relative rounded-3xl overflow-hidden aspect-[4/3] group cursor-pointer border border-slate-800/80 hover:border-slate-700 transition-all duration-300">
              <img src={item.bg} alt={item.title} className="absolute inset-0 w-full h-full object-cover brightness-[0.35] group-hover:scale-105 transition-transform duration-500" />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent" />
              <div className="absolute bottom-6 left-6 right-6">
                <h5 className="font-black text-base text-white tracking-wider">{item.title}</h5>
                <p className="text-[10px] text-slate-400 mt-1.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}