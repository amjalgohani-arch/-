import React, { useState, useRef, useEffect } from "react";
import { 
  schoolAchievements, 
  schedulePeriods, 
  groundFloorRooms, 
  firstFloorRooms, 
  secondFloorRooms, 
  schoolFaq,
  schoolStaffMembers
} from "./data";
import { RoomInfo, Period, SchoolEvent, StaffMember, AppTheme } from "./types";
import StaffDirectory from "./components/StaffDirectory";
import { 
  Building2, 
  Map as MapIcon, 
  Calendar, 
  Award, 
  HelpCircle, 
  MessageSquare, 
  Volume2, 
  VolumeX, 
  Search, 
  Navigation, 
  Languages, 
  ChevronDown, 
  Mic, 
  ArrowLeft, 
  ArrowRight,
  Sparkles,
  School,
  Clock,
  MapPin,
  Compass,
  Users,
  Palette
} from "lucide-react";

export default function App() {
  const [lang, setLang] = useState<"ar" | "en">("ar");
  const [activeTab, setActiveTab] = useState<"chat" | "schedule" | "map" | "achievements" | "faq" | "events" | "staff">("chat");
  const [selectedFloor, setSelectedFloor] = useState<0 | 1 | 2>(0);
  const [selectedRoom, setSelectedRoom] = useState<RoomInfo | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [messages, setMessages] = useState<{ role: "user" | "assistant"; text: string; isFallback?: boolean }[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [scheduleDay, setScheduleDay] = useState<"sun-mon" | "tue-thu">("sun-mon");
  const [searchFocused, setSearchFocused] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  // Theme state with localStorage persistence
  const [theme, setTheme] = useState<AppTheme>(() => {
    try {
      const savedTheme = localStorage.getItem("school_app_theme");
      if (savedTheme === "national_day" || savedTheme === "default") {
        return savedTheme as AppTheme;
      }
    } catch (e) {
      console.warn("Could not read theme from localStorage", e);
    }
    // Default to Saudi National Day celebratory theme
    return "national_day";
  });

  const handleThemeChange = (newTheme: AppTheme) => {
    setTheme(newTheme);
    try {
      localStorage.setItem("school_app_theme", newTheme);
    } catch (e) {
      console.warn("Could not save theme to localStorage", e);
    }
  };

  const themesConfig: Record<AppTheme, {
    id: AppTheme;
    nameAr: string;
    nameEn: string;
    bgClass: string;
    headerGradient: string;
    headerSubtitle: string;
    clockBanner: string;
    clockBannerBorder: string;
    clockIconBox: string;
    clockTextAccent: string;
    activeNavClass: string;
    navIconClass: string;
    sidebarCard: string;
    chatUserBubble: string;
    swatchBg: string;
    badgeTextAr?: string;
  }> = {
    national_day: {
      id: "national_day",
      nameAr: "اليوم الوطني 🇸🇦",
      nameEn: "National Day 🇸🇦",
      bgClass: "bg-emerald-950/[0.02] bg-gradient-to-b from-emerald-50/70 via-amber-50/20 to-slate-50",
      headerGradient: "bg-gradient-to-r from-[#00381b] via-[#006C35] to-[#014e26] border-b border-amber-400/30",
      headerSubtitle: "text-amber-300 font-semibold",
      clockBanner: "bg-gradient-to-r from-[#002b15] via-[#004e25] to-[#002b15]",
      clockBannerBorder: "border-amber-500/30",
      clockIconBox: "bg-amber-400/20 text-amber-300 border-amber-400/40 shadow-sm shadow-amber-400/20",
      clockTextAccent: "text-amber-300",
      activeNavClass: "bg-[#006C35] text-amber-200 shadow-md shadow-emerald-950/30 border border-amber-400/40 font-bold",
      navIconClass: "text-emerald-700",
      sidebarCard: "from-[#00381b] to-[#002411] border-amber-400/30",
      chatUserBubble: "bg-gradient-to-br from-[#006C35] to-[#004d25] border border-amber-400/25",
      swatchBg: "bg-[#006C35]",
      badgeTextAr: "عزنا بطبعنا 🇸🇦"
    },
    default: {
      id: "default",
      nameAr: "السمة الرسمية",
      nameEn: "Official Theme",
      bgClass: "bg-slate-50 bg-gradient-to-b from-slate-50 via-sky-50/20 to-slate-100/60",
      headerGradient: "bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900",
      headerSubtitle: "text-indigo-200",
      clockBanner: "bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900",
      clockBannerBorder: "border-indigo-900/40",
      clockIconBox: "bg-indigo-500/20 text-indigo-300 border-indigo-500/30",
      clockTextAccent: "text-indigo-300",
      activeNavClass: "bg-indigo-900 text-white shadow-md shadow-indigo-900/15",
      navIconClass: "text-indigo-500",
      sidebarCard: "from-indigo-950 to-slate-900 border-indigo-800",
      chatUserBubble: "bg-gradient-to-br from-blue-800 to-indigo-900",
      swatchBg: "bg-indigo-700",
      badgeTextAr: "المدرسة النموذجية"
    }
  };

  const currentTheme = themesConfig[theme] || themesConfig.national_day;

  // Time & Simulator States
  const [currentTime, setCurrentTime] = useState(new Date());
  const [simulatedTime, setSimulatedTime] = useState<string | null>(null);
  const [simulatedDay, setSimulatedDay] = useState<number | null>(null);

  // School Events List & Defaults
  const defaultEvents: SchoolEvent[] = [
    {
      id: "ev_national_day",
      title: "احتفالية اليوم الوطني السعودي ٩٤ (نحلم ونحقق)",
      time: "08:30 ص",
      date: "2026-09-23",
      location: "المسرح المدرسي والساحة الرئيسية (الدور الأرضي)",
      description: "برنامج احتفالي متكامل يضم فقرات وطنية، إلقاء شعري، مسيرة الراية الخضراء، معرض التراث والابتكار، وتكريم المشاركات."
    },
    {
      id: "ev1",
      title: "معرض العلوم والتقنية والابتكارات",
      time: "09:30 ص",
      date: "2026-06-15",
      location: "معمل الحاسب والفيزياء (الدور الأول والأرضي)",
      description: "معرض سنوي لعرض مشاريع الطالبات والابتكارات الرقمية والذكاء الاصطناعي في الثانوية الرابعة والثلاثون."
    },
    {
      id: "ev2",
      title: "الحفل الختامي وتكريم المتفوقات",
      time: "10:00 ص",
      date: "2026-06-22",
      location: "الساحة الخارجية والمقصف (الدور الأرضي)",
      description: "حفل تكريم الطالبات المتميزات والحاصلات على مراكز أولى وتتويج ريادة المدرسة بجائزة التميز سنتين متتاليتين."
    },
    {
      id: "ev3",
      title: "برنامج التوجيه المهني والجامعي للمسارات",
      time: "08:00 ص",
      date: "2026-06-18",
      location: "مصادر التعلم (الدور الأرضي)",
      description: "لقاء إرشادي موجه لطالبات الصف الثالث الثانوي لتعريفهم بمسارات القبول الجامعي والمهن المستقبلية الواعدة."
    }
  ];

  const [events, setEvents] = useState<SchoolEvent[]>(() => {
    try {
      const saved = localStorage.getItem("school_events_v2");
      if (saved) return JSON.parse(saved);
    } catch (e) {
      console.warn("Could not read school events from localStorage", e);
    }
    return defaultEvents;
  });

  // Save events in localStorage
  useEffect(() => {
    try {
      localStorage.setItem("school_events_v2", JSON.stringify(events));
    } catch (e) {
      console.warn("Could not save school events to localStorage", e);
    }
  }, [events]);

  // Expandable form state for adding new school events
  const [newEventTitle, setNewEventTitle] = useState("");
  const [newEventTime, setNewEventTime] = useState("");
  const [newEventDate, setNewEventDate] = useState("");
  const [newEventLocation, setNewEventLocation] = useState("");
  const [newEventDesc, setNewEventDesc] = useState("");
  const [isAddingEvent, setIsAddingEvent] = useState(false);

  // School Staff Directory State & LocalStorage (cleared legacy predefined mock staff)
  const [staffList, setStaffList] = useState<StaffMember[]>(() => {
    try {
      localStorage.removeItem("school_staff_custom_v1");
      const saved = localStorage.getItem("school_staff_directory_v2");
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn("Could not read staff from localStorage", e);
    }
    return schoolStaffMembers;
  });

  const handleAddStaff = (newStaff: StaffMember) => {
    setStaffList(prev => {
      const updated = [newStaff, ...prev];
      try {
        localStorage.setItem("school_staff_directory_v2", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not save staff to localStorage", e);
      }
      return updated;
    });
  };

  const handleDeleteStaff = (id: string) => {
    setStaffList(prev => {
      const updated = prev.filter(s => s.id !== id);
      try {
        localStorage.setItem("school_staff_directory_v2", JSON.stringify(updated));
      } catch (e) {
        console.warn("Could not delete staff from localStorage", e);
      }
      return updated;
    });
  };

  const handleClearAllStaff = () => {
    setStaffList([]);
    try {
      localStorage.setItem("school_staff_directory_v2", JSON.stringify([]));
      localStorage.removeItem("school_staff_custom_v1");
    } catch (e) {
      console.warn("Could not clear staff from localStorage", e);
    }
  };

  const handleLocateStaffRoom = (floor: 0 | 1 | 2, roomId?: string) => {
    setSelectedFloor(floor);
    if (roomId) {
      const rooms = floor === 0 ? groundFloorRooms : floor === 1 ? firstFloorRooms : secondFloorRooms;
      const found = rooms.find(r => r.id === roomId);
      if (found) {
        setSelectedRoom(found);
      }
    }
    setActiveTab("map");
  };

  const handleAskAboutStaff = (promptText: string) => {
    setActiveTab("chat");
    handleSendMessage(promptText);
  };

  // Tick clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const handleAddEvent = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventTitle.trim() || !newEventTime.trim() || !newEventDate.trim()) {
      return;
    }
    const added: SchoolEvent = {
      id: "ev_" + Date.now(),
      title: newEventTitle.trim(),
      time: newEventTime.trim(),
      date: newEventDate.trim(),
      location: newEventLocation.trim() || undefined,
      description: newEventDesc.trim() || undefined
    };
    setEvents(prev => [added, ...prev]);
    
    // Clear state fields
    setNewEventTitle("");
    setNewEventTime("");
    setNewEventDate("");
    setNewEventLocation("");
    setNewEventDesc("");
    setIsAddingEvent(false);
  };

  const handleDeleteEvent = (id: string) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const getPeriodStatus = () => {
    const targetDate = currentTime;
    const currentDayOfWeek = simulatedDay !== null ? simulatedDay : targetDate.getDay(); 
    
    let currentHour = targetDate.getHours();
    let currentMinute = targetDate.getMinutes();
    
    if (simulatedTime) {
      const [h, m] = simulatedTime.split(":").map(Number);
      if (!isNaN(h) && !isNaN(m)) {
        currentHour = h;
        currentMinute = m;
      }
    }
    
    const minutesSinceMidnight = currentHour * 60 + currentMinute;
    const isWeekend = currentDayOfWeek === 5 || currentDayOfWeek === 6;
    const activeScheduleDay = (currentDayOfWeek === 0 || currentDayOfWeek === 1) ? "sun-mon" : "tue-thu";
    
    if (isWeekend) {
      return {
        labelAr: "إجازة نهاية الأسبوع السعيدة ☀️ (لا توجد حصص نشطة اليوم)",
        labelEn: "Happy Weekend Break ☀️ (No active classes today)",
        isActive: false,
        period: null,
        statusType: "weekend"
      };
    }
    
    const dayPeriods = schedulePeriods.filter(p => p.days === "all" || p.days === activeScheduleDay);
    
    let activePeriod = null;
    for (const p of dayPeriods) {
      const [startH, startM] = p.start.split(":").map(Number);
      const [endH, endM] = p.end.split(":").map(Number);
      const startMin = startH * 60 + startM;
      const endMin = endH * 60 + endM;
      
      if (minutesSinceMidnight >= startMin && minutesSinceMidnight < endMin) {
        activePeriod = p;
        break;
      }
    }
    
    if (activePeriod) {
      const [endH, endM] = activePeriod.end.split(":").map(Number);
      const endMin = endH * 60 + endM;
      const minutesRemaining = endMin - minutesSinceMidnight;
      
      return {
        labelAr: `الآن: ${activePeriod.nameAr} 🔔 (متبقي ${minutesRemaining} دقيقة على نهايتها)`,
        labelEn: `Right Now: ${activePeriod.nameEn} 🔔 (${minutesRemaining} mins remaining)`,
        isActive: true,
        period: activePeriod,
        statusType: "active"
      };
    }
    
    const firstPeriod = dayPeriods[0];
    const lastPeriod = dayPeriods[dayPeriods.length - 1];
    
    const [firstH, firstM] = firstPeriod.start.split(":").map(Number);
    const firstMin = firstH * 60 + firstM;
    
    const [lastH, lastM] = lastPeriod.end.split(":").map(Number);
    const lastMin = lastH * 60 + lastM;
    
    if (minutesSinceMidnight < firstMin) {
      return {
        labelAr: `اليوم الدراسي لم يبدأ بعد 🌅 يبدأ الطابور الصباحي الساعة ${firstPeriod.start}`,
        labelEn: `School day hasn't started yet 🌅 Morning Assembly starts at ${firstPeriod.start}`,
        isActive: false,
        period: null,
        statusType: "before"
      };
    } else {
      return {
        labelAr: "انتهى اليوم الدراسي لهذه الليلة ✨ نراكم غداً متفوقات وبصحة جيدة!",
        labelEn: "School day has successfully concluded for today! ✨ See you tomorrow!",
        isActive: false,
        period: null,
        statusType: "after"
      };
    }
  };

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const isAr = lang === "ar";

  // Auto-detect Sunday/Monday vs other days
  useEffect(() => {
    const day = new Date().getDay(); // 0 is Sunday, 1 is Monday, 2 is Tuesday, etc.
    if (day === 0 || day === 1) {
      setScheduleDay("sun-mon");
    } else {
      setScheduleDay("tue-thu");
    }
  }, []);

  // Initialize welcome message
  useEffect(() => {
    setMessages([
      {
        role: "assistant",
        text: isAr
          ? "مرحباً بكِ في الثانوية الرابعة والثلاثون بجدة 🎓\nأنا مساعدكِ الذكي \"مضياف\"، للتوجيه والإرشاد اليومي. كيف أستطيع خدمتكِ اليوم؟\n\nامسحي الرمز أو اطرحي سؤالًا سريعًا، أو تصفحي الخريطة التفاعلية وجدول الحصص بالتبويبات المجاورة!"
          : "Welcome to Al-Thanawiya 34 School in Jeddah 🎓\nI am Mudhiyaf, your AI assistant for virtual navigation, daily schedules, and guidance. How can I help you today?"
      }
    ]);
  }, [lang]);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Text-To-Speech function
  const speakResponse = (text: string) => {
    if (!soundEnabled) return;
    try {
      window.speechSynthesis.cancel();
      const cleanText = text.replace(/[*#_`]/g, ""); // remove markdown artifacts
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = isAr ? "ar-SA" : "en-US";
      utterance.rate = 1.0;
      window.speechSynthesis.speak(utterance);
    } catch (e) {
      console.warn("TTS is not supported or failed:", e);
    }
  };

  // Voice Speech Recognition (STT) function
  const toggleListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(isAr ? "عذراً، متصفحك لا يدعم التعرف على الصوت الرقمي حالياً." : "Speech recognition is not supported on your browser.");
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsListening(false);
    } else {
      try {
        const rec = new SpeechRecognition();
        rec.continuous = false;
        rec.interimResults = false;
        rec.lang = isAr ? "ar-SA" : "en-US";

        rec.onstart = () => {
          setIsListening(true);
        };

        rec.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (transcript) {
            setChatInput(transcript);
          }
        };

        rec.onerror = (e: any) => {
          console.error("Speech Recognition Error:", e);
          setIsListening(false);
        };

        rec.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current = rec;
        rec.start();
      } catch (err) {
        console.error("Failed to start speech recognition:", err);
        setIsListening(false);
      }
    }
  };

  // Chat message sender
  const handleSendMessage = async (textToSend: string) => {
    const trimmed = textToSend.trim();
    if (!trimmed || isChatLoading) return;

    setMessages(prev => [...prev, { role: "user", text: trimmed }]);
    setChatInput("");
    setIsChatLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, { role: "user", text: trimmed }].map(m => ({
            role: m.role,
            text: m.text
          })),
          lang: lang,
          events: events,
          staff: staffList
        })
      });

      if (!response.ok) {
        throw new Error("Server error or missing integration configuration.");
      }

      const data = await response.json();
      setMessages(prev => [...prev, { role: "assistant", text: data.text, isFallback: data.fallback }]);
      speakResponse(data.text);
    } catch (err: any) {
      console.error(err);
      const errText = isAr 
        ? "عذراً، المساعد الذكي يواجه ضغطاً مؤقتاً. يمكنك الاستفسار عن طريق الأسئلة الجاهزة الموضحة بأسفل الشاشة."
        : "Sorry, the AI assistant is experiencing high volume. You can use search and pre-loaded FAQ below.";
      setMessages(prev => [...prev, { role: "assistant", text: errText }]);
    } finally {
      setIsChatLoading(false);
    }
  };

  // Quick Questions
  const quickQuestions = isAr ? [
    ...(theme === "national_day" ? [
      { label: "🇸🇦 احتفالية اليوم الوطني ٩٤", query: "ما هي فعاليات وبرامج احتفالية اليوم الوطني السعودي ٩٤ في الثانوية الرابعة والثلاثون؟" },
      { label: "🇸🇦 النشيد الوطني السعودي", query: "ما هي كلمات النشيد الوطني السعودي وكيف نحتفي بالوطن؟" }
    ] : []),
    { label: "👩‍🏫 منسوبات ومعلمات المدرسة", query: "من هن منسوبات ومعلمات وإداريات مدرسة الثانوية الرابعة والثلاثون؟" },
    { label: "🚩 الطابور والجدول المطور", query: "ما هو توقيت الطابور الصباحي والحصص الجديد مدرسة ٣٤؟" },
    { label: "🏆 جوائز وإنجازات المدرسة", query: "ماذا حققت مدرسة الثانوية الرابعة والثلاثون في ٢٠٢٤ و ٢٠٢٥؟" },
    { label: "🏫 أين يقع مكتب المديرة والمصادر؟", query: "أين تقع مكاتب الإدارة ومكتب المديرة ومصادر التعلم في الدور الأرضي؟" },
    { label: "🔬 معامل الفيزياء والأحياء والحاسب", query: "أين أجد المعامل العلمية (فيزياء، أحياء، حاسب) في المدرسة؟" },
    { label: "🚻 دورات مياه الطالبات والدمج", query: "أين تقع دورات مياه الطالبات وفصول الدمج في المدرسة والممرات؟" }
  ] : [
    ...(theme === "national_day" ? [
      { label: "🇸🇦 94th National Day Events", query: "What are the 94th Saudi National Day celebration events at Al-Thanawiya 34 School?" },
      { label: "🇸🇦 National Anthem", query: "What is the Saudi National Anthem?" }
    ] : []),
    { label: "👩‍🏫 Staff Directory", query: "Who are the staff members and teachers at Al-Thanawiya 34?" },
    { label: "🚩 Assembly & Schedule", query: "What is the morning queue and daily schedules timeline?" },
    { label: "🏆 School Achievements", query: "What awards did Al-Thanawiya 34 win in 2024 and 2025?" },
    { label: "🏫 Principal & Sources", query: "Where is the principal's cabinet and learning resources lab?" },
    { label: "🔬 Science & Computer Labs", query: "Where are physics, biology, and computer laboratories located?" }
  ];

  // Selected floor rooms getter
  const getFloorRooms = (floor: 0 | 1 | 2): RoomInfo[] => {
    if (floor === 0) return groundFloorRooms;
    if (floor === 1) return firstFloorRooms;
    return secondFloorRooms;
  };

  const getCategoryColor = (category: RoomInfo["category"], isSelected: boolean) => {
    if (isSelected) return "fill-indigo-600 stroke-indigo-900 stroke-[3]";
    switch (category) {
      case "admin": return "fill-amber-100 hover:fill-amber-200 stroke-amber-500 stroke-[1.5]";
      case "class": return "fill-sky-100 hover:fill-sky-200 stroke-sky-400 stroke-[1.5]";
      case "lab": return "fill-emerald-100 hover:fill-emerald-200 stroke-emerald-500 stroke-[1.5]";
      case "yard": return "fill-teal-50 hover:fill-teal-100 stroke-teal-500 stroke-[1.5]";
      case "facility": return "fill-purple-100 hover:fill-purple-200 stroke-purple-400 stroke-[1.5]";
      case "stair": return "fill-rose-100 hover:fill-rose-200 stroke-rose-400 stroke-[1.5]";
      default: return "fill-slate-100 hover:fill-slate-200 stroke-slate-400 stroke-[1.5]";
    }
  };

  const currentFloorRooms = getFloorRooms(selectedFloor);
  const filteredRooms = searchQuery.trim() === "" 
    ? [] 
    : currentFloorRooms.filter(r => 
        (isAr ? r.nameAr : r.nameEn).toLowerCase().includes(searchQuery.toLowerCase()) ||
        (isAr ? r.descriptionAr : r.descriptionEn).toLowerCase().includes(searchQuery.toLowerCase())
      );

  return (
    <div className={`min-h-screen ${currentTheme.bgClass} text-slate-800 font-sans antialiased flex flex-col transition-colors duration-300`} dir={isAr ? "rtl" : "ltr"}>
      {/* APP TOP PANEL */}
      <header className={`${currentTheme.headerGradient} text-white shadow-md sticky top-0 z-50 transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto px-4 py-3 sm:px-6 lg:px-8 flex justify-between items-center gap-2">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center border border-white/25 shadow-inner overflow-hidden p-0.5 flex-shrink-0">
              <img src="/icon.png" alt="School Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="flex flex-col gap-0.5">
              <span className={`text-[11px] ${currentTheme.headerSubtitle} font-medium`}>
                {isAr ? "معكم مضياف المساعد الذكي" : "I am Mudhiyaf, your Smart Assistant"}
              </span>
              <h1 className="text-base sm:text-lg font-black tracking-tight flex items-center gap-1.5 leading-none">
                {isAr ? "للثانوية الرابعة والثلاثون" : "Al-Thanawiya 34 School"}
                <span className="text-[10px] bg-emerald-500/90 text-white font-medium px-1.5 py-0.5 rounded-full ring-2 ring-emerald-400/20">
                  {isAr ? "جدة" : "Jeddah"}
                </span>
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            {/* Theme Selector: Saudi National Day & Official */}
            <div 
              className="flex items-center gap-1 bg-black/35 backdrop-blur-md p-1 rounded-xl border border-white/20 shadow-inner"
              role="group"
              aria-label={isAr ? "سمة التطبيق" : "App Theme"}
            >
              <button
                onClick={() => handleThemeChange("national_day")}
                title={isAr ? "تفعيل سمة اليوم الوطني السعودي ٩٤ 🇸🇦" : "Activate Saudi National Day 94 Theme 🇸🇦"}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === "national_day"
                    ? "bg-gradient-to-r from-[#006C35] to-[#004d25] text-amber-200 shadow-md ring-1 ring-amber-400 scale-[1.03]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <span className="text-sm leading-none">🇸🇦</span>
                <span className="text-[11px] font-black">{isAr ? "سمة اليوم الوطني" : "National Day"}</span>
                {theme === "national_day" && (
                  <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                )}
              </button>

              <button
                onClick={() => handleThemeChange("default")}
                title={isAr ? "السمة المدرسية الرسمية" : "Official School Theme"}
                className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  theme === "default"
                    ? "bg-white text-slate-900 shadow-md scale-[1.03]"
                    : "text-white/80 hover:text-white hover:bg-white/10"
                }`}
              >
                <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                <span className="text-[11px] font-semibold">{isAr ? "السمة الرسمية" : "Official"}</span>
              </button>
            </div>

            {/* Audio Toggle */}
            <button 
              onClick={() => {
                setSoundEnabled(!soundEnabled);
                if (soundEnabled) window.speechSynthesis.cancel();
              }}
              title={isAr ? "التحكم في المساعد المدرسي الصوتي" : "School assistant audio reader"}
              className={`p-2 rounded-lg border transition-all cursor-pointer ${soundEnabled ? "bg-white/15 border-white/30 text-emerald-300" : "bg-white/5 border-white/10 text-slate-400"}`}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(isAr ? "en" : "ar")}
              className="px-2.5 sm:px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 border border-white/20 text-xs font-bold flex items-center gap-1.5 transition-all text-white cursor-pointer"
            >
              <Languages className="w-3.5 h-3.5 text-white/80" />
              <span className="hidden sm:inline">{isAr ? "English" : "العربية"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Saudi National Day Festive Banner (When National Day Theme is active) */}
      {theme === "national_day" && (
        <div className="bg-gradient-to-r from-[#00381b] via-[#006C35] to-[#002e16] text-amber-200 border-b border-amber-400/40 px-4 py-2 shadow-sm transition-all">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs font-bold">
            <div className="flex items-center gap-2 text-center sm:text-start">
              <span className="text-base sm:text-lg">🇸🇦</span>
              <div className="flex items-center flex-wrap gap-x-2 gap-y-0.5">
                <span className="text-white font-extrabold text-xs sm:text-sm">
                  {isAr ? "اليوم الوطني السعودي ٩٤ | نحلم ونحقق" : "94th Saudi National Day | We Dream and Achieve"}
                </span>
                <span className="text-amber-400/60 hidden sm:inline">•</span>
                <span className="text-emerald-200 text-[11px] font-medium hidden md:inline">
                  {isAr ? "الثانوية الرابعة والثلاثون بجدة تعتز براية التوحيد ومسيرة التميز والريادة" : "Al-Thanawiya 34 School celebrates national excellence"}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span className="inline-flex items-center gap-1.5 bg-amber-400/20 text-amber-300 px-3.5 py-1 rounded-full text-xs font-black border border-amber-400/40 shadow-xs tracking-wide">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse flex-shrink-0" />
                <span>{isAr ? "عزنا بطبعنا 🇸🇦" : "Our Pride is Our Nature 🇸🇦"}</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* REAL-TIME CLOCK, TODAY'S DATE & ACTIVE PERIOD TRACKER */}
      <section className={`${currentTheme.clockBanner} text-white border-b ${currentTheme.clockBannerBorder} py-4 px-4 shadow-md transition-colors duration-300`}>
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-stretch lg:items-center gap-4">
          
          {/* Clock and calendar module */}
          <div className="flex items-center gap-3">
            <div className={`w-12 h-12 ${currentTheme.clockIconBox} rounded-2xl flex items-center justify-center shadow-inner`}>
              <Clock className={`w-6 h-6 ${currentTheme.clockTextAccent} animate-pulse`} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-[10px] ${currentTheme.clockTextAccent} tracking-wide`}>
                  {isAr ? "🕒 الساعة والتاريخ المباشر" : "🕒 Real-time Tracker"}
                </span>
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-ping"></span>
              </div>
              <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-0.5">
                <span className="text-lg font-black font-mono text-white tracking-widest">
                  {currentTime.toLocaleTimeString(isAr ? "ar-SA" : "en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
                </span>
                <span className="text-xs text-slate-300 font-bold bg-white/5 px-2 py-0.5 rounded border border-white/5">
                  {currentTime.toLocaleDateString(isAr ? "ar-SA" : "en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
                </span>
              </div>
            </div>
          </div>

          {/* Core dynamic school period label box */}
          {(() => {
            const status = getPeriodStatus();
            return (
              <div className={`flex-1 max-w-xl p-3 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3.5 transition-all ${
                status.statusType === "active"
                  ? "bg-emerald-950/50 border-emerald-500/35 text-emerald-100 shadow-sm shadow-emerald-900/10"
                  : status.statusType === "weekend"
                  ? "bg-sky-950/40 border-sky-500/25 text-sky-200"
                  : "bg-slate-800/60 border-white/10 text-slate-200"
              }`}>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${
                      status.statusType === "active" ? "bg-emerald-400 animate-ping" : "bg-slate-400"
                    }`} />
                    <span className="text-[9px] uppercase font-black tracking-widest text-slate-400">
                      {isAr ? "حالة المدرسة الحالية" : "AL-THANAWIYA 34 STATUS"}
                    </span>
                  </div>
                  <h4 className="text-sm font-black mt-1 leading-snug text-yellow-300">
                    {status.labelAr}
                  </h4>
                </div>
                
                {status.statusType === "active" && (
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-black px-2.5 py-1 rounded-lg self-end sm:self-center">
                    {isAr ? "منهج حضوري" : "LIVE LECTURE"}
                  </span>
                )}
              </div>
            );
          })()}



        </div>
      </section>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex-1 w-full flex flex-col md:flex-row gap-6">
        
        {/* SIDE BAR BUTTON NAVIGATION */}
        <aside className="md:w-64 flex-shrink-0 flex flex-row md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setActiveTab("chat")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "chat"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <MessageSquare className={`w-5 h-5 ${activeTab === "chat" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "💬 المساعد الذكي" : "智能助手 Assistant"}</span>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "map"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <MapIcon className={`w-5 h-5 ${activeTab === "map" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "🗺️ خريطة المدرسة التفاعلية" : "Interactive Blueprint"}</span>
          </button>

          <button
            onClick={() => setActiveTab("staff")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "staff"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Users className={`w-5 h-5 ${activeTab === "staff" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "👩‍🏫 منسوبات المدرسة" : "Staff Directory"}</span>
          </button>

          <button
            onClick={() => setActiveTab("schedule")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "schedule"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === "schedule" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "⏰ جدول طابور وحصص ٣٤" : "Daily Periods Schedule"}</span>
          </button>

          <button
            onClick={() => setActiveTab("achievements")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "achievements"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Award className={`w-5 h-5 ${activeTab === "achievements" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "🏆 إنجازات وتكريم المدرسة" : "School Achievements"}</span>
          </button>

          <button
            onClick={() => setActiveTab("faq")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "faq"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <HelpCircle className={`w-5 h-5 ${activeTab === "faq" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "❓ الأسئلة الكبرى الشائعة" : "Knowledge & FAQ"}</span>
          </button>

          <button
            onClick={() => setActiveTab("events")}
            className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex-1 md:flex-none cursor-pointer ${
              activeTab === "events"
                ? currentTheme.activeNavClass
                : "bg-white hover:bg-slate-100 text-slate-700 border border-slate-200"
            }`}
          >
            <Calendar className={`w-5 h-5 ${activeTab === "events" ? "text-white" : currentTheme.navIconClass}`} />
            <span>{isAr ? "🎉 فعاليات المدرسة" : "School Events"}</span>
          </button>

          {/* Quick Stats Widget */}
          <div className={`hidden md:block mt-6 p-4 rounded-2xl bg-gradient-to-b ${currentTheme.sidebarCard} text-white border shadow-md transition-colors duration-300`}>
            <div className="flex items-center gap-2 text-white/90 text-xs font-black uppercase mb-2">
              <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
              <span>{isAr ? "الثانوية الرابعة والثلاثون" : "AL-THANAWIYA 34"}</span>
            </div>
            <p className="text-xs text-white/80 leading-relaxed font-medium">
              {isAr 
                ? "مدرسة رائدة تواكب التوجهات الحديثة بجدة وتوفر بيئة من دمج التربية ومفهوم التحصيل العلمي الممتاز للتفوق والريادة."
                : "A prominent secondary school in Jeddah fostering excellence, community integration, and rich scholarly metrics."}
            </p>
            <div className="mt-3 border-t border-white/10 pt-3 flex justify-between text-[11px] text-white/60">
              <span>{isAr ? "بوابة الأحد-الخميس" : "Sun-Thu Active"}</span>
              <span className="text-emerald-400 font-bold">● {isAr ? "قيد التدريس" : "Open"}</span>
            </div>
          </div>
        </aside>

        {/* WORKSTAGE CONTAINER */}
        <section className="flex-1 bg-white border border-slate-200 rounded-2xl shadow-xl shadow-slate-100 overflow-hidden flex flex-col">
          
          {/* TAB 1: SMART CHAT ASSISTANT */}
          {activeTab === "chat" && (
            <div className="flex flex-col h-[600px] sm:h-[650px]">
              
              {/* Chat Subheader */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  <p className="text-sm font-bold text-slate-700">
                    {isAr ? "توجيه ذكي بواسطة نموذج Gemini" : "Virtual Assistant AI powered by Gemini"}
                  </p>
                </div>
                <div className="text-xs text-slate-400 font-mono">
                  {messages.length} {isAr ? "رسائل بالجلسة" : "messages cached"}
                </div>
              </div>

              {/* Message Streams */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-50/50">
                {messages.map((m, idx) => (
                  <div key={idx} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`max-w-[85%] rounded-2xl px-5 py-3 text-sm leading-relaxed shadow-sm flex flex-col gap-1 ${
                      m.role === "user"
                        ? `${currentTheme.chatUserBubble} text-white rounded-br-none`
                        : "bg-white border border-slate-200 text-slate-800 rounded-bl-none"
                    }`}>
                      <div className="whitespace-pre-wrap font-medium">{m.text}</div>
                      
                      {m.role === "assistant" && (
                        <div className="flex justify-between items-center mt-1 pt-1 border-t border-slate-100/30 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Sparkles className="w-3 h-3 text-indigo-500" />
                            {m.isFallback ? (isAr ? "مساعد مدرسي محلي" : "Local Guide Bot") : (isAr ? "مستند للذكاء" : "Gemini Grounded")}
                          </span>
                          <button 
                            onClick={() => speakResponse(m.text)}
                            title={isAr ? "نطق الإجابة بصوت عالٍ" : "Read response aloud"}
                            className="p-1 hover:bg-slate-100 rounded text-slate-500"
                          >
                            <Volume2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {isChatLoading && (
                  <div className="flex justify-start">
                    <div className="bg-white border border-slate-200 rounded-2xl rounded-bl-none px-5 py-3 shadow-sm flex items-center gap-1.5 text-xs text-indigo-600 font-bold">
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                      </div>
                      <span>{isAr ? "جاري الاستشارة المنهجية..." : "AI is looking up school structure..."}</span>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick Prompt Chips */}
              <div className="px-6 py-2.5 bg-slate-50 border-t border-slate-100 flex gap-2 overflow-x-auto scrollbar-none flex-shrink-0">
                {quickQuestions.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendMessage(q.query)}
                    className="bg-white hover:bg-indigo-50 hover:border-indigo-300 hover:text-indigo-900 px-3.5 py-1.5 rounded-full border border-slate-200 text-xs font-bold text-slate-600 whitespace-nowrap transition-all"
                  >
                    {q.label}
                  </button>
                ))}
              </div>

              {/* Chat Input form */}
              <div className="p-4 bg-white border-t border-slate-200 flex gap-3 items-center">
                <button
                  type="button"
                  onClick={toggleListening}
                  title={isListening ? (isAr ? "إيقاف الاستماع" : "Stop listening") : (isAr ? "تحدث بالصوت" : "Speak with voice")}
                  className={`p-3 rounded-xl flex items-center justify-center transition-all flex-shrink-0 ${
                    isListening
                      ? "bg-red-500 text-white animate-pulse shadow-lg shadow-red-500/20 ring-2 ring-red-400/50"
                      : "bg-slate-100 text-slate-600 hover:bg-indigo-50 hover:text-indigo-800"
                  }`}
                >
                  <Mic className="w-5 h-5 animate-pulse" />
                </button>

                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => {
                    if (e.key === "Enter") handleSendMessage(chatInput);
                  }}
                  placeholder={
                    isListening
                      ? (isAr ? "جاري الاستماع لصوتكِ الآن... تحدثي" : "Listening to your voice... Speak now")
                      : (isAr 
                          ? "اسأل عن فصول الدمج، دورات مياه الطالبات، مدخل المعلمات أو أوقات الطابور والحصص..."
                          : "Ask about restrooms, classes, principal's office, assembly, laboratories...")
                  }
                  className={`flex-1 border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all ${
                    isListening 
                      ? "bg-red-50/50 border-red-200 text-red-900 placeholder-red-400/80"
                      : "bg-slate-50 border-slate-200 text-slate-800"
                  }`}
                />
                
                <button
                  onClick={() => handleSendMessage(chatInput)}
                  disabled={!chatInput.trim() || isChatLoading}
                  className={`px-5 py-3 rounded-xl font-bold text-sm tracking-tight flex items-center gap-1.5 transition-all flex-shrink-0 ${
                    chatInput.trim() && !isChatLoading
                      ? "bg-gradient-to-r from-blue-900 to-indigo-900 text-white hover:shadow-lg hover:shadow-indigo-900/10"
                      : "bg-slate-100 text-slate-400 cursor-default"
                  }`}
                >
                  <span>{isAr ? "إرسال" : "Send"}</span>
                  {isAr ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                </button>
              </div>
            </div>
          )}

          {/* TAB 2: INTERACTIVE DETAILED BLUEPRINT */}
          {activeTab === "map" && (
            <div className="p-6 flex flex-col gap-6">
              
              {/* Floor Tabs and Search */}
              <div className="flex flex-col lg:flex-row justify-between gap-4">
                <div className="flex gap-2 bg-slate-100 p-1 rounded-xl w-fit">
                  {([0, 1, 2] as const).map((floor) => (
                    <button
                      key={floor}
                      onClick={() => {
                        setSelectedFloor(floor);
                        setSelectedRoom(null);
                        setSearchQuery("");
                      }}
                      className={`px-4 py-2 rounded-lg text-xs font-black tracking-tight uppercase transition-all ${
                        selectedFloor === floor
                          ? "bg-white text-indigo-900 shadow-sm"
                          : "text-slate-600 hover:text-slate-900"
                      }`}
                    >
                      {floor === 0 && (isAr ? "الدور الأرضي  (الكل)" : "Ground Floor")}
                      {floor === 1 && (isAr ? "الدور الأول" : "1st Floor")}
                      {floor === 2 && (isAr ? "الدور الثاني" : "2nd Floor")}
                    </button>
                  ))}
                </div>

                {/* Building Search input */}
                <div className="relative">
                  <Search className="absolute right-3.5 top-2.5 w-4 h-4 text-slate-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder={isAr ? "ابحث عن أي غرفة بالدور المحدد..." : "Search rooms on this floor..."}
                    className="bg-slate-50/80 border border-slate-200 rounded-lg pr-9 pl-4 py-2 text-xs w-full lg:w-64 focus:outline-none focus:ring-1 focus:ring-indigo-600 text-slate-800"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute left-2.5 top-2 text-[10px] bg-slate-200 px-1.5 py-0.5 rounded text-slate-600"
                    >
                      {isAr ? "مسح" : "Clear"}
                    </button>
                  )}
                </div>
              </div>

              {/* Map Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* SVG Visual Stage */}
                <div className="lg:col-span-2 border border-slate-200 rounded-2xl bg-slate-900/5 p-4 flex flex-col justify-between min-h-[400px] overflow-x-auto">
                  <div className="mb-3 flex justify-between items-center text-xs text-slate-500 font-bold border-b border-slate-200/50 pb-2">
                    <span className="flex items-center gap-1.5">
                      <Compass className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: "10s" }} />
                      {isAr ? "اضغط على أي جزء ملون بالخريطة للتفاصيل والتوجيه" : "Click colored room blocks for step directory"}
                    </span>
                    <span className="bg-white/80 border/1 px-2 py-0.5 rounded shadow-sm text-indigo-900">
                      {isAr ? `إجمالي: ${currentFloorRooms.length} مرفقاً` : `${currentFloorRooms.length} rooms mapped`}
                    </span>
                  </div>

                  {/* SVG DIAGRAMS FOR FLOORS */}
                  <div className="flex-1 flex items-center justify-center">
                    
                    {/* FLOOR 0: GROUND FLOOR */}
                    {selectedFloor === 0 && (
                      <svg viewBox="0 0 800 550" className="w-full max-w-[720px] h-auto select-none transition-all duration-300">
                        {/* Outer Plot Grid background */}
                        <rect width="800" height="550" className="fill-none stroke-slate-200/40" strokeWidth="1" strokeDasharray="5,5" />
                        
                        {/* SUTRA / COMPASS INDEX */}
                        <g transform="translate(40,40)" className="text-[10px] fill-slate-400 font-semibold">
                          <circle cx="15" cy="15" r="15" className="fill-slate-100 stroke-slate-300" />
                          <text x="15" y="10" textAnchor="middle" fontSize="8" className="font-extrabold fill-indigo-900">N</text>
                          <line x1="15" y1="15" x2="15" y2="5" className="stroke-indigo-600" strokeWidth="1.5" />
                          <text x="50" y="19" className="fill-slate-500">{isAr ? "مخطط أرضي بـ٣٤" : "34th High Blueprint"}</text>
                        </g>

                        {/* ── EXTERNAL AREAS ── */}
                        {/* Left Active Yard with Playground Games */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "left_yard") || null)}>
                          <rect x="20" y="380" width="160" height="140" rx="10" className={`transition-all cursor-pointer ${getCategoryColor("yard", selectedRoom?.id === "left_yard")}`} />
                          <text x="100" y="440" className="font-black text-xs fill-slate-700 pointer-events-none" textAnchor="middle">{isAr ? "الساحة الخارجية اليسرى" : "Left Active Yard"}</text>
                          <text x="100" y="458" className="fill-slate-500 font-bold text-[9px] pointer-events-none" textAnchor="middle">{isAr ? "(ألعاب طالبات)" : "(Playground Area)"}</text>
                        </g>

                        {/* Teachers Parking Inside Left Yard */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "teachers_parking") || null)}>
                          <rect x="30" y="390" width="75" height="110" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "teachers_parking")}`} />
                          <text x="67.5" y="435" className="font-bold text-[9px] fill-purple-950 pointer-events-none" textAnchor="middle">{isAr ? "مواقف سيارات" : "Teachers"}</text>
                          <text x="67.5" y="445" className="font-bold text-[9px] fill-purple-950 pointer-events-none" textAnchor="middle">{isAr ? "المعلمات" : "Parking"}</text>
                          <line x1="35" y1="460" x2="100" y2="460" className="stroke-purple-300" strokeDasharray="3,3" />
                        </g>

                        {/* Long Right Hallway (سيب طويل) */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "right_hallway") || null)}>
                          <rect x="520" y="360" width="180" height="40" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "right_hallway")}`} />
                          <text x="610" y="384" className="font-bold text-[10px] fill-purple-900 pointer-events-none" textAnchor="middle">{isAr ? "سيب على يمين الباب (الممر الطويل)" : "Long Right Hallway"}</text>
                        </g>

                        {/* Large Square External Yard (الساحة الخارجية الكبيرة) */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "big_yard") || null)}>
                          <rect x="580" y="100" width="190" height="190" rx="12" className={`transition-all cursor-pointer ${getCategoryColor("yard", selectedRoom?.id === "big_yard")}`} />
                          <text x="675" y="180" className="font-black text-xs fill-slate-700 pointer-events-none" textAnchor="middle">{isAr ? "الساحة الخارجية الكبيرة" : "Large External Yard"}</text>
                          <text x="675" y="198" className="fill-slate-500 text-[10px] pointer-events-none" textAnchor="middle">{isAr ? "مربعة الشكل تقريباً" : "(Square Courtyard)"}</text>
                        </g>

                        {/* School Cafeteria on the left inside the big yard */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "cafeteria") || null)}>
                          <rect x="590" y="110" width="70" height="50" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "cafeteria")}`} />
                          <text x="625" y="139" className="font-black text-[10px] fill-purple-900 pointer-events-none" textAnchor="middle">{isAr ? "مقصف ٣٤" : "Cafeteria"}</text>
                        </g>

                        {/* Secondary Gate at end of hallway */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "secondary_gate") || null)}>
                          <rect x="740" y="290" width="30" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("other", selectedRoom?.id === "secondary_gate")}`} />
                          <text x="755" y="320" className="font-bold text-[9px] fill-slate-800 pointer-events-none transform rotate-90 origin-center" textAnchor="middle">{isAr ? "الباب الفرعي" : "Sub Gate"}</text>
                        </g>

                        {/* Main Entry point button bottom */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "main_gate") || null)}>
                          <rect x="250" y="470" width="120" height="40" rx="8" className={`transition-all cursor-pointer ${getCategoryColor("other", selectedRoom?.id === "main_gate")}`} />
                          <text x="310" y="494" className="font-black text-xs fill-slate-900 pointer-events-none" textAnchor="middle">🚪 {isAr ? "الباب الرئيسي للمدرسة" : "Main Gate"}</text>
                        </g>


                        {/* ── INTERNAL BUILDING CENTRAL ── */}
                        
                        {/* Main Building Entrance */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "building_entrance") || null)}>
                          <rect x="250" y="400" width="120" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "building_entrance")}`} />
                          <text x="310" y="429" className="font-bold text-[10px] fill-orange-900 pointer-events-none" textAnchor="middle">🏢 {isAr ? "مدخل المبنى الرئيسي" : "Lobby Entrance"}</text>
                        </g>

                        {/* Main Stairs requiring Left-then-Left */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "main_stairs") || null)}>
                          <rect x="200" y="330" width="70" height="50" rx="6" className={`stroke-2 transition-all cursor-pointer ${getCategoryColor("stair", selectedRoom?.id === "main_stairs")}`} />
                          <path d="M 205,375 L 235,375 L 235,340" fill="none" stroke="#f43f5e" strokeWidth="2" strokeDasharray="3,3" />
                          <text x="235" y="360" className="font-black text-[9px] fill-rose-900 pointer-events-none" textAnchor="middle">🪜 {isAr ? "درج (يسار بـ يسار)" : "Stairs"}</text>
                        </g>

                        {/* Sidebar office shortly past the stairs */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "stair_office") || null)}>
                          <rect x="140" y="270" width="50" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "stair_office")}`} />
                          <text x="165" y="299" className="font-bold text-[10px] fill-amber-900 pointer-events-none" textAnchor="middle">{isAr ? "مكتب" : "Office"}</text>
                        </g>

                        {/* Administrative Rows on the Right of Corridor */}
                        {/* Admin restroom */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "admin_restroom") || null)}>
                          <rect x="200" y="270" width="45" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "admin_restroom")}`} />
                          <text x="222.5" y="299" className="font-bold text-[9px] fill-purple-900 pointer-events-none" textAnchor="middle">{isAr ? "دورة مياه الإدارة" : "Staff WC"}</text>
                        </g>

                        {/* Secretariat */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "secretariat") || null)}>
                          <rect x="250" y="270" width="55" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "secretariat")}`} />
                          <text x="277.5" y="299" className="font-bold text-[9px] fill-amber-900 pointer-events-none" textAnchor="middle">{isAr ? "السكرتارية" : "Sucretary"}</text>
                        </g>

                        {/* Principal office */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "principal_office") || null)}>
                          <rect x="310" y="270" width="55" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "principal_office")}`} />
                          <text x="337.5" y="299" className="font-black text-[9px] fill-amber-950 pointer-events-none" textAnchor="middle">👑 {isAr ? "المديرة" : "Principal"}</text>
                        </g>

                        {/* Administrative office */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "admin_office") || null)}>
                          <rect x="370" y="270" width="55" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "admin_office")}`} />
                          <text x="397.5" y="299" className="font-bold text-[9px] fill-amber-900 pointer-events-none" textAnchor="middle">{isAr ? "مكتب الإدارة" : "Admin"}</text>
                        </g>

                        {/* Female Student Restroom at the end of corridor */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "student_restroom") || null)}>
                          <rect x="430" y="270" width="60" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "student_restroom")}`} />
                          <text x="460" y="299" className="font-black text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">🚻 {isAr ? "دورة مياه طالبات" : "G-Restroom"}</text>
                        </g>

                        {/* Inside/Internal Atrium Yard (الساحة الداخلية) */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "internal_yard") || null)}>
                          <rect x="200" y="160" width="220" height="100" rx="8" className={`transition-all cursor-pointer ${getCategoryColor("yard", selectedRoom?.id === "internal_yard")}`} />
                          <text x="310" y="210" className="font-black text-xs fill-slate-700 pointer-events-none" textAnchor="middle">💚 {isAr ? "الساحة الداخلية للمدرسة" : "Internal Yard Atrium"}</text>
                        </g>

                        {/* Kitchen directly opposite the student restroom */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "kitchen") || null)}>
                          <rect x="430" y="160" width="60" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "kitchen")}`} />
                          <text x="460" y="189" className="font-bold text-[9px] fill-purple-900 pointer-events-none" textAnchor="middle">🍳 {isAr ? "المطبخ" : "Kitchen"}</text>
                        </g>

                        {/* Main Theater at end of the corridor */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "theater") || null)}>
                          <rect x="500" y="160" width="70" height="100" rx="8" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "theater")}`} />
                          <text x="535" y="215" className="font-black text-xs fill-purple-950 pointer-events-none text-center" textAnchor="middle">
                            🎭 {isAr ? "المسرح" : "Theater"}
                          </text>
                        </g>

                        {/* Secondary Entrance landing & staircase */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "second_stairs") || null)}>
                          <rect x="510" y="270" width="60" height="50" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("stair", selectedRoom?.id === "second_stairs")}`} />
                          <text x="540" y="299" className="font-bold text-[8px] fill-rose-900 pointer-events-none" textAnchor="middle">🪜 {isAr ? "الدرج الثاني" : "Stairs 2"}</text>
                        </g>

                        {/* Right wing corridor containing Counselor, learning resources, and Physics Lab */}
                        {/* Health counselor */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "health_counselor") || null)}>
                          <rect x="580" y="270" width="60" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "health_counselor")}`} />
                          <text x="610" y="299" className="font-bold text-[8px] fill-amber-900 pointer-events-none text-center" textAnchor="middle">
                            🩺 {isAr ? "المرشدة الصحية" : "Health Room"}
                          </text>
                        </g>

                        {/* Learning Sources */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "resources_room") || null)}>
                          <rect x="645" y="270" width="65" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("lab", selectedRoom?.id === "resources_room")}`} />
                          <text x="677.5" y="299" className="font-bold text-[8px] fill-emerald-900 pointer-events-none" textAnchor="middle">📚 {isAr ? "غرفة المصادر" : "Resources"}</text>
                        </g>

                        {/* Physics Lab */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "physics_lab") || null)}>
                          <rect x="715" y="270" width="65" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("lab", selectedRoom?.id === "physics_lab")}`} />
                          <text x="747.5" y="299" className="font-black text-[8px] fill-emerald-950 pointer-events-none" textAnchor="middle">🔬 {isAr ? "معمل الفيزياء" : "Physics Lab"}</text>
                        </g>


                        {/* ── THE FOURTH WALL ARCHITECTURE (Left and Top) ── */}
                        
                        {/* Sports Club / Gym */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "sports_club") || null)}>
                          <rect x="20" y="100" width="85" height="50" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "sports_club")}`} />
                          <text x="62.5" y="129" className="font-black text-[9px] fill-purple-950 pointer-events-none" textAnchor="middle">💪 {isAr ? "نادي رياضي" : "Gym Club"}</text>
                        </g>

                        {/* Ground depository */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "storage_ground") || null)}>
                          <rect x="110" y="100" width="45" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("other", selectedRoom?.id === "storage_ground")}`} />
                          <text x="132.5" y="129" className="font-bold text-[9px] fill-slate-800 pointer-events-none" textAnchor="middle">📦 {isAr ? "مستودع" : "Storage"}</text>
                        </g>

                        {/* Biology Lab */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "biology_lab") || null)}>
                          <rect x="160" y="100" width="80" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("lab", selectedRoom?.id === "biology_lab")}`} />
                          <text x="200" y="129" className="font-black text-[9px] fill-emerald-950 pointer-events-none" textAnchor="middle">🧬 {isAr ? "معمل الأحياء" : "Biology Lab"}</text>
                        </g>

                        {/* Grand meeting boardroom */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "meeting_room") || null)}>
                          <rect x="20" y="160" width="100" height="50" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "meeting_room")}`} />
                          <text x="70" y="189" className="font-bold text-[9px] fill-amber-900 pointer-events-none" textAnchor="middle">🤝 {isAr ? "غرفة اجتماعات" : "Meetings"}</text>
                        </g>

                        {/* Sidemost administrative room connecting the loop back */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "stair_office") || null)}>
                          <rect x="125" y="160" width="70" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "stair_office")}`} />
                          <text x="160" y="189" className="font-bold text-[9px] fill-amber-900 pointer-events-none" textAnchor="middle">🏢 {isAr ? "مكتب" : "Office"}</text>
                        </g>
                      </svg>
                    )}

                    {/* FLOOR 1: FIRST FLOOR */}
                    {selectedFloor === 1 && (
                      <svg viewBox="0 0 800 500" className="w-full max-w-[720px] h-auto select-none transition-all duration-300">
                        <rect width="800" height="500" className="fill-none stroke-slate-200/40" strokeWidth="1" strokeDasharray="5,5" />
                        
                        {/* ATRIUM CENTRAL VOID (فراغ مفتوح على الساحة الداخلية بالأسفل) */}
                        <g>
                          <rect x="155" y="160" width="490" height="205" rx="10" className="fill-slate-50 stroke-slate-300 stroke-[2] stroke-dasharray-4" />
                          <rect x="165" y="170" width="470" height="185" rx="8" className="fill-emerald-50/40 stroke-emerald-100 stroke-[1]" />
                          <text x="400" y="250" className="font-extrabold text-[12px] fill-emerald-800" textAnchor="middle">
                            {isAr ? "فراغ يطل على الساحة الداخلية بالأسفل 🌿" : "Atrium Void Overlooking the Courtyard Below 🌿"}
                          </text>
                          <text x="400" y="275" className="font-bold text-[9px] fill-slate-500" textAnchor="middle">
                            {isAr ? "(رؤية مباشرة للساحة الأرضية ومقصف المدرسة من الدور الأول)" : "(Direct view of the ground floor playground & cafeteria from level 1)"}
                          </text>
                        </g>

                        {/* ── TOP WALL ROOMS (y="80", height="60") ── */}
                        {/* Archive Room */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "archive_room") || null)}>
                          <rect x="40" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("other", selectedRoom?.id === "archive_room")}`} />
                          <text x="77.5" y="115" className="font-bold text-[8px] fill-slate-800 pointer-events-none" textAnchor="middle">📂 {isAr ? "الأرشيف" : "Archives"}</text>
                        </g>

                        {/* Teachers Restroom Room */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "teachers_restroom_room") || null)}>
                          <rect x="120" y="80" width="100" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "teachers_restroom_room")}`} />
                          <text x="170" y="115" className="font-bold text-[8px] fill-amber-900 pointer-events-none" textAnchor="middle">👩‍🏫 {isAr ? "غرفة معلمات" : "Teachers Room"}</text>
                        </g>

                        {/* Breakfast Room */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "breakfast_room") || null)}>
                          <rect x="225" y="80" width="100" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "breakfast_room")}`} />
                          <text x="275" y="115" className="font-bold text-[8px] fill-purple-900 pointer-events-none" textAnchor="middle">🍽️ {isAr ? "غرفة الفطور" : "Breakfast Room"}</text>
                        </g>

                        {/* Teachers Restroom 1 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "teachers_restroom_1") || null)}>
                          <rect x="330" y="80" width="110" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "teachers_restroom_1")}`} />
                          <text x="385" y="115" className="font-bold text-[8px] fill-purple-900 pointer-events-none" textAnchor="middle">🚺 {isAr ? "دورة مياه معلمات" : "Staff WC"}</text>
                        </g>

                        {/* Inclusion 1 Class */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_integration") || null)}>
                          <rect x="445" y="80" width="95" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_integration")}`} />
                          <text x="492.5" y="115" className="font-black text-[8px] fill-indigo-950 pointer-events-none text-center" textAnchor="middle">
                            ♿ {isAr ? "أولى دمج" : "Inclusion 1"}
                          </text>
                        </g>

                        {/* Class 1/7 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_7") || null)}>
                          <rect x="545" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_7")}`} />
                          <text x="582.5" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى ٧" : "Class 1/7"}</text>
                        </g>

                        {/* Class 1/6 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_6") || null)}>
                          <rect x="625" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_6")}`} />
                          <text x="662.5" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى ٦" : "Class 1/6"}</text>
                        </g>

                        {/* Stairs 2 */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "second_stairs") || null)}>
                          <rect x="705" y="80" width="55" height="60" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("stair", selectedRoom?.id === "second_stairs")}`} />
                          <text x="732.5" y="115" className="font-bold text-[8px] fill-rose-900 pointer-events-none" textAnchor="middle">🪜 {isAr ? "الدرج ٢" : "Stairs 2"}</text>
                        </g>

                        {/* ── LEFT WALL SYMETRIC LAYER (x="40", width="100") ── */}
                        {/* Iseham activity room */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "iseham_room") || null)}>
                          <rect x="40" y="145" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "iseham_room")}`} />
                          <text x="90" y="178" className="font-bold text-[9px] fill-purple-900 pointer-events-none" textAnchor="middle">✨ {isAr ? "غرفة إسهام" : "Iseham Room"}</text>
                        </g>

                        {/* Sophomore inclusion */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_2_integration") || null)}>
                          <rect x="40" y="205" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_2_integration")}`} />
                          <text x="90" y="238" className="font-bold text-[8px] fill-indigo-950 pointer-events-none" textAnchor="middle">♿ {isAr ? "ثاني دمج" : "Inclusion 2"}</text>
                        </g>

                        {/* Supervisors Desk */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "inspectors_office") || null)}>
                          <rect x="40" y="265" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "inspectors_office")}`} />
                          <text x="90" y="298" className="font-bold text-[8px] fill-amber-900 pointer-events-none" textAnchor="middle">🗃️ {isAr ? "مكتب المراقبات" : "Supervisors"}</text>
                        </g>

                        {/* PC Laboratory */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "computer_lab") || null)}>
                          <rect x="40" y="325" width="100" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("lab", selectedRoom?.id === "computer_lab")}`} />
                          <text x="90" y="354" className="font-black text-[9px] fill-emerald-950 pointer-events-none" textAnchor="middle">💻 {isAr ? "معمل الحاسب" : "PC Lab"}</text>
                        </g>

                        {/* ── RIGHT WALL SYMETRIC LAYER (x="660", width="100") ── */}
                        {/* Vice principal */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "vice_principal") || null)}>
                          <rect x="660" y="145" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "vice_principal")}`} />
                          <text x="710" y="178" className="font-black text-[9px] fill-amber-950 pointer-events-none" textAnchor="middle">🎖️ {isAr ? "مكتب الوكيلة" : "Vice Principal"}</text>
                        </g>

                        {/* Student WC */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "student_restroom_1") || null)}>
                          <rect x="660" y="205" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "student_restroom_1")}`} />
                          <text x="710" y="238" className="font-black text-[8px] fill-indigo-900 pointer-events-none" textAnchor="middle">🚻 {isAr ? "دورة مياه طالبات" : "Girls WC F1"}</text>
                        </g>

                        {/* Storage floor 1 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "storage_1") || null)}>
                          <rect x="660" y="265" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("other", selectedRoom?.id === "storage_1")}`} />
                          <text x="710" y="298" className="font-bold text-[8px] fill-slate-800 pointer-events-none" textAnchor="middle">📦 {isAr ? "مستودع" : "Storage"}</text>
                        </g>

                        {/* Cafe shop */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "cafe_1") || null)}>
                          <rect x="660" y="325" width="100" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "cafe_1")}`} />
                          <text x="710" y="354" className="font-black text-[8px] fill-purple-955 pointer-events-none" textAnchor="middle">🧁 {isAr ? "مقهى معلمات" : "Cafe Corner"}</text>
                        </g>

                        {/* ── BOTTOM WALL ROOMS (y="380", height="60") ── */}
                        {/* Stairs 1 */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "main_stairs") || null)}>
                          <rect x="40" y="380" width="60" height="60" rx="6" className={`stroke-2 transition-all cursor-pointer ${getCategoryColor("stair", selectedRoom?.id === "main_stairs")}`} />
                          <text x="70" y="415" className="font-extrabold text-[8px] fill-rose-900 pointer-events-none" textAnchor="middle">🪜 {isAr ? "الدرج ١" : "Stairs 1"}</text>
                        </g>

                        {/* Student counselor */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "student_counselor") || null)}>
                          <rect x="105" y="380" width="95" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "student_counselor")}`} />
                          <text x="152.5" y="415" className="font-black text-[8px] fill-amber-955 pointer-events-none text-center" textAnchor="middle">
                            🧸 {isAr ? "المرشدة الطلابية" : "Counselor"}
                          </text>
                        </g>

                        {/* Teachers Lounge 1 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "teachers_room_1") || null)}>
                          <rect x="205" y="380" width="95" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "teachers_room_1")}`} />
                          <text x="252.5" y="415" className="font-bold text-[8px] fill-amber-900 pointer-events-none" textAnchor="middle">☕ {isAr ? "مكتب معلمات ١" : "Staff Lounge 1"}</text>
                        </g>

                        {/* Class 1/1 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_1") || null)}>
                          <rect x="305" y="380" width="80" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_1")}`} />
                          <text x="345" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى أول (1/1)" : "Class 1/1"}</text>
                        </g>

                        {/* Class 1/2 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_2") || null)}>
                          <rect x="390" y="380" width="80" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_2")}`} />
                          <text x="430" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى ثاني" : "Class 1/2"}</text>
                        </g>

                        {/* Class 1/3 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_3") || null)}>
                          <rect x="475" y="380" width="80" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_3")}`} />
                          <text x="515" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى ثالث" : "Class 1/3"}</text>
                        </g>

                        {/* Class 1/4 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_4") || null)}>
                          <rect x="560" y="380" width="80" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_4")}`} />
                          <text x="600" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى رابع" : "Class 1/4"}</text>
                        </g>

                        {/* Class 1/5 */}
                        <g onClick={() => setSelectedRoom(firstFloorRooms.find(r => r.id === "class_1_5") || null)}>
                          <rect x="645" y="380" width="115" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_1_5")}`} />
                          <text x="702.5" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "أولى خامس (1/5)" : "Class 1/5"}</text>
                        </g>
                      </svg>
                    )}

                    {/* FLOOR 2: SECOND FLOOR */}
                    {selectedFloor === 2 && (
                      <svg viewBox="0 0 800 500" className="w-full max-w-[720px] h-auto select-none transition-all duration-300">
                        <rect width="800" height="500" className="fill-none stroke-slate-200/40" strokeWidth="1" strokeDasharray="5,5" />
                        
                        {/* ATRIUM CENTRAL VOID (فراغ مفتوح على الساحة الداخلية بالأسفل) */}
                        <g>
                          <rect x="155" y="160" width="490" height="205" rx="10" className="fill-slate-50 stroke-slate-300 stroke-[2] stroke-dasharray-4" />
                          <rect x="165" y="170" width="470" height="185" rx="8" className="fill-emerald-50/40 stroke-emerald-100 stroke-[1]" />
                          <text x="400" y="250" className="font-extrabold text-[12px] fill-emerald-800" textAnchor="middle">
                            {isAr ? "فراغ يطل على الساحة الداخلية بالأسفل 🌿" : "Atrium Void Overlooking the Courtyard Below 🌿"}
                          </text>
                          <text x="400" y="275" className="font-bold text-[9px] fill-slate-500" textAnchor="middle">
                            {isAr ? "(رؤية مباشرة للساحة الأرضية ومقصف المدرسة من الدور الثاني)" : "(Direct view of the ground floor playground & cafeteria from level 2)"}
                          </text>
                        </g>

                        {/* ── TOP WALL ROOMS (y="80", height="60") ── */}
                        {/* Class 3/10 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_10") || null)}>
                          <rect x="40" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_10")}`} />
                          <text x="77.5" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ١٠" : "Class 3/10"}</text>
                        </g>

                        {/* Class 3/9 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_9") || null)}>
                          <rect x="120" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_9")}`} />
                          <text x="157.5" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٩" : "Class 3/9"}</text>
                        </g>

                        {/* Class 3/8 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_8") || null)}>
                          <rect x="200" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_8")}`} />
                          <text x="237.5" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٨" : "Class 3/8"}</text>
                        </g>

                        {/* Class 3/7 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_7") || null)}>
                          <rect x="275" y="80" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_7")}`} />
                          <text x="312.5" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٧" : "Class 3/7"}</text>
                        </g>

                        {/* Teachers Restroom 2 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "teachers_restroom_2") || null)}>
                          <rect x="355" y="80" width="100" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "teachers_restroom_2")}`} />
                          <text x="405" y="115" className="font-bold text-[8px] fill-purple-900 pointer-events-none text-center" textAnchor="middle">
                            🚺 {isAr ? "دورة مياه معلمات" : "Staff WC"}
                          </text>
                        </g>

                        {/* Class 3 Business */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_biz") || null)}>
                          <rect x="460" y="80" width="100" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_biz")}`} />
                          <text x="510" y="115" className="font-black text-[8px] fill-indigo-950 pointer-events-none" textAnchor="middle">📉 {isAr ? "ثالث إد أعمال" : "3 Biz"}</text>
                        </g>

                        {/* Class 3/1 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_1") || null)}>
                          <rect x="565" y="80" width="70" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_1")}`} />
                          <text x="600" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ١" : "Class 3/1"}</text>
                        </g>

                        {/* Class 3/2 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_2") || null)}>
                          <rect x="640" y="80" width="70" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_2")}`} />
                          <text x="675" y="115" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٢" : "Class 3/2"}</text>
                        </g>

                        {/* Stairs 2 */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "second_stairs") || null)}>
                          <rect x="715" y="80" width="45" height="60" rx="6" className={`transition-all cursor-pointer ${getCategoryColor("stair", selectedRoom?.id === "second_stairs")}`} />
                          <text x="737.5" y="115" className="font-bold text-[8px] fill-rose-900 pointer-events-none" textAnchor="middle">🪜 {isAr ? "الدرج ٢" : "Stairs 2"}</text>
                        </g>

                        {/* ── LEFT WALL SYMETRIC LAYER (x="40", width="100") ── */}
                        {/* Student Council */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "student_council") || null)}>
                          <rect x="40" y="145" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "student_council")}`} />
                          <text x="90" y="178" className="font-black text-[8px] fill-purple-955 pointer-events-none" textAnchor="middle">🗳️ {isAr ? "المجلس الطلابي" : "Council"}</text>
                        </g>

                        {/* Supervisors desk */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "inspectors_office_2") || null)}>
                          <rect x="40" y="205" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "inspectors_office_2")}`} />
                          <text x="90" y="238" className="font-bold text-[8px] fill-amber-900 pointer-events-none" textAnchor="middle">🗃️ {isAr ? "المراقبات" : "Supervisors"}</text>
                        </g>

                        {/* Teachers Lounge 3 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "teachers_room_3") || null)}>
                          <rect x="40" y="265" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "teachers_room_3")}`} />
                          <text x="90" y="298" className="font-bold text-[8px] fill-amber-900 pointer-events-none" textAnchor="middle">👩‍🏫 {isAr ? "مكتب معلمات ٣" : "Lounge 3"}</text>
                        </g>

                        {/* Class 3/3 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_3") || null)}>
                          <rect x="40" y="325" width="100" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_3")}`} />
                          <text x="90" y="354" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٣" : "Class 3/3"}</text>
                        </g>

                        {/* ── RIGHT WALL SYMETRIC LAYER (x="660", width="100") ── */}
                        {/* Student WC upper */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "student_restroom_2") || null)}>
                          <rect x="660" y="145" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("facility", selectedRoom?.id === "student_restroom_2")}`} />
                          <text x="710" y="178" className="font-black text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">🚻 {isAr ? "دورة مياه طالبات" : "G-WC F2"}</text>
                        </g>

                        {/* Class 3/4 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_4") || null)}>
                          <rect x="660" y="205" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_4")}`} />
                          <text x="710" y="238" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٤" : "Class 3/4"}</text>
                        </g>

                        {/* Class 3/5 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_5") || null)}>
                          <rect x="660" y="265" width="100" height="55" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_5")}`} />
                          <text x="710" y="298" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٥" : "Class 3/5"}</text>
                        </g>

                        {/* Class 3/6 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_6") || null)}>
                          <rect x="660" y="325" width="100" height="50" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_6")}`} />
                          <text x="710" y="354" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثالث ٦" : "Class 3/6"}</text>
                        </g>

                        {/* ── BOTTOM WALL ROOMS (y="380", height="60") ── */}
                        {/* Arrival stairs */}
                        <g onClick={() => setSelectedRoom(groundFloorRooms.find(r => r.id === "main_stairs") || null)}>
                          <rect x="40" y="380" width="50" height="60" rx="6" className={`stroke-2 transition-all cursor-pointer ${getCategoryColor("stair", selectedRoom?.id === "main_stairs")}`} />
                          <text x="65" y="415" className="font-extrabold text-[8px] fill-rose-900 pointer-events-none" textAnchor="middle">🪜 {isAr ? "الدرج ١" : "Stairs 1"}</text>
                        </g>

                        {/* Side Office */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "office_2_stairs") || null)}>
                          <rect x="95" y="380" width="80" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "office_2_stairs")}`} />
                          <text x="135" y="415" className="font-bold text-[8px] fill-amber-900 pointer-events-none" textAnchor="middle">🗃️ {isAr ? "مكتب إداري" : "Desk Office"}</text>
                        </g>

                        {/* Teachers Lounge 2 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "teachers_room_2") || null)}>
                          <rect x="180" y="380" width="80" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("admin", selectedRoom?.id === "teachers_room_2")}`} />
                          <text x="220" y="415" className="font-bold text-[8px] fill-amber-955" textAnchor="middle">👩‍🏫 {isAr ? "مكتب معلمات ٢" : "Staff Lounge 2"}</text>
                        </g>

                        {/* Class 2 Business */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_2_biz") || null)}>
                          <rect x="265" y="380" width="85" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_2_biz")}`} />
                          <text x="307.5" y="415" className="font-black text-[8px] fill-indigo-955 pointer-events-none" textAnchor="middle">📊 {isAr ? "ثاني إد أعمال" : "2 Biz"}</text>
                        </g>

                        {/* Class 2/1 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_2_1") || null)}>
                          <rect x="355" y="380" width="65" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_2_1")}`} />
                          <text x="387.5" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثاني ١" : "Class 2/1"}</text>
                        </g>

                        {/* Class 2/2 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_2_2") || null)}>
                          <rect x="425" y="380" width="65" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_2_2")}`} />
                          <text x="457.5" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثاني ٢" : "Class 2/2"}</text>
                        </g>

                        {/* Class 2/3 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_2_3") || null)}>
                          <rect x="495" y="380" width="65" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_2_3")}`} />
                          <text x="527.5" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثاني ٣" : "Class 2/3"}</text>
                        </g>

                        {/* Class 2/4 */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_2_4") || null)}>
                          <rect x="565" y="380" width="65" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_2_4")}`} />
                          <text x="597.5" y="415" className="font-bold text-[9px] fill-indigo-900 pointer-events-none" textAnchor="middle">{isAr ? "ثاني ٤" : "Class 2/4"}</text>
                        </g>

                        {/* Class 3 special integration */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "class_3_integration") || null)}>
                          <rect x="635" y="380" width="75" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("class", selectedRoom?.id === "class_3_integration")}`} />
                          <text x="672.5" y="415" className="font-bold text-[8px] fill-indigo-950 pointer-events-none" textAnchor="middle">♿ {isAr ? "ثالث دمج" : "Inclusion 3"}</text>
                        </g>

                        {/* Unnamed Room */}
                        <g onClick={() => setSelectedRoom(secondFloorRooms.find(r => r.id === "unknown_room") || null)}>
                          <rect x="715" y="380" width="45" height="60" rx="4" className={`transition-all cursor-pointer ${getCategoryColor("other", selectedRoom?.id === "unknown_room")}`} />
                          <text x="737.5" y="415" className="font-extrabold text-[10px] fill-slate-500 pointer-events-none" textAnchor="middle">❓</text>
                        </g>
                      </svg>
                    )}
                  </div>

                  {/* SVG Map categories guidelines footer strip */}
                  <div className="mt-4 border-t border-slate-200/50 pt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-[10px] text-slate-500 font-bold justify-center">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-sky-200 border border-sky-400"></span> {isAr ? "فصول دراسية" : "Classrooms"}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-amber-100 border border-amber-500"></span> {isAr ? "مكاتب إدارية" : "Admin / Offices"}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-emerald-100 border border-emerald-500"></span> {isAr ? "معامل ومصادر" : "Science Labs / Resources"}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-teal-50 border border-teal-500"></span> {isAr ? "ساحات خارجية" : "Courtyards"}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-purple-100 border border-purple-400"></span> {isAr ? "استراحات ومرافق" : "Restrooms / Facilities"}</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded bg-rose-150 border border-rose-400"></span> {isAr ? "درج رئيسي وفرعي" : "Stairwells"}</span>
                  </div>
                </div>

                {/* Directory Info / Directions Panel */}
                <div className="flex flex-col gap-4">
                  {searchQuery.trim() !== "" && (
                    <div className="bg-slate-100 border border-slate-200 rounded-2xl p-4">
                      <h4 className="text-xs font-black text-slate-500 uppercase tracking-wider mb-2">
                        {isAr ? `نتائج البحث عن "${searchQuery}"` : `Matches for "${searchQuery}"`}
                      </h4>
                      <div className="space-y-1.5 max-h-[220px] overflow-y-auto">
                        {filteredRooms.map(r => (
                          <button
                            key={r.id}
                            onClick={() => setSelectedRoom(r)}
                            className="w-full text-right hover:bg-white p-2 rounded-lg text-xs font-bold text-indigo-900 border border-transparent hover:border-slate-200 transition-all flex justify-between items-center"
                          >
                            <span>{isAr ? r.nameAr : r.nameEn}</span>
                            <span className="text-[9px] bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded uppercase font-black">
                              {r.category}
                            </span>
                          </button>
                        ))}
                        {filteredRooms.length === 0 && (
                          <p className="text-xs text-slate-400 italic py-2">{isAr ? "لم نعثر على مسمى مطابق بالدور المحدد..." : "No rooms match keyword."}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {/* ROOM DETAIL CARD CARD */}
                  <div className="bg-gradient-to-br from-indigo-950 to-slate-900 text-white rounded-2xl p-6 border border-indigo-800 shadow-xl flex-1 flex flex-col justify-between">
                    {selectedRoom ? (
                      <div className="space-y-4">
                        <div className="flex justify-between items-start border-b border-indigo-900 pb-3">
                          <div>
                            <span className="text-[10px] bg-indigo-600 font-extrabold tracking-wider uppercase px-2 py-0.5 rounded">
                              {selectedRoom.category.toUpperCase()}
                            </span>
                            <h3 className="text-lg font-black tracking-tight mt-1.5 text-yellow-300">
                              {isAr ? selectedRoom.nameAr : selectedRoom.nameEn}
                            </h3>
                          </div>
                          <button 
                            onClick={() => setSelectedRoom(null)}
                            className="text-indigo-400 hover:text-white text-xs font-semibold"
                          >
                            {isAr ? "إغلاق" : "Close"}
                          </button>
                        </div>

                        <div className="space-y-3.5">
                          <div>
                            <span className="text-[10px] text-indigo-400 font-black block mb-1">
                              {isAr ? "📋 الوصف والغرض التخصصي" : "📋 Purpose & Description"}
                            </span>
                            <p className="text-xs text-slate-200 leading-relaxed font-semibold">
                              {isAr ? selectedRoom.descriptionAr : selectedRoom.descriptionEn}
                            </p>
                          </div>

                          <div className="bg-indigo-900/40 border border-indigo-800 rounded-xl p-3">
                            <span className="text-[10px] text-yellow-400 font-black flex items-center gap-1.5 mb-1.5">
                              <Navigation className="w-3.5 h-3.5" />
                              {isAr ? "🧭 إرشادات وتوجيهات المسار بـ٣٤" : "🧭 Navigation Instructions"}
                            </span>
                            <p className="text-xs text-indigo-200 leading-relaxed font-semibold">
                              {selectedRoom.id === "principal_office" && (isAr 
                                ? "ادخلي من الباب الرئيسي، ثم اسلكي الممر الرئيسي قليلاً والتفي يميناً. مكتب المديرة يقع بجانب السكرتارية ويسار دورة مياه الإدارة."
                                : "Go through the main building lobby, turn right, and find the Principal's cabinet next to the secretariat.")}
                              {selectedRoom.id === "physics_lab" && (isAr 
                                ? "ادخلي من الباب الفرعي (عند نهاية الساحة الكبيرة)، أمامك الدرج الثاني، اذهبي يميناً في ممر المختبرات. معمل الفيزياء يقع في نهاية الممر بعد غرفة المصادر."
                                : "Enter via secondary door, turn right into the labs hallway; Physics lab is the last room pass learning sources.")}
                              {selectedRoom.id === "biology_lab" && (isAr 
                                ? "يقع معمل الأحياء في الدور الأرضي حول الساحة الداخلية (الجدار الرابع والأخير)، بالقرب من مستودع المواد والدرج الأول."
                                : "Biology lab represents the 4th outer block wrapping the internal courtyard, close to secondary stairs.")}
                              {selectedRoom.id === "student_restroom_1" && (isAr 
                                ? "اصعدي الدرج الأول للدور الأول. تقع دورة المياه مباشرة في نهاية الممر على اليسار تماماً فوق دورة مياه الطالبات بالدور الأرضي."
                                : "Go to the 1st floor via stair 1. The restroom is at the far left edge of the corridor, stacked precisely above GroundWC.")}
                              {!["principal_office", "physics_lab", "biology_lab", "student_restroom_1"].includes(selectedRoom.id) && (isAr 
                                ? "تتبعي المخطط السهمي للأدوار. يمكنك استخدام المساعد الذكي Gemini للسؤال الفوري عن هذا المرفق بالتفصيل."
                                : "Follow the directional schematics. Type this room name inside Gemini assistant tab for quick customized paths.")}
                            </p>
                          </div>
                        </div>

                        <div className="pt-4 border-t border-indigo-900 flex justify-between text-[11px] text-indigo-300 font-bold">
                          <span>{isAr ? "الثانوية ٣٤ جده" : "Al-Thanawiya 34 School"}</span>
                          <span>{isAr ? `طابق: ${selectedFloor}` : `Floor: ${selectedFloor}`}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-20 flex flex-col items-center justify-center gap-3">
                        <MapPin className="w-10 h-10 text-indigo-400 animate-bounce" />
                        <h3 className="text-sm font-black tracking-tight text-yellow-300">
                          {isAr ? "لم تختر أي مرفق بعد" : "No Room Selected"}
                        </h3>
                        <p className="text-xs text-indigo-200 max-w-[200px] leading-relaxed mx-auto font-medium">
                          {isAr 
                            ? "اضغطي على أي غرفة أو مربع في خريطة المدرسة على اليسار لرؤية توجيهات المسار والوصف التفصيلي فوراً."
                            : "Click any rectangular boundary on the floor map layout vector to display descriptions & guide instructions."}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: SCHEDULE PERIOD TIMELINE */}
          {activeTab === "schedule" && (
            <div className="p-6 space-y-6">
              
              {/* Day filter selector */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-indigo-600 animate-pulse" />
                    {isAr ? "جدول الحصص والتوقيتات اليزمية ٢٠٢٦" : "Daily Assembly & Period Times 2026"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5 font-medium">
                    {isAr ? "موزعة بدقة وفقاً للأيام ونظام الـ ٥٠ دقيقة مع الطابور 6:45 ص" : "Formatted specifically around 50-minute blocks with assembly at 6:45 AM"}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => setScheduleDay("sun-mon")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      scheduleDay === "sun-mon"
                        ? "bg-indigo-900 text-white shadow-md"
                        : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    📅 {isAr ? "الأحد والاثنين (٧ حصص)" : "Sunday & Monday (7 periods)"}
                  </button>
                  <button
                    onClick={() => setScheduleDay("tue-thu")}
                    className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all ${
                      scheduleDay === "tue-thu"
                        ? "bg-indigo-900 text-white shadow-md"
                        : "bg-white hover:bg-slate-100 text-slate-600 border border-slate-200"
                    }`}
                  >
                    📅 {isAr ? "الثلاثاء إلى الخميس (٦ حصص)" : "Tuesday to Thursday (6 periods)"}
                  </button>
                </div>
              </div>

              {/* Grid timeline display */}
              <div className="space-y-3">
                {schedulePeriods
                  .filter(p => p.days === "all" || p.days === scheduleDay)
                  .map((p, idx) => (
                    <div 
                      key={idx}
                      className={`flex flex-col sm:flex-row justify-between items-start sm:items-center p-4 rounded-2xl border transition-all ${
                        p.type === "assembly" 
                          ? "bg-rose-50/70 border-rose-200 text-rose-950"
                          : p.type === "break"
                          ? "bg-emerald-50/70 border-emerald-200 text-emerald-950"
                          : p.type === "dismissal"
                          ? "bg-amber-50/75 border-amber-200 text-amber-950"
                          : "bg-white border-slate-200 hover:border-slate-350"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs ${
                          p.type === "assembly"
                            ? "bg-rose-100 text-rose-700"
                            : p.type === "break"
                            ? "bg-emerald-100 text-emerald-700"
                            : p.type === "dismissal"
                            ? "bg-amber-100 text-amber-700"
                            : "bg-indigo-50 text-indigo-700"
                        }`}>
                          {p.num > 0 ? p.num : "★"}
                        </span>
                        <div>
                          <h4 className="text-sm font-black text-slate-800">
                            {isAr ? p.nameAr : p.nameEn}
                          </h4>
                          <p className="text-[10px] text-slate-500 font-bold mt-0.5">
                            {p.type === "class" && (isAr ? "فترة تعليمية ومناهج بـ٣٤ (٥٠ دقيقة)" : "Core academic lecture session (50 mins)")}
                            {p.type === "assembly" && (isAr ? "إذاعة مدرسية وتوعية وإعداد طابور" : "Morning assembly activities & announcements")}
                            {p.type === "break" && (isAr ? "فسحة لشراء السندوتشات وتغيير النشاط" : "School recess, cafeteria opening & breaks")}
                            {p.type === "dismissal" && (isAr ? "انصراف آمن للطالبات من البوابات" : "Safe exit and parents school dismissal")}
                          </p>
                        </div>
                      </div>

                      {/* Time blocks indicator */}
                      <div className="mt-2.5 sm:mt-0 bg-slate-900 text-white font-mono text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-1.5 self-end sm:self-center">
                        <span>{p.start}</span>
                        <span className="text-slate-500">→</span>
                        <span>{p.end}</span>
                      </div>
                    </div>
                  ))}
              </div>

              {/* General school week footer */}
              <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4 flex items-center gap-3">
                <Compass className="w-5 h-5 text-indigo-800 flex-shrink-0 animate-spin" style={{ animationDuration: "14s" }} />
                <p className="text-xs text-indigo-950 font-semibold leading-relaxed">
                  {isAr 
                    ? "ملاحظة هامة: نظام الـ ٥٠ دقيقة تم توزيعه بدقة متناهية لضمان استيعاب الطالبات واكتمال الحصص والمناهج في الثانوية الرابعة والثلاثون، مع توفير الفسحة الكافية للمقصف ٣٠ دقيقة دورياً."
                    : "Note: The 50-minute periods are optimized systematically with the education department parameters, providing 30 minutes break daily for recess."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 4: ACHIEVEMENTS AWARDS */}
          {activeTab === "achievements" && (
            <div className="p-6 space-y-6">
              <div className="text-center max-w-xl mx-auto space-y-2">
                <Award className="w-12 h-12 text-yellow-500 mx-auto animate-bounce" />
                <h3 className="text-lg font-black text-slate-800">
                  {isAr ? "سجل التكريم والتميز للثانوية ٣٤" : "Excellence Record of Al-Thanawiya 34"}
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed font-bold">
                  {isAr
                    ? "أحدث الجوائز الرسمية المعتمدة المستحقة للمدرسة بوزارة التعليم تقديراً لحجم الجهد والتحصيل العلمي المتميز."
                    : "Primary state achievements recognized by the ministry of education consecutively for pedagogical standards."}
                </p>
              </div>

              {/* Dynamic Achievements mapping */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {schoolAchievements.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-800 rounded-2xl p-6 text-white relative overflow-hidden shadow-lg flex flex-col justify-between"
                  >
                    <div className="absolute -right-6 -bottom-6 text-indigo-900/60 font-black text-7xl select-none pointer-events-none font-mono">
                      {item.year}
                    </div>

                    <div className="flex items-start gap-4 z-10">
                      <span className="text-4xl bg-indigo-900/40 p-2.5 rounded-xl border border-indigo-800 block shadow-inner">
                        {item.icon}
                      </span>
                      <div>
                        <span className="text-[10px] bg-yellow-500/95 text-slate-950 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wide">
                          {item.year} {isAr ? "متتاليتين" : "CONSECUTIVE"}
                        </span>
                        <h4 className="text-sm font-black tracking-tight mt-2 text-yellow-300 leading-relaxed font-semibold">
                          {isAr ? item.titleAr : item.titleEn}
                        </h4>
                      </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-indigo-900 text-[10px] text-indigo-300 flex justify-between font-bold">
                      <span>{isAr ? "جائزة التميز الكبرى" : "Ministry Excellence Laureate"}</span>
                      <span>{isAr ? "تعليم جدة" : "Jeddah District"}</span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Clean statement box */}
              <div className="bg-slate-50 border border-slate-200 rounded-2xl p-6 flex flex-col md:flex-row gap-4 items-center">
                <School className="w-10 h-10 text-indigo-900 flex-shrink-0" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-800">
                    {isAr ? "تحقيق التميز سنتين على التوالي (٢٠٢٤ - ٢٠٢٥)" : "Laureate for Two Successive Years (2024-2025)"}
                  </h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-semibold">
                    {isAr 
                      ? "جاء تحقيق هذا الإنجاز المستحق بفضل الله ثم العمل المنهجي لمعلمات وإداريات الثانوية الرابعة والثلاثون بجدة وتطبيق أرقى المعايير والمؤشرات التربوية السنوية."
                      : "Won due to collective pedagogical benchmarks, teacher initiatives, and stellar indicators evaluated annually by the inspection committee."}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: FAQ ACCORDIONS */}
          {activeTab === "faq" && (
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 mb-2">
                <h3 className="text-sm font-black text-slate-800 flex items-center gap-1.5">
                  <HelpCircle className="w-4 h-4 text-indigo-600" />
                  {isAr ? "الأسئلة الشائعة من الزائرات والطالبات" : "Frequently Answered Questions"}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5 font-medium">
                  {isAr ? "إجابات فورية ودقيقة عن كل ما يتعلق بمبنى مدرسة الثانوية الرابعة والثلاثون وجدولها المطور." : "Instant guidelines regarding school timelines and 3-floor building architecture."}
                </p>
              </div>

              {/* Accordions stream */}
              <div className="space-y-3">
                {schoolFaq.map((faq, idx) => (
                  <details 
                    key={idx}
                    className="group bg-white border border-slate-200 rounded-2xl p-4 [&_summary::-webkit-details-marker]:hidden transition-all hover:border-slate-350"
                  >
                    <summary className="flex justify-between items-center font-black text-xs text-slate-800 cursor-pointer focus:outline-none">
                      <span className="flex items-center gap-2 pr-1.5">
                        <span className="text-indigo-600 font-mono text-[11px]">0{idx + 1}.</span>
                        <span>{isAr ? faq.q : faq.qEn}</span>
                      </span>
                      <ChevronDown className="w-4 h-4 text-slate-400 group-open:rotate-180 transition-transform flex-shrink-0" />
                    </summary>
                    
                    <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600 leading-relaxed font-medium">
                      <p>{isAr ? faq.a : faq.aEn}</p>
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: SCHOOL EVENTS (فعاليات المدرسة) */}
          {activeTab === "events" && (
            <div className="p-6 space-y-6">
              
              {/* Header block with Plus inline button */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-50 p-5 rounded-2xl border border-slate-200">
                <div>
                  <h3 className="text-base font-black text-slate-800 flex items-center gap-2">
                    <span className="p-1.5 bg-indigo-50 text-indigo-700 rounded-lg">🎉</span>
                    {isAr ? "منصة فعاليات وأنشطة الثانوية ٣٤" : "Al-Thanawiya 34 School Events Hub"}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 font-semibold leading-relaxed font-sans">
                    {isAr ? "تابعي وأضيفي الأنشطة والمناسبات المدرسية مع تحديد التاريخ والوقت والموقع الدقيق." : "Track and manage public programs, exhibitions, and schedules."}
                  </p>
                </div>

                <button
                  onClick={() => setIsAddingEvent(!isAddingEvent)}
                  className="px-4 py-2 bg-indigo-900 border border-indigo-800 hover:bg-indigo-950 text-white font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-md shadow-indigo-950/10 transition-all self-stretch sm:self-auto text-center justify-center cursor-pointer"
                >
                  <span className="text-sm font-black">{isAddingEvent ? "×" : "+"}</span>
                  <span>{isAr ? "إضافة فعالية جديدة" : "Add Custom Event"}</span>
                </button>
              </div>

              {/* Collapsed adding form */}
              {isAddingEvent && (
                <form 
                  onSubmit={handleAddEvent}
                  className="bg-indigo-950/5 text-slate-800 border border-indigo-900/10 rounded-2xl p-5 space-y-4"
                >
                  <div className="border-b border-indigo-900/10 pb-2">
                    <h4 className="text-xs font-black text-indigo-950">
                      {isAr ? "✨ تفاصيل الفعالية الجديدة" : "✨ New Event Attributes"}
                    </h4>
                    <p className="text-[10px] text-slate-500 font-semibold mt-0.5">
                      {isAr ? "املئي الحقول لإعطاء فكرة كاملة عن الفعالية وموقعها." : "Fill out inputs to outline times and locations."}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Event Name */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 font-sans">
                        {isAr ? "اسم الفعالية *" : "Event Name *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isAr ? "مثال: اليوم الوطني للعلوم" : "e.g., National Sciences Expo"}
                        value={newEventTitle}
                        onChange={(e) => setNewEventTitle(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Timing */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 font-sans">
                        {isAr ? "التوقيت *" : "Timing *"}
                      </label>
                      <input
                        type="text"
                        required
                        placeholder={isAr ? "مثال: 09:30 ص أو الطابور" : "e.g., 09:30 AM or Recess"}
                        value={newEventTime}
                        onChange={(e) => setNewEventTime(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Date */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 font-sans">
                        {isAr ? "التاريخ *" : "Date *"}
                      </label>
                      <input
                        type="date"
                        required
                        value={newEventDate}
                        onChange={(e) => setNewEventDate(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Location */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 font-sans">
                        {isAr ? "الموقع في المدرسة (اختياري)" : "Location inside School (Optional)"}
                      </label>
                      <input
                        type="text"
                        placeholder={isAr ? "مثال: الساحة الكبيرة أو معمل الفيزياء" : "e.g., Physics Lab or Core Yard"}
                        value={newEventLocation}
                        onChange={(e) => setNewEventLocation(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="block text-[10px] font-black text-slate-700 font-sans">
                        {isAr ? "وصف الفعالية (اختياري)" : "Description / Goals (Optional)"}
                      </label>
                      <input
                        type="text"
                        placeholder={isAr ? "مثال: يهدف هذا البرنامج إلى إعداد الطالبات..." : "e.g., Intends to prepare secondary graduates for..."}
                        value={newEventDesc}
                        onChange={(e) => setNewEventDesc(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-850 focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-indigo-900/10">
                    <button
                      type="button"
                      onClick={() => setIsAddingEvent(false)}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-[11px] rounded-xl cursor-pointer"
                    >
                      {isAr ? "إلغاء الأمر" : "Cancel"}
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-indigo-900 hover:bg-indigo-950 text-white font-extrabold text-[11px] rounded-xl flex items-center gap-1 shadow-md shadow-indigo-900/10 cursor-pointer"
                    >
                      <span>💾</span>
                      <span>{isAr ? "حفظ الفعالية المدرسية" : "Save Event"}</span>
                    </button>
                  </div>
                </form>
              )}

              {/* Events display cards */}
              {events.length === 0 ? (
                <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3">
                  <span className="text-4xl text-slate-300">📅</span>
                  <h4 className="text-sm font-black text-slate-705">
                    {isAr ? "لا توجد فعاليات مضافة حالياً" : "No customized school events."}
                  </h4>
                  <p className="text-xs text-slate-400 font-medium">
                    {isAr ? "اضغطي على زر 'إضافة فعالية جديدة' في الأعلى لتبدئي بملء تفاصيل الأنشطة." : "Click Add Custom Event above to populate activities."}
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {events.map((ev) => (
                    <div 
                      key={ev.id}
                      className="bg-white border-2 border-indigo-900/10 rounded-2xl p-5 flex flex-col justify-between hover:border-indigo-600 transition-all shadow-sm group"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] bg-indigo-50 text-indigo-700 font-black px-2.5 py-1 rounded-lg">
                            🔔 {isAr ? "نشاط معتمد" : "PROG"}
                          </span>
                          
                          <button
                            onClick={() => handleDeleteEvent(ev.id)}
                            title={isAr ? "حذف هذه الفعالية" : "Delete event"}
                            className="text-slate-400 hover:text-rose-600 transition-all text-xs border border-slate-100 hover:border-rose-100 bg-slate-50 hover:bg-rose-50 px-1.5 py-0.5 rounded cursor-pointer"
                          >
                            🗑️ {isAr ? "حذف" : "Delete"}
                          </button>
                        </div>

                        <div>
                          <h4 className="text-sm font-black text-slate-800 leading-snug group-hover:text-indigo-900 transition-colors">
                            {ev.title}
                          </h4>
                          {ev.description && (
                            <p className="text-xs text-slate-550 leading-relaxed font-semibold mt-1.5 font-sans">
                              {ev.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="mt-5 border-t border-slate-100 pt-3.5 space-y-1.5">
                        <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                          <span>📅 {isAr ? "التاريخ:" : "Date:"}</span>
                          <span className="font-mono text-slate-800">{ev.date}</span>
                        </div>
                        <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                          <span>⏱️ {isAr ? "التوقيت المقترح:" : "Timing:"}</span>
                          <span className="text-slate-800">{ev.time}</span>
                        </div>
                        {ev.location && (
                          <div className="flex justify-between text-[11px] text-slate-600 font-bold">
                            <span>📍 {isAr ? "القاعة/الموقع:" : "Venue:"}</span>
                            <span className="text-indigo-900 truncate max-w-[150px] font-sans">{ev.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Informative advice footer */}
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex gap-3.5 items-center">
                <span className="text-2xl">💡</span>
                <p className="text-xs text-amber-950 font-semibold leading-relaxed font-sans">
                  {isAr 
                    ? "ملاحظة التخزين والريادة: يتم حفظ الفعاليات المضافة تلقائياً في ذاكرة متصفحك المحلية (Local Storage). هذا يتيح لكِ رؤيتها وإدارتها وتحديث مسارات الحصص بنجاح في كل مرة تفتحين فيها التطبيق."
                    : "Events are automatically captured and safe-guarded locally in your web device browser storage."}
                </p>
              </div>
            </div>
          )}

          {/* TAB 7: SCHOOL STAFF DIRECTORY (منسوبات المدرسة) */}
          {activeTab === "staff" && (
            <StaffDirectory
              isAr={isAr}
              staffList={staffList}
              onLocateRoom={handleLocateStaffRoom}
              onAskAssistant={handleAskAboutStaff}
              onAddStaff={handleAddStaff}
              onDeleteStaff={handleDeleteStaff}
              onClearAllStaff={handleClearAllStaff}
            />
          )}

        </section>
      </main>

      {/* COMPACT POLISHED FOOTER */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-6 border-t border-slate-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-3.5 h-3.5 bg-indigo-600 text-white rounded flex items-center justify-center font-bold text-[9px] pointer-events-none">34</span>
            <p className="font-bold sm:text-right text-slate-300">
              {isAr ? "الثانوية الرابعة والثلاثون بجدة © ٢٠٢٦" : "Al-Thanawiya 34 School of Jeddah © 2026"}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
