export const PRESET_WORKOUTS = [
  // ============================================================
  // --- DÖVÜŞ SPORLARI AKTİVİTELERİ ---
  // ============================================================
  {
    id: "kickboks-guc",
    category: "combat",
    title: "Kickboks Güç Antrenmanı",
    description: "Alt ve üst vücut koordinasyonunu artıran, patlayıcı güç odaklı teknik tekme ve yumruk serileri.",
    level: "İleri",
    duration: 45,
    calories: 620,
    image: "https://images.unsplash.com/photo-1549719386-74dfcbf7dbed?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "kb-1",
        name: "Jab - Cross - Sol Low Kick",
        sets: "4 Round",
        reps: "3 Dakika",
        video_url: "https://www.youtube.com/watch?v=k238mI6I01s",
        instructions: "Çene kapalı, gardını düşürmeden kombinasyonu patlayıcı şekilde uygula."
      },
      {
        id: "kb-2",
        name: "Sol Hook - Sağ Cross - Sol Middle Kick",
        sets: "4 Round",
        reps: "3 Dakika",
        video_url: "https://www.youtube.com/watch?v=k238mI6I01s",
        instructions: "Kalça rotasyonunu tamamlayarak tekmeye ivme kazandır."
      },
      {
        id: "kb-3",
        name: "Burpee + Gölge Boksu",
        sets: "3 Set",
        reps: "15 Tekrar",
        video_url: "https://www.youtube.com/watch?v=auBLPXO8F6U",
        instructions: "Burpee sonrası kalkar kalkmaz 4'lü hızlı yumruk kombinasyonu at."
      }
    ]
  },

  {
    id: "boks-temelleri",
    category: "combat",
    title: "Boks Temelleri & Kondisyon",
    description: "Gölge boksu, gard alma ve yüksek tempolu kardiyovasküler boks kombinasyonları.",
    level: "Orta",
    duration: 35,
    calories: 480,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "bk-1",
        name: "Temel Gard ve Adımlama (Footwork)",
        sets: "3 Round",
        reps: "3 Dakika",
        video_url: "https://www.youtube.com/watch?v=k238mI6I01s",
        instructions: "Dengeni bozmadan öne, arkaya ve yana adımlamalar yap."
      },
      {
        id: "bk-2",
        name: "Jab - Cross - Slip - Cross",
        sets: "4 Round",
        reps: "3 Dakika",
        video_url: "https://www.youtube.com/watch?v=k238mI6I01s",
        instructions: "Kombinasyon ortasında başını hayali yumruktan kaçır (slip)."
      }
    ]
  },

  // ============================================================
  // --- ESNETME & MOBİLİTE REHBERİ ---
  // ============================================================
  {
    id: "tum-vucut-esnetme",
    category: "stretching",
    title: "Tüm Vücut Esnetme & Mobilite",
    description: "Eklemleri rahatlatan, kas boyunu uzatan ve antrenman sonrası toparlanmayı destekleyen rutin.",
    level: "Her Seviye",
    duration: 20,
    calories: 120,
    image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "st-1",
        name: "Cat-Cow Pozisyonu",
        sets: "3 Set",
        reps: "12 Tekrar",
        video_url: "https://www.youtube.com/watch?v=v7SN-d4qXx0",
        instructions: "Nefes alırken belini kontrollü şekilde aç, nefes verirken sırtını yuvarla."
      },
      {
        id: "st-2",
        name: "Cobra Stretch (Karın ve Bel Açma)",
        sets: "3 Set",
        reps: "45 Saniye",
        video_url: "https://www.youtube.com/watch?v=v7SN-d4qXx0",
        instructions: "Kalçayı mümkün olduğunca rahat bırakıp göğüs kafesini kontrollü şekilde aç."
      }
    ]
  },

  {
    id: "statik-post-workout",
    category: "stretching",
    title: "Statik Post-Workout Recovery",
    description: "Ağır bacak antrenmanları sonrasında ana kas gruplarına yönelik düşük yoğunluklu statik esneme rutini.",
    level: "Başlangıç",
    duration: 15,
    calories: 80,
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "rec-1",
        name: "Hamstring Öne Eğilme Esnemesi",
        sets: "2 Set",
        reps: "60 Saniye",
        video_url: "https://www.youtube.com/watch?v=v7SN-d4qXx0",
        instructions: "Dizleri kilitlemeden gövdeni kontrollü şekilde bacaklara doğru yaklaştır."
      }
    ]
  },

  // ============================================================
  // --- 1. GÖĞÜS HACİM ANTRENMANI ---
  // ============================================================
  {
    id: "gogus-hacim",
    category: "strength",
    title: "Göğüs Kası Hacim Antrenmanı",
    description: "Göğüs kaslarının genel gelişimine odaklanan, ağır press hareketleri ile kontrollü izolasyon çalışmalarını birleştiren hipertrofi programı.",
    level: "Orta",
    duration: 55,
    calories: 430,
    image: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "chest-1",
        name: "Barbell Bench Press",
        sets: "4 Set",
        reps: "6-8 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=barbell+bench+press+proper+form",
        instructions: "Kürek kemiklerini geriye ve aşağıya sabitle. Ayakları zemine sağlam bas. Barı kontrollü indir ve göğüs hizasından güçlü şekilde yukarı it."
      },
      {
        id: "chest-2",
        name: "Incline Dumbbell Press",
        sets: "3 Set",
        reps: "8-10 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=incline+dumbbell+press+proper+form",
        instructions: "Bench açısını yaklaşık 30-45 derece civarında tut. Dirsekleri omuz hizasının çok dışına açmadan dumbbell'ları kontrollü indir."
      },
      {
        id: "chest-3",
        name: "Machine Chest Press",
        sets: "3 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=machine+chest+press+proper+form",
        instructions: "Koltuk yüksekliğini tutacaklar orta göğüs hizasına gelecek şekilde ayarla. Her tekrarda kontrollü eksantrik faz uygula."
      },
      {
        id: "chest-4",
        name: "Cable Chest Fly",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=cable+chest+fly+proper+form",
        instructions: "Dirsekleri hafif bükülü tut. Kolları önde birleştirirken göğüs kasını sık, dönüşte ağırlığın kontrolünü kaybetme."
      },
      {
        id: "chest-5",
        name: "Push-Up Finisher",
        sets: "2 Set",
        reps: "Maksimum kontrollü tekrar",
        video_url: "https://www.youtube.com/results?search_query=push+up+proper+form",
        instructions: "Vücudu baştan topuğa kadar düz tut. Belin çökmesine izin vermeden göğsünü zemine kontrollü şekilde yaklaştır."
      }
    ]
  },

  // ============================================================
  // --- 2. SIKI & GÜÇLÜ KALÇA ---
  // ============================================================
  {
    id: "kalca-sekillendirme",
    category: "legs",
    title: "Daha Güçlü ve Şekilli Kalçalar",
    description: "Gluteus maximus, gluteus medius ve arka bacak kaslarını birlikte çalıştıran alt vücut hipertrofi programı.",
    level: "Orta",
    duration: 55,
    calories: 460,
    image: "https://images.unsplash.com/photo-1517964603305-11c0f6f66012?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "glute-1",
        name: "Barbell Hip Thrust",
        sets: "4 Set",
        reps: "8-10 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=barbell+hip+thrust+proper+form",
        instructions: "Kürek kemiklerinin alt kısmını bench'e yerleştir. Yukarıda kalçayı sık ve kaburgaları aşırı yukarı kaldırmadan pelvisini kontrol et."
      },
      {
        id: "glute-2",
        name: "Bulgarian Split Squat",
        sets: "3 Set",
        reps: "8-10 Tekrar / Bacak",
        video_url: "https://www.youtube.com/watch?v=3ttYrZNeUIs",
        instructions: "Ön ayağı sabit tut. Gövdeyi hafif öne eğerek kontrollü şekilde aşağı in ve ön bacak ile kalçadan kuvvet alarak yüksel."
      },
      {
        id: "glute-3",
        name: "Romanian Deadlift",
        sets: "3 Set",
        reps: "8-10 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=romanian+deadlift+proper+form",
        instructions: "Dizleri hafif bükülü tut. Kalçayı geriye göndererek barı bacaklara yakın indir. Belini nötr pozisyonda koru."
      },
      {
        id: "glute-4",
        name: "Cable Glute Kickback",
        sets: "3 Set",
        reps: "12-15 Tekrar / Bacak",
        video_url: "https://www.youtube.com/results?search_query=cable+glute+kickback+proper+form",
        instructions: "Bacağı geriye savurmak yerine kalça ekleminden kontrollü olarak uzat. Belini aşırı çukurlaştırma."
      },
      {
        id: "glute-5",
        name: "Seated Hip Abduction",
        sets: "3 Set",
        reps: "15-20 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=seated+hip+abduction+proper+form",
        instructions: "Gövdeyi sabit tut. Dizleri kontrollü şekilde dışarı aç ve başlangıç pozisyonuna yavaşça dön."
      }
    ]
  },

  // ============================================================
  // --- 3. YAKICI KARIN ANTRENMANI ---
  // ============================================================
  {
    id: "yakici-karin",
    category: "core",
    title: "Yakıcı Karın & Core Antrenmanı",
    description: "Karın ön duvarı, oblikler ve derin core kaslarını hedefleyen ekipmansız kondisyon ve kuvvet rutini.",
    level: "Orta",
    duration: 25,
    calories: 190,
    image: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "abs-1",
        name: "Dead Bug",
        sets: "3 Set",
        reps: "10-12 Tekrar / Taraf",
        video_url: "https://www.youtube.com/results?search_query=dead+bug+exercise+proper+form",
        instructions: "Belini zemine kontrollü şekilde yakın tut. Karşı kol ve bacağı uzatırken gövdenin dönmesine izin verme."
      },
      {
        id: "abs-2",
        name: "Reverse Crunch",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=reverse+crunch+proper+form",
        instructions: "Hareketi momentumla değil pelvisin kontrollü hareketiyle yap. Kalçayı hafifçe yerden kaldırıp yavaşça indir."
      },
      {
        id: "abs-3",
        name: "Hanging Knee Raise",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=hanging+knee+raise+proper+form",
        instructions: "Vücudu sallamadan dizleri kontrollü şekilde göğse doğru çek. Aşağı inerken bacakları tamamen bırakma."
      },
      {
        id: "abs-4",
        name: "Cable Crunch",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=cable+crunch+proper+form",
        instructions: "Hareketi kalçadan değil omurganın kontrollü fleksiyonundan başlat. Karın kaslarını sıkıştırarak aşağı doğru kapan."
      },
      {
        id: "abs-5",
        name: "Plank",
        sets: "3 Set",
        reps: "40-60 Saniye",
        video_url: "https://www.youtube.com/results?search_query=plank+proper+form",
        instructions: "Dirsekleri omuzların altında tut. Kalçayı ne fazla kaldır ne de belin çökmesine izin ver."
      },
      {
        id: "abs-6",
        name: "Mountain Climber",
        sets: "3 Set",
        reps: "30-40 Saniye",
        video_url: "https://www.youtube.com/results?search_query=mountain+climber+proper+form",
        instructions: "Omuzları ellerin üzerinde sabit tut. Dizleri sırayla göğse çek ve hareket boyunca gövdeyi mümkün olduğunca sabit tut."
      }
    ]
  },

  // ============================================================
  // --- 4. ANTRENMAN ÖNCESİ ISINMA ---
  // ============================================================
  {
    id: "antrenman-oncesi-isinma",
    category: "warmup",
    title: "Antrenman Öncesi Dinamik Isınma",
    description: "Kuvvet veya kondisyon antrenmanı öncesinde vücudu kademeli olarak hazırlamak için düşük ve orta yoğunluklu dinamik ısınma rutini.",
    level: "Her Seviye",
    duration: 12,
    calories: 70,
    image: "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "warm-1",
        name: "Hafif Tempolu Yürüyüş / Jogging",
        sets: "1 Set",
        reps: "3 Dakika",
        video_url: "https://www.youtube.com/results?search_query=dynamic+warm+up+before+workout",
        instructions: "Yoğunluğu yavaşça artır. Amaç yorulmak değil vücut sıcaklığını kademeli olarak yükseltmektir."
      },
      {
        id: "warm-2",
        name: "Arm Circles",
        sets: "2 Set",
        reps: "15 Tekrar / Yön",
        video_url: "https://www.youtube.com/results?search_query=arm+circles+dynamic+warmup",
        instructions: "Kolları küçük dairelerden başlayarak kontrollü biçimde daha geniş dairelere taşı."
      },
      {
        id: "warm-3",
        name: "Bodyweight Squat",
        sets: "2 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=bodyweight+squat+proper+form",
        instructions: "Ayakları dengeli yerleştir. Dizlerin ayak yönünü takip etmesine dikkat ederek kontrollü squat yap."
      },
      {
        id: "warm-4",
        name: "Walking Lunge",
        sets: "2 Set",
        reps: "8-10 Tekrar / Bacak",
        video_url: "https://www.youtube.com/results?search_query=walking+lunge+proper+form",
        instructions: "Adımı kontrollü at ve ön dizin ayağın yönünü takip etmesine dikkat et."
      },
      {
        id: "warm-5",
        name: "Inchworm",
        sets: "2 Set",
        reps: "6-8 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=inchworm+exercise+proper+form",
        instructions: "Ellerle öne doğru yürü, plank pozisyonuna yaklaş ve ardından kontrollü şekilde ellerini tekrar ayaklara getir."
      },
      {
        id: "warm-6",
        name: "Hip 90/90 Rotation",
        sets: "2 Set",
        reps: "8 Tekrar / Taraf",
        video_url: "https://www.youtube.com/results?search_query=90+90+hip+rotation+mobility",
        instructions: "Kalça rotasyonunu kontrollü gerçekleştir. Harekette hız yerine eklem kontrolüne odaklan."
      }
    ]
  },

  // ============================================================
  // --- 5. GÜÇLÜ & ŞEKİLLİ KOLLAR - 1 ---
  // ============================================================
  {
    id: "guclu-kollar-1",
    category: "arms",
    title: "Güçlü ve Şekilli Kollar - 1",
    description: "Biceps ve triceps kaslarını temel bileşik ve izolasyon hareketleriyle geliştirmeye yönelik dengeli kol antrenmanı.",
    level: "Orta",
    duration: 45,
    calories: 320,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "arms1-1",
        name: "EZ Bar Curl",
        sets: "3 Set",
        reps: "8-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=EZ+bar+curl+proper+form",
        instructions: "Dirsekleri gövdeye yakın ve mümkün olduğunca sabit tut. Ağırlığı momentumla kaldırma."
      },
      {
        id: "arms1-2",
        name: "Incline Dumbbell Curl",
        sets: "3 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=incline+dumbbell+curl+proper+form",
        instructions: "Omuzları geriye al. Ağırlığı aşağı indirirken biceps üzerinde gerilimi koru."
      },
      {
        id: "arms1-3",
        name: "Cable Triceps Pushdown",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=cable+triceps+pushdown+proper+form",
        instructions: "Dirsekleri gövdenin yanında sabitle. Ön kolu aşağı doğru uzatırken omuzları öne düşürme."
      },
      {
        id: "arms1-4",
        name: "Overhead Cable Triceps Extension",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=overhead+cable+triceps+extension+proper+form",
        instructions: "Dirsekleri mümkün olduğunca sabit tutarak ön kolları kontrollü şekilde uzat."
      },
      {
        id: "arms1-5",
        name: "Hammer Curl",
        sets: "3 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=hammer+curl+proper+form",
        instructions: "Avuç içlerini birbirine bakacak şekilde tut. Dirsekleri öne kaçırmadan kontrollü tekrarlar yap."
      }
    ]
  },

  // ============================================================
  // --- 6. GÜÇLÜ & ŞEKİLLİ KOLLAR - 2 ---
  // ============================================================
  {
    id: "guclu-kollar-2",
    category: "arms",
    title: "Güçlü ve Şekilli Kollar - 2",
    description: "Biceps, triceps ve ön kol kaslarını farklı açılardan çalıştıran ikinci seviye kol hipertrofi programı.",
    level: "Orta",
    duration: 50,
    calories: 350,
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "arms2-1",
        name: "Close-Grip Bench Press",
        sets: "3 Set",
        reps: "6-10 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=close+grip+bench+press+proper+form",
        instructions: "Eller omuzlardan biraz daha dar konumda olabilir. Dirsekleri kontrollü biçimde gövdeye yakın tut."
      },
      {
        id: "arms2-2",
        name: "Preacher Curl",
        sets: "3 Set",
        reps: "8-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=preacher+curl+proper+form",
        instructions: "Kolun alt kısmını pad üzerinde sabit tut. Alt noktada dirseği agresif şekilde kilitlemeden kontrollü hareket et."
      },
      {
        id: "arms2-3",
        name: "Rope Triceps Pushdown",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=rope+triceps+pushdown+proper+form",
        instructions: "Hareketin sonunda ipi hafifçe iki yana ayırırken dirsekleri sabit tut."
      },
      {
        id: "arms2-4",
        name: "Bayesian Cable Curl",
        sets: "3 Set",
        reps: "10-15 Tekrar / Kol",
        video_url: "https://www.youtube.com/results?search_query=Bayesian+cable+curl+proper+form",
        instructions: "Kabloyu vücudun arkasından al. Omuzu ileri çekmeden dirsekten kontrollü biceps curl yap."
      },
      {
        id: "arms2-5",
        name: "Reverse Curl",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=reverse+curl+proper+form",
        instructions: "Avuç içlerini aşağı bakacak şekilde tut. Bilekleri nötr pozisyonda koruyarak kontrollü kaldır."
      },
      {
        id: "arms2-6",
        name: "Cable Triceps Kickback",
        sets: "2 Set",
        reps: "12-15 Tekrar / Kol",
        video_url: "https://www.youtube.com/results?search_query=cable+triceps+kickback+proper+form",
        instructions: "Üst kolu gövdeye göre sabit tut. Dirsekten açılma hareketini kontrollü gerçekleştir."
      }
    ]
  },

  // ============================================================
  // --- 7. SUPERMAN SIRT ANTRENMANI ---
  // ============================================================
  {
    id: "superman-sirt",
    category: "back",
    title: "Superman Sırt Antrenmanı",
    description: "Lat, orta sırt, trapez ve arka omuzları hedefleyen genişlik ve kalınlık odaklı sırt programı.",
    level: "Orta",
    duration: 55,
    calories: 410,
    image: "https://images.unsplash.com/photo-1603287681836-b174ce5074c2?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "back-1",
        name: "Lat Pulldown",
        sets: "4 Set",
        reps: "8-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=lat+pulldown+proper+form",
        instructions: "Göğsü hafifçe yukarıda tut. Barı boynun arkasına değil üst göğüs bölgesine doğru çek."
      },
      {
        id: "back-2",
        name: "Seated Cable Row",
        sets: "3 Set",
        reps: "8-12 Tekrar",
        video_url: "https://www.youtube.com/watch?v=xQNrFHEMhI4",
        instructions: "Gövdeyi sürekli öne-arkaya sallamadan dirsekleri geriye doğru çek. Hareket sonunda sırtı kontrollü sık."
      },
      {
        id: "back-3",
        name: "Chest-Supported Dumbbell Row",
        sets: "3 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=chest+supported+dumbbell+row+proper+form",
        instructions: "Göğsü bench'e sabitle. Dumbbell'ları dirsekleri geriye çekerek kaldır ve kontrollü indir."
      },
      {
        id: "back-4",
        name: "Single Arm Cable Row",
        sets: "3 Set",
        reps: "10-12 Tekrar / Kol",
        video_url: "https://www.youtube.com/results?search_query=single+arm+cable+row+proper+form",
        instructions: "Omuzu öne düşürmeden dirseği kalçaya doğru çek. Gövde rotasyonunu minimumda tut."
      },
      {
        id: "back-5",
        name: "Face Pull",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=face+pull+proper+form",
        instructions: "Halatı yüz hizasına doğru çek. Dirsekleri dışarı alırken omuzları yukarı kaldırma."
      },
      {
        id: "back-6",
        name: "Back Extension",
        sets: "2 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=back+extension+proper+form",
        instructions: "Hareketi belden aşırı geriye kırılmadan, kalça ve sırt ekstansiyonunu kontrollü kullanarak tamamla."
      }
    ]
  },

  // ============================================================
  // --- 8. OMUZ 3D GÖRÜNÜM ---
  // ============================================================
  {
    id: "omuz-3d",
    category: "shoulders",
    title: "3D Omuz & Üst Vücut Antrenmanı",
    description: "Ön, yan ve arka omuz başlarını farklı hareketlerle çalıştıran dengeli omuz hipertrofi programı.",
    level: "Orta",
    duration: 50,
    calories: 330,
    image: "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "shoulder-1",
        name: "Seated Dumbbell Shoulder Press",
        sets: "4 Set",
        reps: "6-10 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=seated+dumbbell+shoulder+press+proper+form",
        instructions: "Sırtı bench'e destekle. Dumbbell'ları kontrollü indirip omuzlardan güçlü şekilde yukarı it."
      },
      {
        id: "shoulder-2",
        name: "Dumbbell Lateral Raise",
        sets: "4 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=dumbbell+lateral+raise+proper+form",
        instructions: "Dirsekleri hafif bükülü tut. Ağırlığı savurmadan kolları kontrollü biçimde yana kaldır."
      },
      {
        id: "shoulder-3",
        name: "Reverse Pec Deck",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=reverse+pec+deck+proper+form",
        instructions: "Hareketi arka omuzlarla başlat. Ağırlığı kontrol ederek kolları geriye aç."
      },
      {
        id: "shoulder-4",
        name: "Cable Lateral Raise",
        sets: "3 Set",
        reps: "12-15 Tekrar / Kol",
        video_url: "https://www.youtube.com/results?search_query=cable+lateral+raise+proper+form",
        instructions: "Kabloyu gövdenin arkasından veya yanından alarak omuz hizasına kadar kontrollü kaldır."
      },
      {
        id: "shoulder-5",
        name: "Cable Face Pull",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=cable+face+pull+proper+form",
        instructions: "Halatı yüz hizasına çek. Arka omuzları ve üst sırtı kullanırken boynu sıkma."
      }
    ]
  },

  // ============================================================
  // --- 9. GÜÇLÜ BACAKLAR ---
  // ============================================================
  {
    id: "guclu-bacaklar",
    category: "legs",
    title: "Güçlü ve Atletik Bacaklar",
    description: "Quadriceps, hamstring, glute ve baldır kaslarını birlikte çalıştıran temel alt vücut kuvvet ve hipertrofi programı.",
    level: "Orta",
    duration: 60,
    calories: 500,
    image: "https://images.unsplash.com/photo-1434596922112-19c563067271?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "legs-1",
        name: "Barbell Back Squat",
        sets: "4 Set",
        reps: "6-8 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=barbell+back+squat+proper+form",
        instructions: "Barı sırtında dengeli konumlandır. Kontrollü şekilde aşağı in ve ayağın tamamından kuvvet alarak yüksel."
      },
      {
        id: "legs-2",
        name: "Leg Press",
        sets: "3 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=leg+press+proper+form",
        instructions: "Bel ve kalçayı pedden ayırmadan kontrollü derinliğe in. Dizleri üst noktada agresif şekilde kilitleme."
      },
      {
        id: "legs-3",
        name: "Romanian Deadlift",
        sets: "3 Set",
        reps: "8-10 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=romanian+deadlift+proper+form",
        instructions: "Kalçayı geriye göndererek hamstring gerilimini artır. Barı bacaklara yakın tut ve omurgayı nötr koru."
      },
      {
        id: "legs-4",
        name: "Leg Curl",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=leg+curl+proper+form",
        instructions: "Pelvisi ped üzerinde sabit tut. Topukları kalçaya doğru kontrollü çek ve yavaşça geri bırak."
      },
      {
        id: "legs-5",
        name: "Leg Extension",
        sets: "3 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=leg+extension+proper+form",
        instructions: "Diz eklemini makinenin dönme ekseniyle hizala. Ağırlığı savurmadan kontrollü şekilde uzat."
      },
      {
        id: "legs-6",
        name: "Standing Calf Raise",
        sets: "4 Set",
        reps: "10-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=standing+calf+raise+proper+form",
        instructions: "Topukları kontrollü şekilde aşağı indirip ayak parmaklarından yüksel. Hareket açıklığını mümkün olduğunca kontrollü kullan."
      }
    ]
  },

  // ============================================================
  // --- 10. FULL BODY ATHLETIC ---
  // ============================================================
  {
    id: "full-body-athletic",
    category: "fullbody",
    title: "Full Body Athletic Performance",
    description: "Kuvvet, kondisyon, koordinasyon ve temel atletik hareket kapasitesini aynı seansta geliştirmeye yönelik tam vücut programı.",
    level: "Orta",
    duration: 50,
    calories: 480,
    image: "https://images.unsplash.com/photo-1538805060514-97d9cc17730c?q=80&w=1000&auto=format&fit=crop",
    exercises: [
      {
        id: "athletic-1",
        name: "Goblet Squat",
        sets: "3 Set",
        reps: "10-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=goblet+squat+proper+form",
        instructions: "Dumbbell veya kettlebell'i göğüs hizasında tut. Kontrollü squat yap ve gövdeyi dengeli tut."
      },
      {
        id: "athletic-2",
        name: "Dumbbell Romanian Deadlift",
        sets: "3 Set",
        reps: "8-12 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=dumbbell+romanian+deadlift+proper+form",
        instructions: "Kalçayı geriye gönder. Dumbbell'ları bacaklara yakın tutarak hamstring gerilimini kontrollü oluştur."
      },
      {
        id: "athletic-3",
        name: "Push-Up",
        sets: "3 Set",
        reps: "10-20 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=push+up+proper+form",
        instructions: "Baş, gövde ve kalçayı aynı hizada tut. Göğsü kontrollü indir ve zemini iterek başlangıç pozisyonuna dön."
      },
      {
        id: "athletic-4",
        name: "Single Arm Dumbbell Row",
        sets: "3 Set",
        reps: "10-12 Tekrar / Kol",
        video_url: "https://www.youtube.com/results?search_query=single+arm+dumbbell+row+proper+form",
        instructions: "Destek noktasını kullanarak gövdeyi sabitle. Dirseği geriye ve hafifçe kalçaya doğru çek."
      },
      {
        id: "athletic-5",
        name: "Kettlebell Swing",
        sets: "3 Set",
        reps: "12-15 Tekrar",
        video_url: "https://www.youtube.com/results?search_query=kettlebell+swing+proper+form",
        instructions: "Hareketi squat gibi değil kalça hinge'i olarak düşün. Kettlebell'i kollarla kaldırmak yerine kalça patlayıcılığıyla öne gönder."
      },
      {
        id: "athletic-6",
        name: "Farmer's Walk",
        sets: "3 Set",
        reps: "30-40 Saniye",
        video_url: "https://www.youtube.com/results?search_query=farmers+walk+proper+form",
        instructions: "Ağırlıkları iki elde dengeli taşı. Göğsü açık, omuzları aşağıda ve yürüyüşü kontrollü tut."
      },
      {
        id: "athletic-7",
        name: "Plank",
        sets: "3 Set",
        reps: "30-45 Saniye",
        video_url: "https://www.youtube.com/results?search_query=plank+proper+form",
        instructions: "Core'u aktif tut. Kalçanın yukarı kaçmasına veya belin aşağı çökmesine izin verme."
      }
    ]
  }
];