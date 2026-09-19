import React, { useState, useMemo } from "react";
import { StaffMember, StaffCategory, RoomInfo } from "../types";
import { 
  Users, 
  Search, 
  MapPin, 
  Clock, 
  Mail, 
  Phone, 
  Sparkles, 
  GraduationCap, 
  CheckCircle2, 
  ArrowLeft, 
  ArrowRight, 
  Plus, 
  Trash2, 
  MessageSquare, 
  Compass, 
  X,
  ExternalLink,
  Award,
  BookOpen,
  Briefcase,
  HeartHandshake,
  ShieldCheck
} from "lucide-react";

interface StaffDirectoryProps {
  isAr: boolean;
  staffList: StaffMember[];
  onLocateRoom: (floor: 0 | 1 | 2, roomId?: string) => void;
  onAskAssistant: (prompt: string) => void;
  onAddStaff: (newStaff: StaffMember) => void;
  onDeleteStaff?: (id: string) => void;
  onClearAllStaff?: () => void;
}

export default function StaffDirectory({
  isAr,
  staffList,
  onLocateRoom,
  onAskAssistant,
  onAddStaff,
  onDeleteStaff,
  onClearAllStaff
}: StaffDirectoryProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<"all" | StaffCategory>("all");
  const [selectedFloor, setSelectedFloor] = useState<"all" | 0 | 1 | 2>("all");
  const [selectedStaff, setSelectedStaff] = useState<StaffMember | null>(null);
  const [isAddingModalOpen, setIsAddingModalOpen] = useState(false);

  // Form State for Adding New Staff Member
  const [formName, setFormName] = useState("");
  const [formRole, setFormRole] = useState("");
  const [formCategory, setFormCategory] = useState<StaffCategory>("teachers");
  const [formDepartment, setFormDepartment] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formFloor, setFormFloor] = useState<0 | 1 | 2>(1);
  const [formTasks, setFormTasks] = useState("");
  const [formOfficeHours, setFormOfficeHours] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formExtension, setFormExtension] = useState("");

  const categories = useMemo(() => [
    { id: "all", labelAr: "الكل", labelEn: "All Staff", count: staffList.length },
    { 
      id: "leadership", 
      labelAr: "القيادة المدرسية", 
      labelEn: "School Leadership",
      count: staffList.filter(s => s.category === "leadership").length 
    },
    { 
      id: "teachers", 
      labelAr: "الهيئة التعليمية (المعلمات)", 
      labelEn: "Teachers & Faculty",
      count: staffList.filter(s => s.category === "teachers").length 
    },
    { 
      id: "counseling", 
      labelAr: "الإرشاد والرعاية الصحية", 
      labelEn: "Counseling & Wellness",
      count: staffList.filter(s => s.category === "counseling").length 
    },
    { 
      id: "admin", 
      labelAr: "الكادر الإداري والمختبرات", 
      labelEn: "Administrative & Labs",
      count: staffList.filter(s => s.category === "admin").length 
    },
    { 
      id: "special", 
      labelAr: "الأنشطة والموهوبات والدمج", 
      labelEn: "Gifted & Inclusion",
      count: staffList.filter(s => s.category === "special").length 
    },
  ], [staffList]);

  const filteredStaff = useMemo(() => {
    return staffList.filter(staff => {
      const matchesCategory = selectedCategory === "all" || staff.category === selectedCategory;
      const matchesFloor = selectedFloor === "all" || staff.floor === selectedFloor;
      
      const query = searchQuery.trim().toLowerCase();
      if (!query) return matchesCategory && matchesFloor;

      const matchesSearch = 
        staff.nameAr.toLowerCase().includes(query) ||
        staff.nameEn.toLowerCase().includes(query) ||
        staff.roleAr.toLowerCase().includes(query) ||
        staff.roleEn.toLowerCase().includes(query) ||
        staff.departmentAr.toLowerCase().includes(query) ||
        staff.departmentEn.toLowerCase().includes(query) ||
        staff.locationAr.toLowerCase().includes(query) ||
        (staff.tasksAr && staff.tasksAr.some(t => t.toLowerCase().includes(query)));

      return matchesCategory && matchesFloor && matchesSearch;
    });
  }, [staffList, selectedCategory, selectedFloor, searchQuery]);

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim() || !formRole.trim() || !formDepartment.trim()) {
      return;
    }

    const tasksArray = formTasks
      .split("\n")
      .map(t => t.trim())
      .filter(Boolean);

    const newStaff: StaffMember = {
      id: "staff_" + Date.now(),
      nameAr: formName.trim(),
      nameEn: formName.trim(),
      roleAr: formRole.trim(),
      roleEn: formRole.trim(),
      category: formCategory,
      departmentAr: formDepartment.trim(),
      departmentEn: formDepartment.trim(),
      locationAr: formLocation.trim() || (formFloor === 0 ? "الدور الأرضي" : formFloor === 1 ? "الدور الأول" : "الدور الثاني"),
      locationEn: formLocation.trim() || `Floor ${formFloor}`,
      floor: formFloor,
      tasksAr: tasksArray.length > 0 ? tasksArray : undefined,
      officeHoursAr: formOfficeHours.trim() || undefined,
      emailContact: formEmail.trim() || undefined,
      extension: formExtension.trim() || undefined,
      avatarIcon: formCategory === "leadership" ? "👑" : formCategory === "teachers" ? "👩‍🏫" : formCategory === "counseling" ? "🌸" : "📋"
    };

    onAddStaff(newStaff);

    // Reset Form
    setFormName("");
    setFormRole("");
    setFormDepartment("");
    setFormLocation("");
    setFormTasks("");
    setFormOfficeHours("");
    setFormEmail("");
    setFormExtension("");
    setIsAddingModalOpen(false);
  };

  const getFloorName = (floor: 0 | 1 | 2) => {
    if (floor === 0) return isAr ? "الدور الأرضي" : "Ground Floor";
    if (floor === 1) return isAr ? "الدور الأول" : "First Floor";
    return isAr ? "الدور الثاني" : "Second Floor";
  };

  const getCategoryBadge = (category: StaffCategory) => {
    switch (category) {
      case "leadership":
        return {
          label: isAr ? "القيادة المدرسية" : "Leadership",
          bg: "bg-amber-500/10 text-amber-800 border-amber-500/30"
        };
      case "counseling":
        return {
          label: isAr ? "إرشاد ورعاية" : "Counseling",
          bg: "bg-rose-500/10 text-rose-800 border-rose-500/30"
        };
      case "teachers":
        return {
          label: isAr ? "هيئة تعليمية" : "Faculty",
          bg: "bg-blue-500/10 text-blue-800 border-blue-500/30"
        };
      case "admin":
        return {
          label: isAr ? "كادر إداري" : "Admin Staff",
          bg: "bg-slate-500/10 text-slate-800 border-slate-500/30"
        };
      case "special":
        return {
          label: isAr ? "موهوبات ودمج" : "Inclusion",
          bg: "bg-emerald-500/10 text-emerald-800 border-emerald-500/30"
        };
      default:
        return {
          label: isAr ? "منسوبة" : "Staff",
          bg: "bg-slate-100 text-slate-700 border-slate-200"
        };
    }
  };

  const leadershipCount = useMemo(() => staffList.filter(s => s.category === "leadership").length, [staffList]);
  const teachersCount = useMemo(() => staffList.filter(s => s.category === "teachers").length, [staffList]);
  const counselingCount = useMemo(() => staffList.filter(s => s.category === "counseling").length, [staffList]);
  const adminCount = useMemo(() => staffList.filter(s => s.category === "admin" || s.category === "special").length, [staffList]);

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-6 font-sans">
      
      {/* HEADER HERO BANNER */}
      <div className="bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-indigo-800/40">
        <div className="absolute top-0 end-0 -mt-10 -me-10 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 relative z-10">
          <div className="space-y-2 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider bg-yellow-400 text-indigo-950 px-3 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
                <Award className="w-3.5 h-3.5" />
                <span>{isAr ? "صرح التميز ٢٠٢٤ - ٢٠٢٥" : "Excellence 2024 - 2025"}</span>
              </span>
              <span className="text-[11px] font-bold text-indigo-200 bg-white/10 px-3 py-1 rounded-full border border-white/10">
                {staffList.length} {isAr ? "منسوبة تعليمية وإدارية" : "Members"}
              </span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              {isAr ? "👩‍🏫 دليل منسوبات مدرسة الثانوية الرابعة والثلاثون" : "Al-Thanawiya 34 Staff & Faculty Directory"}
            </h2>

            <p className="text-sm text-indigo-200 leading-relaxed">
              {isAr 
                ? "دليل الكوادر التعليمية والإدارية والإرشادية لتقديم أعلى مستويات الرعاية والتفوق الأكاديمي لطالباتنا العزيزات."
                : "The dedicated educators, leaders, and counselors of Al-Thanawiya 34, committed to fostering student excellence."}
            </p>
          </div>

          {/* ADD STAFF BUTTON & STATS */}
          <div className="flex flex-wrap gap-2 w-full md:w-auto">
            <button
              onClick={() => setIsAddingModalOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/30 cursor-pointer flex-1 md:flex-none"
            >
              <Plus className="w-4 h-4" />
              <span>{isAr ? "إضافة منسوبة جديدة" : "Add Staff Member"}</span>
            </button>
            {staffList.length > 0 && onClearAllStaff && (
              <button
                onClick={() => {
                  if (window.confirm(isAr ? "هل أنتِ متأكدة من رغبتك في حذف جميع المنسوبات من الدليل؟" : "Are you sure you want to clear all staff members?")) {
                    onClearAllStaff();
                  }
                }}
                className="bg-rose-600/30 hover:bg-rose-600 text-rose-100 hover:text-white border border-rose-400/30 text-xs font-bold px-3.5 py-3 rounded-2xl flex items-center justify-center gap-1.5 transition-all cursor-pointer flex-1 md:flex-none"
                title={isAr ? "حذف جميع المنسوبات" : "Clear All Staff"}
              >
                <Trash2 className="w-4 h-4" />
                <span>{isAr ? "حذف الكل" : "Clear All"}</span>
              </button>
            )}
            <button
              onClick={() => onAskAssistant(isAr ? "من هن منسوبات ومديرة مدرسة الثانوية الرابعة والثلاثون؟" : "Who are the staff and principal of Al-Thanawiya 34?")}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-3 rounded-2xl flex items-center justify-center gap-2 transition-all border border-white/15 cursor-pointer flex-1 md:flex-none"
            >
              <MessageSquare className="w-4 h-4 text-yellow-300" />
              <span>{isAr ? "اسأل المساعد الذكي" : "Ask Assistant"}</span>
            </button>
          </div>
        </div>

        {/* QUICK STATS CARDS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-6 border-t border-indigo-800/60">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400/20 text-amber-300 flex items-center justify-center text-lg font-bold">
              👑
            </div>
            <div>
              <div className="text-[10px] text-indigo-300 font-bold">{isAr ? "القيادة المدرسية" : "Leadership"}</div>
              <div className="text-base font-black text-white">{leadershipCount} {isAr ? "قيادية" : "Leaders"}</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-400/20 text-blue-300 flex items-center justify-center text-lg font-bold">
              👩‍🏫
            </div>
            <div>
              <div className="text-[10px] text-indigo-300 font-bold">{isAr ? "الهيئة التعليمية" : "Teachers"}</div>
              <div className="text-base font-black text-white">{teachersCount} {isAr ? "معلمة" : "Teachers"}</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-400/20 text-rose-300 flex items-center justify-center text-lg font-bold">
              🌸
            </div>
            <div>
              <div className="text-[10px] text-indigo-300 font-bold">{isAr ? "الإرشاد والرعاية" : "Counseling"}</div>
              <div className="text-base font-black text-white">{counselingCount} {isAr ? "مرشدة" : "Counselors"}</div>
            </div>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10 flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-400/20 text-emerald-300 flex items-center justify-center text-lg font-bold">
              📋
            </div>
            <div>
              <div className="text-[10px] text-indigo-300 font-bold">{isAr ? "الكادر الإداري" : "Admin Staff"}</div>
              <div className="text-base font-black text-white">{adminCount} {isAr ? "إدارية" : "Support"}</div>
            </div>
          </div>
        </div>
      </div>

      {/* SEARCH AND FILTER TOOLBAR */}
      <div className="flex flex-col gap-4 bg-slate-50 border border-slate-200 p-4 rounded-2xl">
        
        {/* Search Input and Floor selector */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isAr ? "ابحثي باسم المعلمة، التخصص، أو الدور الوظيفي والمكتب..." : "Search staff by name, department, role, or office..."}
              className="w-full bg-white border border-slate-200 rounded-xl ps-10 pe-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-600 shadow-sm"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute end-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Floor quick filter */}
          <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-xl p-1 shadow-sm flex-shrink-0">
            <span className="text-[11px] font-bold text-slate-400 px-2 flex items-center gap-1">
              <Compass className="w-3.5 h-3.5 text-indigo-600" />
              <span>{isAr ? "الدور:" : "Floor:"}</span>
            </span>
            <button
              onClick={() => setSelectedFloor("all")}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === "all" ? "bg-indigo-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr ? "الكل" : "All"}
            </button>
            <button
              onClick={() => setSelectedFloor(0)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === 0 ? "bg-indigo-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr ? "الأرضي" : "G"}
            </button>
            <button
              onClick={() => setSelectedFloor(1)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === 1 ? "bg-indigo-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr ? "الأول" : "1st"}
            </button>
            <button
              onClick={() => setSelectedFloor(2)}
              className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all ${
                selectedFloor === 2 ? "bg-indigo-900 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {isAr ? "الثاني" : "2nd"}
            </button>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer ${
                selectedCategory === cat.id
                  ? "bg-indigo-900 text-white border-indigo-900 shadow-sm"
                  : "bg-white text-slate-600 border-slate-200 hover:bg-slate-100 hover:border-slate-300"
              }`}
            >
              <span>{isAr ? cat.labelAr : cat.labelEn}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-mono ${
                selectedCategory === cat.id ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"
              }`}>
                {cat.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS COUNT & FILTER FEEDBACK */}
      <div className="flex justify-between items-center text-xs text-slate-500 font-medium px-1">
        <span>
          {isAr 
            ? `عرض ${filteredStaff.length} من أصل ${staffList.length} من منسوبات المدرسة`
            : `Showing ${filteredStaff.length} of ${staffList.length} staff members`}
        </span>
        {(searchQuery || selectedCategory !== "all" || selectedFloor !== "all") && (
          <button
            onClick={() => {
              setSearchQuery("");
              setSelectedCategory("all");
              setSelectedFloor("all");
            }}
            className="text-indigo-600 hover:text-indigo-800 font-bold hover:underline cursor-pointer"
          >
            {isAr ? "إعادة ضبط التصفية ↺" : "Reset Filters ↺"}
          </button>
        )}
      </div>

      {/* STAFF CARDS GRID */}
      {staffList.length === 0 ? (
        <div className="text-center py-16 px-4 bg-slate-50/70 border-2 border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-indigo-50 border border-indigo-100 text-indigo-700 flex items-center justify-center text-3xl shadow-sm">
            👥
          </div>
          <div className="space-y-1.5 max-w-md">
            <h4 className="text-base font-black text-slate-800">
              {isAr ? "تم تفريغ وحذف قائمة المنسوبات الحالية" : "Staff Directory is Currently Empty"}
            </h4>
            <p className="text-xs text-slate-500 leading-relaxed font-medium">
              {isAr 
                ? "لا توجد منسوبات مسجلات حالياً. يمكنكِ البدء في إضافة منسوبات المدرسة الفعليات وتحديد أدوارهن ومواقعهن بسهولة عبر زر الإضافة أدناه." 
                : "No staff members currently registered. You can start adding school faculty and staff and assigning their offices using the button below."}
            </p>
          </div>
          <button
            onClick={() => setIsAddingModalOpen(true)}
            className="mt-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black px-5 py-3 rounded-2xl flex items-center gap-2 shadow-lg shadow-emerald-900/20 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>{isAr ? "إضافة منسوبة جديدة الآن" : "Add Staff Member Now"}</span>
          </button>
        </div>
      ) : filteredStaff.length === 0 ? (
        <div className="text-center py-16 bg-slate-50 border border-dashed border-slate-200 rounded-3xl flex flex-col items-center justify-center gap-3">
          <span className="text-4xl text-slate-300">🔍</span>
          <h4 className="text-sm font-black text-slate-700">
            {isAr ? "لم نجد أي منسوبة تطابق معايير البحث" : "No staff members match your query."}
          </h4>
          <p className="text-xs text-slate-400 font-medium max-w-sm">
            {isAr 
              ? "جرّبي البحث باسم آخر أو إزالة التصفية لعرض قائمة جميع المعلمات والإداريات." 
              : "Try searching with a different keyword or resetting filters."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredStaff.map((staff) => {
            const badge = getCategoryBadge(staff.category);

            return (
              <div
                key={staff.id}
                className="bg-white border border-slate-200 hover:border-indigo-500 rounded-2xl p-5 flex flex-col justify-between transition-all shadow-sm hover:shadow-md group relative overflow-hidden"
              >
                {/* Top decorative gradient line */}
                <div className="absolute top-0 start-0 end-0 h-1 bg-gradient-to-r from-indigo-900 via-indigo-600 to-amber-400"></div>

                <div className="space-y-3.5">
                  {/* Category & Floor Tags + Delete button */}
                  <div className="flex justify-between items-start gap-2 pt-1">
                    <span className={`text-[10px] font-black px-2.5 py-1 rounded-lg border ${badge.bg}`}>
                      {badge.label}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-bold bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md border border-slate-200 flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-indigo-600" />
                        <span>{getFloorName(staff.floor)}</span>
                      </span>

                      {onDeleteStaff && (
                        <button
                          onClick={() => onDeleteStaff(staff.id)}
                          title={isAr ? "حذف هذه المنسوبة" : "Delete staff member"}
                          className="text-slate-400 hover:text-rose-600 p-1 hover:bg-rose-50 rounded-md transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Name and Role */}
                  <div className="flex items-start gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-2xl flex-shrink-0 group-hover:scale-105 transition-transform">
                      {staff.avatarIcon || "👩‍🏫"}
                    </div>

                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-black text-slate-800 leading-snug group-hover:text-indigo-950 transition-colors">
                        {isAr ? staff.nameAr : staff.nameEn}
                      </h3>
                      <p className="text-xs font-bold text-indigo-700 mt-0.5 leading-snug line-clamp-1">
                        {isAr ? staff.roleAr : staff.roleEn}
                      </p>
                      <p className="text-[11px] text-slate-500 font-medium mt-0.5 flex items-center gap-1">
                        <Briefcase className="w-3 h-3 text-slate-400 flex-shrink-0" />
                        <span className="truncate">{isAr ? staff.departmentAr : staff.departmentEn}</span>
                      </p>
                    </div>
                  </div>

                  {/* Tasks preview if available */}
                  {staff.tasksAr && staff.tasksAr.length > 0 && (
                    <div className="bg-slate-50/80 rounded-xl p-2.5 border border-slate-100 space-y-1">
                      <div className="text-[10px] font-bold text-slate-400 uppercase flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                        <span>{isAr ? "أبرز المهام والاختصاصات:" : "Key Responsibilities:"}</span>
                      </div>
                      <p className="text-xs text-slate-650 line-clamp-2 leading-relaxed font-medium">
                        {staff.tasksAr[0]}
                      </p>
                    </div>
                  )}

                  {/* Location description */}
                  <div className="text-[11px] text-slate-600 font-medium flex items-start gap-1.5 pt-1">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{isAr ? staff.locationAr : staff.locationEn}</span>
                  </div>
                </div>

                {/* Card Actions Footer */}
                <div className="mt-5 pt-3.5 border-t border-slate-100 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {/* Locate on map button */}
                    <button
                      onClick={() => onLocateRoom(staff.floor, staff.locationRoomId)}
                      className="flex-1 bg-indigo-50 hover:bg-indigo-900 text-indigo-900 hover:text-white border border-indigo-200 hover:border-indigo-900 text-[11px] font-black py-2 px-3 rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                    >
                      <MapPin className="w-3.5 h-3.5" />
                      <span>{isAr ? "عرض الموقع بالخريطة 🗺️" : "Locate on Map"}</span>
                    </button>

                    {/* Details modal button */}
                    <button
                      onClick={() => setSelectedStaff(staff)}
                      className="bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-bold py-2 px-3 rounded-xl flex items-center justify-center transition-all cursor-pointer"
                      title={isAr ? "عرض التفاصيل الكاملة" : "Full Profile"}
                    >
                      <span>{isAr ? "التفاصيل" : "Details"}</span>
                    </button>
                  </div>

                  {/* Quick Ask Assistant Link */}
                  <button
                    onClick={() => onAskAssistant(isAr ? `أخبرني بالتفصيل عن مهام ومكتب ${staff.nameAr} في الثانوية 34` : `Tell me about ${staff.nameEn} and her role in Al-Thanawiya 34`)}
                    className="w-full text-center text-[10px] text-slate-400 hover:text-indigo-600 font-bold flex items-center justify-center gap-1 py-1 hover:underline cursor-pointer"
                  >
                    <MessageSquare className="w-3 h-3 text-indigo-500" />
                    <span>{isAr ? `اسأل الذكاء الاصطناعي عن مهامها` : `Ask assistant about this member`}</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STAFF DETAIL MODAL */}
      {selectedStaff && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-6">
            
            {/* Modal Header */}
            <div className="flex justify-between items-start gap-4">
              <div className="flex items-center gap-3.5">
                <div className="w-14 h-14 rounded-2xl bg-indigo-950 text-white flex items-center justify-center text-3xl shadow-md shadow-indigo-950/20 flex-shrink-0">
                  {selectedStaff.avatarIcon || "👩‍🏫"}
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-black text-slate-900">
                    {isAr ? selectedStaff.nameAr : selectedStaff.nameEn}
                  </h3>
                  <p className="text-xs sm:text-sm font-bold text-indigo-700">
                    {isAr ? selectedStaff.roleAr : selectedStaff.roleEn}
                  </p>
                  <p className="text-xs text-slate-500 font-medium">
                    {isAr ? selectedStaff.departmentAr : selectedStaff.departmentEn}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedStaff(null)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Location & Floor Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-slate-400 uppercase">
                  {isAr ? "المكتب ومكان التواجد:" : "Office & Location:"}
                </div>
                <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-indigo-600 flex-shrink-0" />
                  <span>{isAr ? selectedStaff.locationAr : selectedStaff.locationEn}</span>
                </div>
              </div>

              <button
                onClick={() => {
                  const floor = selectedStaff.floor;
                  const roomId = selectedStaff.locationRoomId;
                  setSelectedStaff(null);
                  onLocateRoom(floor, roomId);
                }}
                className="bg-indigo-900 hover:bg-indigo-950 text-white text-xs font-black px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer self-stretch sm:self-auto justify-center"
              >
                <MapPin className="w-3.5 h-3.5" />
                <span>{isAr ? "الانتقال للخريطة" : "Go to Map"}</span>
              </button>
            </div>

            {/* Tasks & Responsibilities */}
            {selectedStaff.tasksAr && selectedStaff.tasksAr.length > 0 && (
              <div className="space-y-2">
                <h4 className="text-xs font-black text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>{isAr ? "المهام والمسؤوليات الرئيسية:" : "Key Duties & Scope:"}</span>
                </h4>
                <ul className="space-y-2 bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                  {selectedStaff.tasksAr.map((task, idx) => (
                    <li key={idx} className="text-xs text-slate-700 leading-relaxed flex items-start gap-2">
                      <span className="text-emerald-600 font-bold mt-0.5">•</span>
                      <span>{task}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Office Hours & Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {selectedStaff.officeHoursAr && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-black text-amber-800 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isAr ? "ساعات الاستشارة والاستقبال:" : "Office Hours:"}</span>
                  </div>
                  <p className="text-xs font-bold text-amber-950">
                    {isAr ? selectedStaff.officeHoursAr : selectedStaff.officeHoursEn}
                  </p>
                </div>
              )}

              {selectedStaff.extension && (
                <div className="bg-indigo-50/70 border border-indigo-200 rounded-xl p-3 space-y-1">
                  <div className="text-[10px] font-black text-indigo-800 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-indigo-600" />
                    <span>{isAr ? "التحويلة المدرسية:" : "Internal Extension:"}</span>
                  </div>
                  <p className="text-xs font-bold font-mono text-indigo-950">
                    Ext: {selectedStaff.extension}
                  </p>
                </div>
              )}

              {selectedStaff.emailContact && (
                <div className="bg-slate-100 border border-slate-200 rounded-xl p-3 space-y-1 sm:col-span-2">
                  <div className="text-[10px] font-black text-slate-600 flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isAr ? "البريد الإلكتروني المؤسسي:" : "Institutional Email:"}</span>
                  </div>
                  <p className="text-xs font-mono text-slate-800 truncate">
                    {selectedStaff.emailContact}
                  </p>
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedStaff(null)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
              >
                {isAr ? "إغلاق" : "Close"}
              </button>
              <button
                type="button"
                onClick={() => {
                  const staffName = selectedStaff.nameAr;
                  setSelectedStaff(null);
                  onAskAssistant(isAr ? `أخبرني بالتفصيل عن ${staffName} ومهامها في المدرسة` : `Tell me about ${staffName}'s duties`);
                }}
                className="px-5 py-2.5 bg-indigo-900 hover:bg-indigo-950 text-white font-bold text-xs rounded-xl flex items-center gap-2 cursor-pointer shadow-md shadow-indigo-950/20"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>{isAr ? "اسأل المساعد عنها" : "Chat About Her"}</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ADD STAFF MEMBER MODAL */}
      {isAddingModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl border border-slate-200 space-y-5">
            
            <div className="flex justify-between items-center border-b border-slate-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                  ➕
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    {isAr ? "إضافة منسوبة جديدة إلى المدرسة" : "Add New School Staff Member"}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium">
                    {isAr ? "أدخلي بيانات المعلمة أو الإدارية لتوثيقها في دليل المدرسة" : "Record new educator or administrative staff"}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsAddingModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              
              {/* Name & Role */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "الاسم الكامل *" : "Full Name *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    placeholder={isAr ? "مثال: الأستاذة أسماء الزهراني" : "e.g., Ms. Asmaa Al-Zahrani"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "المسمى الوظيفي *" : "Job Title / Role *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formRole}
                    onChange={(e) => setFormRole(e.target.value)}
                    placeholder={isAr ? "مثال: معلمة الفيزياء / وكيلة..." : "e.g., Physics Educator..."}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Category & Department */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "الفئة التصنيفية" : "Category"}
                  </label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value as StaffCategory)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value="teachers">{isAr ? "الهيئة التعليمية (المعلمات)" : "Teachers"}</option>
                    <option value="leadership">{isAr ? "القيادة المدرسية" : "Leadership"}</option>
                    <option value="counseling">{isAr ? "الإرشاد والرعاية الصحية" : "Counseling"}</option>
                    <option value="admin">{isAr ? "الكادر الإداري والمختبرات" : "Admin Staff"}</option>
                    <option value="special">{isAr ? "الموهوبات والتربية الخاصة" : "Special Ed & Gifted"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "القسم / التخصص *" : "Department / Discipline *"}
                  </label>
                  <input
                    type="text"
                    required
                    value={formDepartment}
                    onChange={(e) => setFormDepartment(e.target.value)}
                    placeholder={isAr ? "مثال: قسم العلوم الطبيعية" : "e.g., Natural Sciences Dept"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Floor & Location */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "الدور في المدرسة" : "Floor"}
                  </label>
                  <select
                    value={formFloor}
                    onChange={(e) => setFormFloor(Number(e.target.value) as 0 | 1 | 2)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  >
                    <option value={0}>{isAr ? "الدور الأرضي (Ground Floor)" : "Ground Floor"}</option>
                    <option value={1}>{isAr ? "الدور الأول (First Floor)" : "First Floor"}</option>
                    <option value={2}>{isAr ? "الدور الثاني (Second Floor)" : "Second Floor"}</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "موقع الغرفة أو المكتب" : "Room / Office Description"}
                  </label>
                  <input
                    type="text"
                    value={formLocation}
                    onChange={(e) => setFormLocation(e.target.value)}
                    placeholder={isAr ? "مثال: مكتب معلمات الدور الأول / معمل..." : "e.g., Teachers Lounge 1st floor"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Tasks / Description */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">
                  {isAr ? "المهام والمسؤوليات (كل مهمة في سطر منفصل)" : "Tasks & Responsibilities (one per line)"}
                </label>
                <textarea
                  rows={3}
                  value={formTasks}
                  onChange={(e) => setFormTasks(e.target.value)}
                  placeholder={isAr ? "تدريس المقررات...\nمتابعة الأنشطة الصفية...\nالإشراف على المعامل..." : "Teaching curricula...\nSupervising activities..."}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600 resize-none"
                ></textarea>
              </div>

              {/* Office Hours & Contact */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "أوقات الاستقبال والاستشارة" : "Office Hours"}
                  </label>
                  <input
                    type="text"
                    value={formOfficeHours}
                    onChange={(e) => setFormOfficeHours(e.target.value)}
                    placeholder={isAr ? "مثال: يومياً من 9:30 ص إلى 10:00 ص" : "e.g., Daily 9:30 AM - 10:00 AM"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">
                    {isAr ? "البريد أو التحويلة" : "Email or Extension"}
                  </label>
                  <input
                    type="text"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder={isAr ? "مثال: ext. 205 أو بريد إلكتروني" : "ext. or email"}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-600"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAddingModalOpen(false)}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl cursor-pointer"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                >
                  <span>💾</span>
                  <span>{isAr ? "حفظ وإضافة المنسوبة" : "Save Staff"}</span>
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
