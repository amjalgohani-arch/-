import { Achievement, Period, RoomInfo, StaffMember } from "./types";

export const schoolPrincipal = {
  nameAr: "الأستاذة سحر الهاجري",
  nameEn: "Ms. Sahar Al-Hajri",
  titleAr: "مديرة مدرسة الثانوية الرابعة والثلاثون"
};

// Achievements: حاصلة على التميز ٢٠٢٥ و ٢٠٢٤ سنتين على التوالي
export const schoolAchievements: Achievement[] = [
  {
    id: "excel_2025",
    year: "2025",
    titleAr: "حاصلة على جائزة التميز من وزارة التعليم لعام 2025 (للسنة الثانية على التوالي)",
    titleEn: "Recipient of the Ministry of Education Excellence Award 2025 (For the second consecutive year)",
    icon: "🏆"
  },
  {
    id: "excel_2024",
    year: "2024",
    titleAr: "حاصلة على جائزة التميز من وزارة التعليم لعام 2024",
    titleEn: "Recipient of the Ministry of Education Excellence Award 2024",
    icon: "🥇"
  }
];

// Schedule periods (6:45 AM Assembly, 7:00 AM class, 50 mins each, Sun/Mon 7 periods, other 6 periods)
export const schedulePeriods: Period[] = [
  {
    num: 0,
    nameAr: "الطابور الصباحي",
    nameEn: "Morning Assembly",
    start: "06:45",
    end: "07:00",
    type: "assembly",
    days: "all"
  },
  {
    num: 1,
    nameAr: "الحصة الأولى",
    nameEn: "1st Period",
    start: "07:00",
    end: "07:50",
    type: "class",
    days: "all"
  },
  {
    num: 2,
    nameAr: "الحصة الثانية",
    nameEn: "2nd Period",
    start: "07:50",
    end: "08:40",
    type: "class",
    days: "all"
  },
  {
    num: 3,
    nameAr: "الحصة الثالثة",
    nameEn: "3rd Period",
    start: "08:40",
    end: "09:30",
    type: "class",
    days: "all"
  },
  {
    num: 0,
    nameAr: "فسحة الطالبة والمقصف",
    nameEn: "Recess & Cafeteria Break",
    start: "09:30",
    end: "10:00",
    type: "break",
    days: "all"
  },
  {
    num: 4,
    nameAr: "الحصة الرابعة",
    nameEn: "4th Period",
    start: "10:00",
    end: "10:50",
    type: "class",
    days: "all"
  },
  {
    num: 5,
    nameAr: "الحصة الخامسة",
    nameEn: "5th Period",
    start: "10:50",
    end: "11:40",
    type: "class",
    days: "all"
  },
  {
    num: 6,
    nameAr: "الحصة السادسة",
    nameEn: "6th Period",
    start: "11:40",
    end: "12:30",
    type: "class",
    days: "all"
  },
  {
    num: 0,
    nameAr: "الانصراف اليومي (مبكراً)",
    nameEn: "Early Dismissal (Tue-Thu)",
    start: "12:30",
    end: "12:40",
    type: "dismissal",
    days: "tue-thu"
  },
  {
    num: 7,
    nameAr: "الحصة السابعة",
    nameEn: "7th Period",
    start: "12:30",
    end: "01:20",
    type: "class",
    days: "sun-mon"
  },
  {
    num: 0,
    nameAr: "الانصراف اليومي (مكتمل)",
    nameEn: "Full Dismissal (Sun-Mon)",
    start: "01:20",
    end: "01:30",
    type: "dismissal",
    days: "sun-mon"
  }
];

// Room database for each floor to show reactive information cards on click!
export const groundFloorRooms: RoomInfo[] = [
  {
    id: "main_gate",
    nameAr: "الباب الرئيسي للمدرسة",
    nameEn: "Main School Entrance Gate",
    descriptionAr: "المدخل الرئيسي والافتتاحي للمدرسة لدخول الطالبات والزوار والضيوف.",
    descriptionEn: "The primary entry gate of the school for student arrival, guests, and administrative staff.",
    category: "other"
  },
  {
    id: "right_hallway",
    nameAr: "السيب الطويل (الممر الأيمن)",
    nameEn: "The Long Hallway",
    descriptionAr: "على يمين المدخل الرئيسي، سيب ممتد على نهايته الساحة الخارجية الكبيرة وباب الدخول الآخر للمدرسة.",
    descriptionEn: "A long right-side corridor starting near the main entrance and connecting to the large square backyard.",
    category: "facility"
  },
  {
    id: "big_yard",
    nameAr: "الساحة الخارجية الكبيرة",
    nameEn: "The Large Square Backyard Yard",
    descriptionAr: "ساحة خارجية فسيحة ومربعة الشكل تقريباً، تقع في نهاية السيب الطويل للمدرسة.",
    descriptionEn: "A huge, roughly square-shaped open-air assembly courtyard at the end of the long right hallway.",
    category: "yard"
  },
  {
    id: "cafeteria",
    nameAr: "المقصف والكانتين",
    nameEn: "The School Cafeteria",
    descriptionAr: "يقع على يسار نهاية الساحة الخارجية الكبيرة لتقديم وجبات الفطور الطازجة.",
    descriptionEn: "Located on the left edge at the back of the large open-air yard, providing snacks and drinks during breakthroughs.",
    category: "facility"
  },
  {
    id: "secondary_gate",
    nameAr: "باب الدخول الآخر (الفرعي)",
    nameEn: "Secondary Entrance Door",
    descriptionAr: "باب دخول ثان للمبنى يقع في نهاية السيب والساحة الكبيرة. يؤدي للدرج الثاني ومعامل الممر الأيمن.",
    descriptionEn: "Another access doorway to the school building located at the far right. Leads directly to the 2nd staircase and labs.",
    category: "other"
  },
  {
    id: "left_yard",
    nameAr: "الساحة الخارجية المليئة بالألعاب",
    nameEn: "The Left Playground Active Yard",
    descriptionAr: "تقع على يسار المدخل الرئيسي وتحتوي على ألعاب ترفيهية للطالبات ومواقف سيارات المعلمات.",
    descriptionEn: "An outdoor activity and play area on the left of the main entrance, incorporating recreation set and staff packing.",
    category: "yard"
  },
  {
    id: "teachers_parking",
    nameAr: "مواقف سيارات المعلمات",
    nameEn: "Teachers' Car Parking",
    descriptionAr: "تقع على اليمين داخل الساحة الخارجية المليئة بالألعاب على اليسار لركن سيارات منسوبات التعليم.",
    descriptionEn: "Designated vehicle parking area for directresses and teachers located inside the left playground zone.",
    category: "facility"
  },
  {
    id: "building_entrance",
    nameAr: "مدخل المبنى الرئيسي",
    nameEn: "Main School Building Lobby",
    descriptionAr: "مدخل فسيح يؤدي للممر الداخلي الرئيسي والدرج الملتف.",
    descriptionEn: "The central interior vestibule that opens into the central administrative corridors and stairs.",
    category: "facility"
  },
  {
    id: "main_stairs",
    nameAr: "الدرج الرئيسي الملتف",
    nameEn: "Main Staircase (Left-then-Left)",
    descriptionAr: "الدرج الأساسي للصعود للأدوار العلوية، وللوصول إليه يجب السير في الممر يساراً في يسار.",
    descriptionEn: "The primary stairwell used to ascend to higher floors; reached by following the corridor left-then-left.",
    category: "stair"
  },
  {
    id: "stair_office",
    nameAr: "مكتب إداري جانبي",
    nameEn: "Administrative Side Office",
    descriptionAr: "يقع على يسارك بعد تجاوز الدرج الرئيسي مباشرة، مخصص للأفراد الإداريين وتوجيه الزائرات.",
    descriptionEn: "A administrative office room on the left, situated shortly past the primary loop staircase.",
    category: "admin"
  },
  {
    id: "admin_restroom",
    nameAr: "دورة مياه الإدارة",
    nameEn: "Administration Staff Restroom",
    descriptionAr: "تقع على يمين الممر الإداري بالدور الأرضي مخصصة لتوفير الخصوصية للمنسوبات والمديرة.",
    descriptionEn: "Staff and VIP restroom located on the right of the administrative corridor.",
    category: "facility"
  },
  {
    id: "secretariat",
    nameAr: "مكتب السكرتارية والمتابعة",
    nameEn: "Secretariat Office",
    descriptionAr: "مكتب لتقديم الخدمات الإدارية وسكرتارية المعاملات بجوار مكتب مديرة المدرسة.",
    descriptionEn: "Handles paperwork, correspondence, and supports visitors just adjacent to the Principal's cabinet.",
    category: "admin"
  },
  {
    id: "principal_office",
    nameAr: "مكتب المديرة",
    nameEn: "School Principal's Office",
    descriptionAr: "المكتب القيادي والقلب التنظيمي للمدرسة لرئاسة الثانوية الرابعة والثلاثون.",
    descriptionEn: "The central executive portal of the principal, overseeing the administrative staff and curriculum quality.",
    category: "admin"
  },
  {
    id: "admin_office",
    nameAr: "مكتب الإدارة الرئيسية",
    nameEn: "Main Administration Office",
    descriptionAr: "يقع بعد مكتب المديرة مباشرة ويجمع الطاقم الإداري للإدارة والشؤون الوظيفية للطالبات.",
    descriptionEn: "The administrative workspace for school officials, student affairs, and general operations.",
    category: "admin"
  },
  {
    id: "student_restroom",
    nameAr: "دورة مياه الطالبات الأرضي",
    nameEn: "Ground Student Restroom",
    descriptionAr: "مجموعات خدمات ودورة مياه طالبات فسيحة تقع في نهاية الممر الإداري بالدور الأرضي.",
    descriptionEn: "A cluster of accessible restrooms for female students situated at the absolute end of the main corridor.",
    category: "facility"
  },
  {
    id: "internal_yard",
    nameAr: "الساحة الداخلية للمدرسة",
    nameEn: "Internal Indoor Courtyard",
    descriptionAr: "على شكل مربع تواجه مكاتب الإدارة ومكتب المديرة، ملتقى مركزي دافئ للطالبات.",
    descriptionEn: "The social indoor atrium faced directly by the administration row and classrooms.",
    category: "yard"
  },
  {
    id: "kitchen",
    nameAr: "مطبخ المدرسة",
    nameEn: "School Kitchen",
    descriptionAr: "يقع مباشرة أمام دورة مياه الطالبات في نهاية الممر لتنظيم الضيافة والمأكولات بالدور الأرضي.",
    descriptionEn: "A dedicated kitchen facility for staff and catering setups, situated directly opposite of the restroom.",
    category: "facility"
  },
  {
    id: "theater",
    nameAr: "المسرح المدرسي 🎭",
    nameEn: "School Theater / Main Stage",
    descriptionAr: "مسرح فسيح مجهز بالكامل للمناسبات والمحاضرات والعروض، يقع على يمين نهاية ممر الإدارة الأرضي.",
    descriptionEn: "The fully equipped school theatre stage for ceremonies, exhibitions, and lectures. Located on the right end of the corridor.",
    category: "facility"
  },
  {
    id: "second_stairs",
    nameAr: "الدرج الثاني",
    nameEn: "Secondary Staircase",
    descriptionAr: "درج ثانٍ للصعود يقع يسار المدخل الآخر الفرعي للمدرسة في الجدار الشرقي.",
    descriptionEn: "The backup stairwell located on the left near the secondary entrance for smooth visitor transitions.",
    category: "stair"
  },
  {
    id: "health_counselor",
    nameAr: "غرفة المرشدة الصحية",
    nameEn: "Health Counselor's Office",
    descriptionAr: "تقع في الممر الأيمن للمدخل الفرعي لتقديم التوعية الصحية والرعاية الطبية الأولية للطالبات.",
    descriptionEn: "Ensures wellness, health directives, and implements medical first-aid. Located on the corridor near the secondary gate.",
    category: "admin"
  },
  {
    id: "resources_room",
    nameAr: "غرفة مصادر التعلم",
    nameEn: "Learning Resources Center",
    descriptionAr: "مكتبة وثقافة ووسائل إيضاحية مجهزة بالكتب والحواسيب في الممر الأيمن للثانوية الرابعة والثلاثون.",
    descriptionEn: "The library and electronic reading salon, supporting student research with technical equipment.",
    category: "lab"
  },
  {
    id: "physics_lab",
    nameAr: "معمل الفيزياء المطور 🔬",
    nameEn: "Advanced Physics Laboratory",
    descriptionAr: "معمل علمي مجهز بالأدوات المخبرية والدراسات الفيزيائية في ممر المدخل الفرعي.",
    descriptionEn: "A modern science laboratory equipped with physics experimental tools, circuits, and learning modules.",
    category: "lab"
  },
  {
    id: "sports_club",
    nameAr: "النادي الرياضي (الجدار الرابع)",
    nameEn: "The Sports Gym & Club",
    descriptionAr: "جزء مخصص للأنشطة البدنية والرياضية والمحافظة على اللياقة وصحة الطالبات بـ٣٤.",
    descriptionEn: "Durable indoor sports facility and activity zone representing the fourth perimeter block.",
    category: "facility"
  },
  {
    id: "storage_ground",
    nameAr: "مستودع الأجهزة والمواد",
    nameEn: "Ground Storage",
    descriptionAr: "غرفة تخزين وتأمين للأدوات واللوجستيات والمخزون المادي والمدرسي.",
    descriptionEn: "A secure storage cellar keeping school furniture, science props, and materials intact.",
    category: "other"
  },
  {
    id: "biology_lab",
    nameAr: "معمل الأحياء والعلوم 🧬",
    nameEn: "Biology & General Science Lab",
    descriptionAr: "معمل علمي راق ومطور بـ٣٤ للعلوم الحيوية والمجاهر وعينات الأحياء الميدانية.",
    descriptionEn: "Fully equipped life science laboratory featuring microscopy stations and biological specimens.",
    category: "lab"
  },
  {
    id: "meeting_room",
    nameAr: "غرفة الاجتماعات الكبرى",
    nameEn: "Grand Meetings Boardroom",
    descriptionAr: "غرفة مخصصة للاجتماعات القيادية وإدارة جلسات المعلمات ومجلس الإدارة بـ٣٤.",
    descriptionEn: "The central corporate meeting hall hosting school board conventions, teachers, and principal reviews.",
    category: "admin"
  }
];

export const firstFloorRooms: RoomInfo[] = [
  {
    id: "student_counselor",
    nameAr: "غرفة المرشدة الطلابية",
    nameEn: "Student Counselor's Cabinet",
    descriptionAr: "تقع على يسارك مباشرة عند صعود الدرج الأول، مخصصة للتوجيه والإرشاد النفسي والأكاديمي للطالبات.",
    descriptionEn: "A counseling sanctuary adjacent to the main stairs for emotional, occupational, and academic student advice.",
    category: "admin"
  },
  {
    id: "teachers_room_1",
    nameAr: "مكتب معلمات الدور الأول",
    nameEn: "First Floor Teachers' Lounge",
    descriptionAr: "مجموعة مكاتب مخصصة لمعلمات الدور الأول للتحضير والاستراحة.",
    descriptionEn: "Main relaxation and lesson planning workspace for standard first-floor lecturers.",
    category: "admin"
  },
  {
    id: "class_1_1",
    nameAr: "فصل أولى أول (1/1)",
    nameEn: "Classroom Year 1/1",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الأول الثانوي (الشعبة الأولى).",
    descriptionEn: "Sleek classroom designated for first-grade high school pupils, core division 1.",
    category: "class"
  },
  {
    id: "class_1_2",
    nameAr: "فصل أولى ثاني (1/2)",
    nameEn: "Classroom Year 1/2",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الأول الثانوي (الشعبة الثانية).",
    descriptionEn: "Structured study chamber for Year 1 standard, group 2.",
    category: "class"
  },
  {
    id: "class_1_3",
    nameAr: "فصل أولى ثالث (1/3)",
    nameEn: "Classroom Year 1/3",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الأول الثانوي (الشعبة الثالثة).",
    descriptionEn: "General secondary classroom hosting students of year 1, stream 3.",
    category: "class"
  },
  {
    id: "class_1_4",
    nameAr: "فصل أولى رابع (1/4)",
    nameEn: "Classroom Year 1/4",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الأول الثانوي (الشعبة الرابعة).",
    descriptionEn: "Well-ventilated learning division for secondary Year 1, group 4.",
    category: "class"
  },
  {
    id: "class_1_5",
    nameAr: "فصل أولى خامس (1/5)",
    nameEn: "Classroom Year 1/5",
    descriptionAr: "يقع في نهاية الممر مخصص لشعبة أولى خامس بالصف الأول الثانوي.",
    descriptionEn: "End-of-corridor learning salon welcoming student population of stream 1/5.",
    category: "class"
  },
  {
    id: "storage_1",
    nameAr: "مستودع الدور الأول",
    nameEn: "First Floor Storage",
    descriptionAr: "يقع في الجدار الثاني، مخصص لحفظ الوسائل والمطبوعات التابعة للدور الأول.",
    descriptionEn: "Secondary depot on the first floor for educational reserves, charts, and materials.",
    category: "other"
  },
  {
    id: "cafe_1",
    nameAr: "مقهى المعلمات والطالبات ☕",
    nameEn: "School Bistro (First Floor Cafe)",
    descriptionAr: "يقع بالجدار الثاني، ملتقى رائع ومبهج يضم مشروبات ساخنة وخفيفة للترويح والفسحة.",
    descriptionEn: "A neat boutique cafe corner introducing a cozy mood for students and teachers to refresh.",
    category: "facility"
  },
  {
    id: "class_1_6",
    nameAr: "فصل أولى سادس (1/6)",
    nameEn: "Classroom Year 1/6",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الأول الثانوي (الشعبة السادسة).",
    descriptionEn: "Academic study division supporting the classes of year 1, group 6.",
    category: "class"
  },
  {
    id: "class_1_7",
    nameAr: "فصل أولى سابع (1/7)",
    nameEn: "Classroom Year 1/7",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الأول الثانوي (الشعبة السابعة).",
    descriptionEn: "Designated high-high school classroom, serving first-grade segment number 7.",
    category: "class"
  },
  {
    id: "class_1_integration",
    nameAr: "فصل أولى دمج لبرامج التربية الخاصة",
    nameEn: "First Grade Special Integration Class",
    descriptionAr: "فصل مجهز خصيصًا لدعم ودمج طالبات ذوي الاحتياجات التعليمية الخاصة بالصف الأول.",
    descriptionEn: "Specialized inclusive learning suite built to comfortably accommodate integrated students on the 1st Floor.",
    category: "class"
  },
  {
    id: "iseham_room",
    nameAr: "غرفة مبادرة إسهام للأنشطة",
    nameEn: "Iseham Community & Activities Room",
    descriptionAr: "غرفة إبداع حيوية في الجدار الثالث، مخصصة لورش العمل والبرامج الطلابية المبتكرة بـ٣٤.",
    descriptionEn: "Creativity incubator space designed for social projects, activities, and student collaborative work.",
    category: "facility"
  },
  {
    id: "class_2_integration",
    nameAr: "فصل ثاني دمج لبرامج التربية الخاصة",
    nameEn: "Second Grade Special Integration Class",
    descriptionAr: "فصل مخصص لدمج الطالبات من ذوي التقديرات الخاصة بالصف الثاني الثانوي.",
    descriptionEn: "Special education inclusive chamber hosting Year 2 combined capabilities population.",
    category: "class"
  },
  {
    id: "inspectors_office",
    nameAr: "مكتب المراقبات والمتابعة",
    nameEn: "Supervisors & Inspectors Office",
    descriptionAr: "مكتب متابعة انضباط الطالبات وتنظيم الغياب والتوجيه اليومي.",
    descriptionEn: "Supervisory outpost managing student attendance, corridors discipline, and daily compliance logs.",
    category: "admin"
  },
  {
    id: "computer_lab",
    nameAr: "معمل الحاسب الآلي 💻",
    nameEn: "Technology & Computer Laboratory",
    descriptionAr: "يسهل تدريب الطالبات على البرمجة، والتقنيات وعلم البيانات بـ٣٤.",
    descriptionEn: "Main computing hub housing network workstations, programming facilities, and digital learning classes.",
    category: "lab"
  },
  {
    id: "vice_principal",
    nameAr: "مكتب وكيلة المدرسة الموقرة",
    nameEn: "Vice Principal's Cabinet",
    descriptionAr: "مكتب القيادة الثاني بـ٣٤ لمتابعة الشؤون التعليمية والبرامج والجداول الدراسية.",
    descriptionEn: "Executive hub for the assistant principal, regulating curriculum progression, schedules, and staff portfolios.",
    category: "admin"
  },
  {
    id: "student_restroom_1",
    nameAr: "دورة مياه الطالبات (أعلى الدور الأرضي)",
    nameEn: "First Floor Girls Restroom",
    descriptionAr: "تقع تمامًا وبشكل مباشر فوق دورة مياه الطالبات بالدور الأرضي لتنظيم التدفق والمرافق.",
    descriptionEn: "Primary campus sanitary restroom facility situated directly above its ground floor counterpart.",
    category: "facility"
  },
  {
    id: "teachers_restroom_1",
    nameAr: "دورة مياه المعلمات (داخل القسم الجانبي)",
    nameEn: "Staff Dedicated Restroom",
    descriptionAr: "تقع على يسار المدخل كجزء من القسم الخاص للإدارة والمعلمات بـ٣٤.",
    descriptionEn: "Restroom cabinet specifically constructed on the left inside the teachers quiet block section.",
    category: "facility"
  },
  {
    id: "breakfast_room",
    nameAr: "غرفة الفطور وتناول الوجبات",
    nameEn: "Staff Breakfast Room",
    descriptionAr: "غرفة استراحة لطيفة للمعلمات لتناول الفطور والمشروبات خلال الفسحة اليومية.",
    descriptionEn: "A cozy dining flat where educators gather to take breaks and sip morning beverages during recess.",
    category: "facility"
  },
  {
    id: "teachers_restroom_room",
    nameAr: "غرفة معلمات إضافية",
    nameEn: "Secondary Teachers Lounge",
    descriptionAr: "غرفة مخصصة لمكاتب معلمات الدور الأول الإضافية والتحضير التعليمي الصباحي.",
    descriptionEn: "Secondary workspace designated for educators on the first floor for testing preparations.",
    category: "admin"
  },
  {
    id: "archive_room",
    nameAr: "غرفة الأرشيف المدرسي والسجلات",
    nameEn: "School Archives & Registry Room",
    descriptionAr: "تقع على يسار القسم المخصص، وهي خزانة وسجلات المدرسة والنتائج والوثائق التاريخية بـ٣٤.",
    descriptionEn: "Storage vault on the left containing the physical files, registration records, and historic student profiles.",
    category: "other"
  }
];

export const secondFloorRooms: RoomInfo[] = [
  {
    id: "office_2_stairs",
    nameAr: "مكتب إداري (بجوار السلم الثاني)",
    nameEn: "Mains Stair Side Office",
    descriptionAr: "على يمين صعود الدرج الأول لمتابعة وتنظيم الدور الثاني المدرسي.",
    descriptionEn: "Supervisory administrative cabin on the right upon boarding the second floor level.",
    category: "admin"
  },
  {
    id: "teachers_room_2",
    nameAr: "غرفة معلمات الدور الثاني",
    nameEn: "2nd Floor Teachers' Staff Lounge",
    descriptionAr: "مخصصة لتوفير مكاتب وراحة لمعلمات فصول ثاني وثالث ثانوي.",
    descriptionEn: "A collective room welcoming second-floor high school instructors for recess, testing corrections and prep work.",
    category: "admin"
  },
  {
    id: "class_2_biz",
    nameAr: "فصل الصف الثاني إدارة أعمال 📊",
    nameEn: "Classroom Year 2 Business Admin",
    descriptionAr: "الشعبة المتخصصة لمسارات إدارة الأعمال والمالية للصف الثاني ثانوي.",
    descriptionEn: "Specialized commerce track cabin preparing Year 2 students for modern business modeling concepts.",
    category: "class"
  },
  {
    id: "class_2_1",
    nameAr: "فصل ثاني أول (2/1)",
    nameEn: "Classroom Year 2/1",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الثاني الثانوي (الشعبة الأولى - العام).",
    descriptionEn: "General secondary classroom hosting second-year students of group 1.",
    category: "class"
  },
  {
    id: "class_2_2",
    nameAr: "فصل ثاني ثاني (2/2)",
    nameEn: "Classroom Year 2/2",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الثاني الثانوي (الشعبة الثانية - العام).",
    descriptionEn: "General secondary classroom hosting second-year students of group 2.",
    category: "class"
  },
  {
    id: "class_2_3",
    nameAr: "فصل ثاني ثالث (2/3)",
    nameEn: "Classroom Year 2/3",
    descriptionAr: "فصل دراسي لتعليم طالبات الصف الثاني الثانوي (الشعبة الثالثة - العام).",
    descriptionEn: "General secondary classroom hosting second-year students of group 3.",
    category: "class"
  },
  {
    id: "class_2_4",
    nameAr: "فصل ثاني رابع (2/4)",
    nameEn: "Classroom Year 2/4",
    descriptionAr: "الشعبة الخامسة والأخيرة لثواني (المدرسة تشتمل فقط على ٥ فصول للصف الثاني ثانوي).",
    descriptionEn: "Core student group 4 representing the final of the 5 sophomore classrooms (Business + 4 general).",
    category: "class"
  },
  {
    id: "unknown_room",
    nameAr: "غرفة غير مسماة (❓)",
    nameEn: "Unnamed Activity Room",
    descriptionAr: "مساحة مرسومة في الجدار الثاني بدال المقهى، مخصصة للمنشآت المرنة غير المحددة.",
    descriptionEn: "An unnamed room displayed in the blueprint draft in place of the first floor's cafe corner.",
    category: "other"
  },
  {
    id: "class_3_integration",
    nameAr: "فصل ثالث دمج لبرامج التربية الخاصة",
    nameEn: "Third Grade Special Integration Class",
    descriptionAr: "فصل دراسي مدمج لدعم الطالبات المتخرجات من التخصصات التربوية والخاصة.",
    descriptionEn: "Special inclusion learning room serving senior Year 3 students with custom educational demands.",
    category: "class"
  },
  {
    id: "class_3_biz",
    nameAr: "فصل الصف الثالث إدارة أعمال 📈",
    nameEn: "Classroom Year 3 Business Admin",
    descriptionAr: "مسار إدارة الأعمال العام والمالية المتقدم للمستوى النهائي الخريجات.",
    descriptionEn: "Business administration senior classroom for Year 3 business majors preparing to graduate.",
    category: "class"
  },
  {
    id: "class_3_1",
    nameAr: "فصل ثالث أول (3/1)",
    nameEn: "Classroom Year 3/1",
    descriptionAr: "فصل الصف الثالث ثانوي (الشعبة الأولى - خريجات).",
    descriptionEn: "High school senior classroom housing division Year 3, stream 1.",
    category: "class"
  },
  {
    id: "class_3_2",
    nameAr: "فصل ثالث ثاني (3/2)",
    nameEn: "Classroom Year 3/2",
    descriptionAr: "فصل الصف الثالث ثانوي (الشعبة الثانية - خريجات).",
    descriptionEn: "High school senior classroom housing division Year 3, stream 2.",
    category: "class"
  },
  {
    id: "class_3_3",
    nameAr: "فصل ثالث ثالث (3/3)",
    nameEn: "Classroom Year 3/3",
    descriptionAr: "فصل الصف الثالث ثانوي (الشعبة الثالثة - خريجات).",
    descriptionEn: "High school senior classroom housing division Year 3, stream 3.",
    category: "class"
  },
  {
    id: "class_3_4",
    nameAr: "فصل ثالث رابع (3/4)",
    nameEn: "Classroom Year 3/4",
    descriptionAr: "فصل الصف الثالث ثانوي (الشعبة الرابعة - خريجات).",
    descriptionEn: "High school senior classroom housing division Year 3, stream 4.",
    category: "class"
  },
  {
    id: "class_3_5",
    nameAr: "فصل ثالث خامس (3/5)",
    nameEn: "Classroom Year 3/5",
    descriptionAr: "فصل الصف الثالث ثانوي (الشعبة الخامسة - خريجات).",
    descriptionEn: "High school senior classroom housing division Year 3, stream 5.",
    category: "class"
  },
  {
    id: "class_3_6",
    nameAr: "فصل ثالث سادس (3/6)",
    nameEn: "Classroom Year 3/6",
    descriptionAr: "الفصل السادس من شعب الصف الثالث ثانوي للخريجات.",
    descriptionEn: "Stream 6 of the main senior high class divisions.",
    category: "class"
  },
  {
    id: "student_council",
    nameAr: "غرفة المجلس الطلابي 🗳️",
    nameEn: "Student Council Chamber",
    descriptionAr: "تقع في الجدار الثالث بدلاً من غرفة إسهام، مركز قيادي وتنفيذي مميز لطالبات المجلس الممثل بـ٣٤.",
    descriptionEn: "The collaborative student council office fostering leadership assembly and project discussions among students.",
    category: "facility"
  },
  {
    id: "inspectors_office_2",
    nameAr: "مكتب المراقبات والمتابعة - الدور الثاني",
    nameEn: "Supervisors Monitoring Cabin",
    descriptionAr: "مقر المراقبات لمتابعة نظام ومنجزات الطالبات والدور الثاني.",
    descriptionEn: "Monitoring workstation overseeing senior student attendance and upper-level hallway tracking.",
    category: "admin"
  },
  {
    id: "teachers_room_3",
    nameAr: "غرفة معلمات الدور الثاني الإضافية",
    nameEn: "Additional 2nd Floor Staff Room",
    descriptionAr: "غرفة إضافية لراحة معلمات المواد العامة والتحضير التعليمي بـ٣٤.",
    descriptionEn: "Additional space dedicated for second-floor instructors' logistics and exam preparation.",
    category: "admin"
  },
  {
    id: "class_3_7",
    nameAr: "فصل ثالث سابع (3/7)",
    nameEn: "Classroom Year 3/7",
    descriptionAr: "فصل دراسي إضافي لتعليم طالبات السنة النهائية الخريجات الشعبة السابعة.",
    descriptionEn: "Inclusive classroom division serving the 7th stream of high school senior girls.",
    category: "class"
  },
  {
    id: "class_3_8",
    nameAr: "فصل ثالث ثامن (3/8)",
    nameEn: "Classroom Year 3/8",
    descriptionAr: "فصل دراسي إضافي لتعليم طالبات السنة النهائية الخريجات الشعبة الثامنة.",
    descriptionEn: "Inclusive classroom division serving the 8th stream of high school senior girls.",
    category: "class"
  },
  {
    id: "student_restroom_2",
    nameAr: "دورة مياه الطالبات (أعلى الدور الأول والعلوي)",
    nameEn: "Second Floor Student Restroom",
    descriptionAr: "تقع في نفس موقع دورة مياه الطالبات بالطوابق السفلية لتسهيل الوصول والتوجيه الصحي بالمدرسة.",
    descriptionEn: "The upper-level student sanitation suite, situated precisely above its corresponding spots below.",
    category: "facility"
  },
  {
    id: "class_3_9",
    nameAr: "فصل ثالث تاسع (3/9)",
    nameEn: "Classroom Year 3/9",
    descriptionAr: "فصل دراسي إضافي لتعليم طالبات السنة النهائية الخريجات الشعبة التاسعة.",
    descriptionEn: "Upper stream classroom division serving Year 3 student segment number 9.",
    category: "class"
  },
  {
    id: "class_3_10",
    nameAr: "فصل ثالث عاشر (3/10)",
    nameEn: "Classroom Year 3/10",
    descriptionAr: "فصل دراسي إضافي لتعليم طالبات السنة النهائية الخريجات الشعبة العاشرة بـ٣٤.",
    descriptionEn: "Final senior high classroom stream number 10, located on the far edge of the second floor block.",
    category: "class"
  },
  {
    id: "teachers_restroom_2",
    nameAr: "دورة مياه المعلمات (الدور الثاني)",
    nameEn: "Second Floor Teachers Restroom",
    descriptionAr: "مرفق صحي مخصص لمعلمات الدور الثاني يقع على يسار القسم الجانبي لراحة المعلمات.",
    descriptionEn: "Teachers sanitary utility located inside the right-wing section for staff ease.",
    category: "facility"
  }
];

export const schoolFaq = [
  {
    q: "هل الطابور الصباحي إلزامي ومتى يبدأ؟",
    qEn: "Is morning assembly mandatory and when does it start?",
    a: "نعم، الطابور الصباحي إلزامي جدًا لكافة الطالبات ومسؤولات التعليم لتأدية الإذاعة والتمارين الصباحية وبث الهمة والروح الوطنية، ويبدأ يوميًا في تمام الساعة 6:45 صباحاً.",
    aEn: "Yes, it is highly mandatory. It starts daily at 6:45 AM, focusing on the broadcasting, morning drills, and values of the nation."
  },
  {
    q: "متى تبدأ وتنتهي الحصص بحسب جدول المدرسة الجديد؟",
    qEn: "When do periods start and end according to the new school schedule?",
    a: "تبدأ الحصة الأولى الساعة 7:00 ص، مدة كل حصة 50 دقيقة. الفسحة تبدأ الساعة 9:30 ص حتى 10:00 ص. الأحد والاثنين يحتوي الجدول على 7 حصص (انصراف 1:20 م)، بينما باقي أيام الأسبوع من الثلاثاء للخميس يحتوي الجدول على 6 حصص فقط (انصراف 12:30 م).",
    aEn: "The 1st period starts at 7:00 AM. Each class is 50 mins. Break is from 9:30 AM to 10:00 AM. Sunday/Monday feature 7 periods (dismissal at 1:20 PM), and Tuesday-Thursday feature 6 periods (dismissal at 12:30 PM)."
  },
  {
    q: "ما هي إنجازات وتكريم المدرسة مؤخرًا؟",
    qEn: "What are the school's achievements and awards recently?",
    a: "تفخر الثانوية الرابعة والثلاثون بكونها مدرسة نموذجية حاصلة على جائزة التميز من وزارة التعليم لعامي 2024 و 2025م لسنتين متتاليتين على التوالي، وذلك نظير الأداء المنهجي المتميز لطاقمنا التعليمي المبدع.",
    aEn: "Al-Thanawiya 34 is proud to have won the prestigious Ministry of Education Excellence Award for two consecutive years, in 2024 and 2025, reflecting our premier pedagogical quality."
  },
  {
    q: "أين يقع معمل الفيزياء ومعمل الأحياء ومكتب المديرة؟",
    qEn: "Where are the physics/biology labs and the principal's office?",
    a: "تقع جميع هذه المرافق في الدور الأرضي لتسهيل الحركة: معمل الفيزياء في ممر المدخل الفرعي الأيمن بجوار غرفة المصادر، معمل الأحياء في الجدار الرابع المحيط بالساحة الداخلية، ومكتب مديرة المدرسة في الممر الإداري الرئيسي بجوار مكتب السكرتارية.",
    aEn: "All are on the ground floor: Physics lab is in the right wing corridor near learning resources; Biology lab is along the fourth wall around the central atrium; Principal's office is along the main admin hallway next to the secretariat."
  },
  {
    q: "كيف أتواصل مع المرشدة الطلابية أو الصحية بالمدرسة؟",
    qEn: "How do I reach the student counselor or health counselor?",
    a: "مكتب الإرشاد الصحي يقع في الدور الأرضي بالممر الأيمن للمدخل الفرعي لتقديم المساعدة الفورية، بينما تقع غرفة المرشدة الطلابية في الدور الأول على يسارك مباشرة عند صعود الدرج الرئيسي الملتف.",
    aEn: "The health counselor office is located on the ground floor near the secondary entrance corridor. The senior student counselor cabinet is situated on the 1st floor immediately to the left upon ascending the main staircase."
  }
];

// دليل منسوبات مدرسة الثانوية الرابعة والثلاثون بجدة (Staff & Faculty Directory)
export const schoolStaffMembers: StaffMember[] = [];
