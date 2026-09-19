import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // Lazy initialize Gemini client to remain resilient
  let aiClient: GoogleGenAI | null = null;
  function getGeminiClient() {
    if (!aiClient) {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
        throw new Error("GEMINI_API_KEY is not configured in environment variables.");
      }
      aiClient = new GoogleGenAI({
        apiKey: apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
    return aiClient;
  }

  // API Chat Endpoint
  app.post("/api/chat", async (req, res) => {
    try {
      const { messages, lang, events, staff } = req.body;
      const isAr = lang === "ar";

      // Formulate custom school events context
      let eventsContext = "";
      if (Array.isArray(events) && events.length > 0) {
        eventsContext = events.map((ev: any, index: number) => 
          `- فعالية ${index + 1}: الاسم: "${ev.title}"، التوقيت: ${ev.time}، التاريخ: ${ev.date}${ev.location ? `، الموقع: ${ev.location}` : ""}${ev.description ? `، التفاصيل والهدف: ${ev.description}` : ""}`
        ).join("\n");
      } else {
        eventsContext = isAr ? "لا توجد فعاليات أو أنشطة مخصصة مضافة حالياً في المدرسة." : "No custom school events have been added yet.";
      }

      // Formulate staff directory context
      let staffContext = "";
      if (Array.isArray(staff) && staff.length > 0) {
        staffContext = staff.map((s: any) => 
          `- ${s.nameAr || s.nameEn} (${s.roleAr || s.roleEn} - ${s.departmentAr || s.departmentEn}): الموقع: ${s.locationAr || s.locationEn}${s.officeHoursAr ? `، أوقات الاستقبال: ${s.officeHoursAr}` : ""}${s.tasksAr && s.tasksAr.length > 0 ? `، المهام: ${s.tasksAr.join("؛ ")}` : ""}`
        ).join("\n");
      } else {
        staffContext = isAr ? "دليل منسوبات المدرسة فارغ حالياً بعد تفريغ القائمة، ويمكن إضافة كادر المدرسة عبر تبويب منسوبات المدرسة." : "The staff directory is currently empty.";
      }

      // Verify API Key and handle missing key gracefully with professional fallbacks
      let client;
      let hasApiKey = true;
      try {
        client = getGeminiClient();
      } catch (keyError) {
        hasApiKey = false;
        console.warn("Gemini API key is not configured. Using intelligent fallback handler.");
      }

      const lastUserMessage = (messages[messages.length - 1]?.text || "").toLowerCase();

      const getFallbackText = (msg: string, isAr: boolean) => {
        const query = msg.toLowerCase().trim();
        if (isAr) {
          // Greeting & Chat Handler
          if (
            query === "سلام" || 
            query === "س" ||
            query === "سلام عليكم" ||
            query === "السلام عليكم" ||
            query === "السلام" ||
            query.startsWith("سلام") || 
            query.includes("مرحبا") || 
            query.includes("مرحباً") || 
            query.includes("هلا") || 
            query.includes("أهلاً") || 
            query.includes("اهلاً") || 
            query.includes("أهلين") || 
            query.includes("اهلين") || 
            query.includes("كيف الحال") || 
            query.includes("كيفك") || 
            query.includes("اخبارك") || 
            query.includes("أخبارك") || 
            query.includes("شلونك") || 
            query.includes("سولف") || 
            query.includes("تحدث") || 
            query.includes("صباح الخير") || 
            query.includes("مساء الخير") || 
            query.includes("هاي") || 
            query.includes("هلو") || 
            query.includes("كيف حالك") || 
            query.includes("أهلاً بك") || 
            query.includes("من انت") || 
            query.includes("من أنت")
          ) {
            return "وعليكم السلام ورحمة الله وبركاته! يا مئة مرحباً بكِ. أنا رفيقكِ ومساعدكِ الذكي 'مضياف' 🎓✨ الحمد لله أنا بأفضل حال وطاقتي مفعمة بالحيوية لمساعدتكِ اليوم! لا تقيدي أسئلتكِ بأسوار المدرسة فقط، بل يمكنكِ سؤالي ومناقشتي في أي موضوع علمي، أو استفسار عام، أو حتى مساعدتكِ في فهم المناهج الدراسية والتخطيط ليومكِ الدراسي المتميز. بماذا تودين أن نبدأ حوارنا الشيق الآن؟ 🌸";
          }

          if (query.includes("فعالي") || query.includes("نشاط") || query.includes("برنامج") || query.includes("مناسب")) {
            return `فعاليات وأنشطة الثانوية الرابعة والثلاثون الحالية هي:\n${eventsContext}\n\nيسعدني جداً توجيهك للموقع أو الموعد لأي فعالية ترغبين بها!`;
          } else if (
            query.includes("النشيد الوطني") || 
            query.includes("نشيد الوطني") || 
            query.includes("نشيد وطني") || 
            query.includes("النشيد") || 
            query.includes("سارعي للمجد") || 
            query.includes("سارعي") || 
            query.includes("عاش الملك") || 
            query.includes("النشيد السعودي") || 
            query.includes("نشيد السعودية")
          ) {
            return `بكل فخر، عتزاز، نردد، في طابورنا الصباحي، ومناسبتنا الوطنية، نشيدنا الغالي:

** سارعي للملْمَجدِ وَالْعَلْيَاءِ**

** مَجدِي لِخَالِقِ السَّمَاء **

* * وَارْفَعِي الْخَفَّاقَ أَخْضَر**

** يَحْمِلُ النُّورَ الْمُسَطَّرَ**

** رَدِّدِي اللَّهُ أَكْبَر**

** يَا مَوْطِنِي **

** مَوْطِنِي عِشْتَ فَخَرَ الْمُسْلِمِينَ **

** عَاشِ الْمَلِيكُ لِلْعَلَمُ وَالْوَطَنِ **

دام عزّ وطننا الغالي ودامت أفراحنا -`;
          } else if (
            query.includes("رياضيات") || 
            query.includes("معادلة") || 
            query.includes("حساب") ||
            query.includes("تفاضل") ||
            query.includes("تكامل") ||
            query.includes("جبر") ||
            query.includes("هندسة")
          ) {
            return `أهلاً بكِ يا مبدعة! بصفتي رفيقكِ الذكي "مضياف" 🎓، يسعدني جداً مساعدتكِ في مادة الرياضيات الجميلة وتبسيطها. هل تودين مراجعة قوانين التفاضل والتكامل، فهم المصفوفات والجبر، أو حساب النسب المثلثية؟ أرسلي لي تفاصيل معادلتكِ أو سؤالكِ وسأقوم بشرح الخطوات لكِ فوراً لتصبحي متميزة دائماً! ✖️➕`;
          } else if (
            query.includes("فيزياء") || 
            query.includes("كيمياء") || 
            query.includes("احياء") || 
            query.includes("أحياء") || 
            query.includes("علوم") ||
            query.includes("علمي") ||
            query.includes("خلية") ||
            query.includes("ذرة") ||
            query.includes("تفاعل")
          ) {
            return `أهلاً بكِ يا عالمة المستقبل الواعدة! 🧪⚡ في مجالات العلوم والفيزياء والكيمياء والأحياء ممتعة للغاية. أنا هنا معكِ لتسهيل فهم أي قانون (مثل قوانين نيوتن للحركة، الروابط الكيميائية، معادلات الأكسدة والاختزال، التركيب الخلوي، أو علم الأرض والفضاء). حددي لي السؤال أو المفهوم العلمي الذي تدرسينه لنبسطه معاً خطوة بخطوة بالذكاء والمعرفة الشاملة!`;
          } else if (
            query.includes("انجليزي") || 
            query.includes("إنجليزي") || 
            query.includes("english") ||
            query.includes("ترجم") ||
            query.includes("قواعد")
          ) {
            return `Hello there, brilliant student! 🇬🇧✨ As "Mudhiyaf", I can absolutely help you master your English curriculum, understand challenging grammar rules (like tenses, active/passive voice, relative clauses, and prepositions), translate phrases, or practice conversation and vocabulary. Just let me know what study topic is on your mind today, and let's excel together!`;
          } else if (
            query.includes("عربي") || 
            query.includes("نحو") || 
            query.includes("بلاغة") || 
            query.includes("أدب") ||
            query.includes("اعراب") ||
            query.includes("إعراب") ||
            query.includes("قصيدة")
          ) {
            return `لغة الضاد الجميلة مبعث فخرنا وثقافتنا! 📚✍️ بصفتي "مضياف"، يسعدني إرشادكِ في فهم قواعد النحو والصرف (مثل إعراب الجمل، كان وأخواتها، الفاعل والمفعول به، المنصوبات والمجرورات) أو تذوق الصور البلاغية والمجازية في مادة الأدب والبلاغة والقصائد الشعرية. شاركيني النص أو القاعدة وسأبسطها لكِ بكل حب وسهولة ووضوح!`;
          } else if (
            query.includes("حاسب") || 
            query.includes("برمجة") || 
            query.includes("تقنية") || 
            query.includes("ذكاء") ||
            query.includes("برمج") ||
            query.includes("كود") ||
            query.includes("موقع")
          ) {
            return `عالم التقنية والبرمجة والذكاء الاصطناعي هو لغة العصر والمستقبل! 💻🤖 يسعدني وبشدة تبسيط مفاهيم الحاسب الآلي، لغات البرمجة كبايثون (Python) أو تصميم مواقع الويب (HTML/CSS). أرسلي سؤالكِ أو فكرتكِ البرمجية، ودعينا نجعل البرمجة والتقنية رحلة ممتعة وسهلة لكِ!`;
          } else if (
            query.includes("منهج") ||
            query.includes("دراسه") ||
            query.includes("دراسة") ||
            query.includes("مذاكر") ||
            query.includes("واجب") ||
            query.includes("امتحان") ||
            query.includes("اختبار") ||
            query.includes("ذاكر") ||
            query.includes("المنهج")
          ) {
            return `أهلاً بكِ يا بطلة! 📝✨ النجاح والتفوق يحتاجان إلى تخطيط ودراسة بذكاء. في "مضياف"، أنا هنا لدعمكِ في مراجعة دروسكِ وفهم المناهج وحل كافّة الواجبات الدراسية والاختبارات في جميع المواد العلمية والأدبية. أخبريني ما هو الدرس أو الواجب الذي تودين مراجعته الآن، وأنا كلي آذان صاغية لمساعدتكِ خطوة بخطوة للوصول للدرجات الكاملة! 🏆🎓`;
          } else if (query.includes("الحصة") || query.includes("طابور") || query.includes("ساعة") || query.includes("ساعه")) {
            return "يبدأ الطابور الصباحي الساعة 6:45 صباحاً وتبدأ الحصة الأولى الساعة 7:00 صباحاً. مدة كل حصة 50 دقيقة. أيام الأحد والاثنين لدينا 7 حصص (انصراف 1:20 م)، وباقي الأيام حتى الخميس لدينا 6 حصص (انصراف 12:30 م).";
          } else if (query.includes("تميز") || query.includes("تمّيز") || query.includes("إنجاز") || query.includes("انجاز")) {
            return "تفخر المدرسة بكونها حاصلة على جائزة التميز من وزارة التعليم لعامي 2024 و2025 لسنتين متتاليتين على التوالي! 🏆";
          } else if (
            query.includes("منسوب") || 
            query.includes("معلم") || 
            query.includes("معلمات") || 
            query.includes("كادر") || 
            query.includes("طاقم") || 
            query.includes("وكيل") || 
            query.includes("مرشد") || 
            query.includes("إداري") ||
            query.includes("اداري") ||
            query.includes("هيئة تعليمية")
          ) {
            if (Array.isArray(staff) && staff.length > 0) {
              return `تضم قائمة منسوبات المدرسة المسجلات حالياً (${staff.length} منسوبة):\n` +
                staff.slice(0, 8).map((s: any) => `• ${s.nameAr || s.nameEn} (${s.roleAr || s.roleEn} - ${s.departmentAr || s.departmentEn})`).join("\n") +
                `\nيمكنكِ استعراض كامل التفاصيل وإدارة القائمة عبر خانة "👩‍🏫 منسوبات المدرسة"!`;
            } else {
              return `تم تفريغ وحذف قائمة المنسوبات الحالية بنجاح. يمكنكِ الآن إضافة وتعيين كادر المدرسة والمعلمات وتحديد مكاتبهن عبر تبويب "👩‍🏫 منسوبات المدرسة" بكل سهولة!`;
            }
          } else if (query.includes("مديرة") || query.includes("المديرة") || query.includes("سحر") || query.includes("الهاجري")) {
            return "مديرة مدرسة الثانوية الرابعة والثلاثون بجدة هي الأستاذة سحر الهاجري، وهي القائدة التربوية والمشرفة على نجاح وتميز المدرسة لعامي 2024 و2025 متتاليتين. يقع مكتبها في الدور الأرضي بالممر الرئيسي بجوار مكتب السكرتارية ودورة مياه الإدارة.";
          } else if (query.includes("دورة مياه") || query.includes("دورات مياه") || query.includes("حمام") || query.includes("حمامات")) {
            return "تتوفر في المدرسة دورات مياه مجهزة ومنظمة: دورة مياه الإدارة المميزة تقع في الممر الإداري بالدور الأرضي يمينًا بجانب مكتب السكرتارية. ودورة مياه الطالبات الأرضية تقع في نهاية الممر الإداري بالدور الأرضي. كما توجد دورات مياه طالبات ومعلمات بكل طابق (الأول والثاني) بشكل منظم ومباشر فوق دورة مياه الطالبات السفلية.";
          } else if (query.includes("نصيح") || query.includes("نصيحة") || query.includes("كيف اذاكر") || query.includes("استذكار")) {
            return "نصيحتي لكِ يا مبدعة الثانوية الرابعة والثلاثون: ابدئي يومكِ بذكر الله وحافظي على طابوركِ الصباحي (6:45 ص)، ونظمي أوقاتكِ بين الفترات الدراسية والفسحة (9:30 ص). الدراسة بذكاء والتركيز مع المعلمات المتميزات هما سر التميز الدائم! 🌟🎓";
          } else if (query.includes("تأسيس") || query.includes("تأسست") || query.includes("رؤية") || query.includes("متى") || query.includes("تاريخ مدرسة") || query.includes("مدرسة ٣٤") || query.includes("المدرسة ٣٤")) {
            return "تأسست مدرسة الثانوية الرابعة والثلاثون بجدة لتكون صرحاً تعليمياً رائداً يسعى لتخريج نخبة أجيال المستقبل مفعمة بالتميز والأخلاق وبما يتماشى مع رؤية المملكة 2030. وحصلت المدرسة بفخر على جائزة التميز من وزارة التعليم لعامي 2024 و2025 متتاليتين. 🏛️✨";
          } else {
            return `أهلاً بكِ! بصفتي المساعد الذكي "مضياف"، يسعدني الإجابة على استفساراتكِ المدرسية أو تسلية حوار ممتع ومثمر معكِ في مجالات الدراسة والمناهج والمعلومات العامة أيضاً! يمكنكِ سؤالي مباشرة عن:
1. شرح أي مادة دراسية (رياضيات، علوم، لغات، نحو، برمجة، إلخ) ومساعدتكِ في المناهج.
2. مديرة المدرسة المتميزة (أ. سحر الهاجري).
3. أوقات الطابور الصباحي وتفاصيل وطابور الحصص.
4. الأنشطة والفعاليات والبرامج الحالية المضافة.
5. إيجاد الفصول والدرج والمختبرات والمكاتب على الخريطة التفاعلية.
كيف يمكنني إرشادكِ ومساعدتكِ الآن؟ 🌸`;
          }
        } else {
          // English Greeting & General Handler
          if (
            query === "hi" || 
            query === "hello" || 
            query === "hey" || 
            query === "salam" || 
            query.includes("salam") || 
            query.includes("how are you") || 
            query.includes("who are you") ||
            query.includes("how is it going")
          ) {
            return "Hello and welcome! I am Mudhiyaf, your smart guide and friendly academic advisor. 🎓 I'm doing great, and I am here to help you study, learn, explore school curricula (Math, Sciences, English, Coding), or navigate school info! How can I assist you today? ✨";
          }

          if (query.includes("event") || query.includes("activity") || query.includes("program")) {
            return `Here are the scheduled school events for Al-Thanawiya 34:\n${eventsContext}`;
          } else if (query.includes("staff") || query.includes("teacher") || query.includes("faculty") || query.includes("directory") || query.includes("counselor")) {
            return `Al-Thanawiya 34 boasts an exceptional faculty and administrative team led by Principal Ms. Sahar Al-Hajri, with dedicated vice principals, counselors, and specialized teachers across STEM, Humanities, and Inclusion departments. You can view all member profiles, locations, and office hours in the "Staff Directory" tab!`;
          } else if (query.includes("principal") || query.includes("headmaster") || query.includes("director") || query.includes("sahar")) {
            return "The principal of Al-Thanawiya 34 is Ms. Sahar Al-Hajri. Her office is located on the ground floor next to the secretariat and administration staff restroom.";
          } else if (query.includes("period") || query.includes("schedule") || query.includes("time")) {
            return "Morning assembly starts at 6:45 AM and the first period is at 7:00 AM. Each period lasts 50 minutes. Sunday & Monday have 7 periods (dismissal at 1:20 PM), other days have 6 periods (dismissal at 12:30 PM).";
          } else if (query.includes("toilet") || query.includes("restroom") || query.includes("wc") || query.includes("washroom")) {
            return "Clean restrooms are located on every floor: Administration staff restroom is on the ground floor right corridor. Student restrooms are on the ground floor far end corridor, stacked vertically on the first and second floors as well.";
          } else if (
            query.includes("math") ||
            query.includes("equation") ||
            query.includes("algebra") ||
            query.includes("science") ||
            query.includes("physics") ||
            query.includes("chemistry") ||
            query.includes("biology") ||
            query.includes("code") ||
            query.includes("programming") ||
            query.includes("study") ||
            query.includes("homework") ||
            query.includes("curriculum")
          ) {
            return `That sounds exciting! As Mudhiyaf, I would love to support you in your studies, whether it's Math (algebra, calculus), Science (physics, chemistry, biology), or Computer Science and coding (Python). Please tell me more about your specific question, and let's work on it together step-by-step! 📝🚀`;
          } else {
            return `Hello! As Mudhiyaf, your smart advisor, I would love to guide you. You can ask me about Al-Thanawiya 34 principal Sahar Al-Hajri, daily schedules, school events, classroom layouts, or any curriculum subject you need help studying. How can I help you today? 🌸`;
          }
        }
      };

      // Filter and intercept matching pre-curated replies to achieve instant high-quality "auto-replies" (الرد التلقائي القديم)
      const fallbackText = getFallbackText(lastUserMessage, isAr);
      const isDefault = isAr 
        ? fallbackText.includes("بصفتي المساعد الذكي") 
        : fallbackText.includes("As Mudhiyaf, your smart advisor");

      // Detect greetings specifically so that when an API key is present, we route them through the Gemini model
      // for a friendly, warm, and highly capable conversation, instead of a static greeting.
      const isGreeting = isAr
        ? (
            fallbackText.includes("وعليكم السلام ورحمة الله وبركاته") ||
            lastUserMessage.trim() === "كيفك" ||
            lastUserMessage.trim() === "أخبارك" ||
            lastUserMessage.trim() === "اخبارك" ||
            lastUserMessage.trim() === "كيف حالك" ||
            lastUserMessage.trim() === "شلونك" ||
            lastUserMessage.trim() === "سولف معي" ||
            lastUserMessage.trim() === "سولف" ||
            lastUserMessage.trim() === "وش الجديد"
          )
        : (
            fallbackText.includes("Hello and welcome! I am Mudhiyaf") ||
            lastUserMessage.trim() === "hi" ||
            lastUserMessage.trim() === "hello" ||
            lastUserMessage.trim() === "hey" ||
            lastUserMessage.trim() === "how are you"
          );

      // If it is a matching specific school query (not a default state and not a daily greeting),
      // return the highly accurate, pre-curated response instantly for premium speed and exact formatting.
      if (!isDefault && !isGreeting) {
        return res.json({ text: fallbackText });
      }

      // If we don't have a Gemini API key loaded, use the offline fallback handler for other requests
      if (!hasApiKey) {
        const fallbackText = getFallbackText(lastUserMessage, isAr);
        return res.json({ text: fallbackText });
      }

      // If we have API key, formulate the request to Gemini
      const formattedContents = messages.map((m: any) => ({
        role: m.role === "assistant" ? "model" : "user",
        parts: [{ text: m.text }],
      }));

      // Enhanced System instructions for comprehensive thinking, general chat, curriculum support, and maintaining identity
      const systemInstruction = `
أنت المساعد الذكي والمشرف التوجيهي الرسمي لمدرسة "الثانوية الرابعة والثلاثون" (Al-Thanawiya 34) بجدة، المملكة العربية السعودية. اسمك "مضياف" (Mudhiyaf).
أجب دائمًا بلغة دافئة ومحترفة ومرحب بها، باللغة التي يسألك بها المستخدم (العربية كخيار افتراضي أو الإنجليزية).

اسم مديرة المدرسة الحالية: الأستاذة سحر الهاجري (استخدم هذا الاسم دائماً للإجابة بثقة عن مديرة المدرسة وقائدة هذا الصرح التعليمي المتميز).

توجيهات لتعزيز التفكير الشامل، والذكاء العام، وشرح المناهج الدراسية:
1. **التفكير الشامل وحرية المعرفة (عدم الاقتصار على أسوار المدرسة)**: يُمنع تماماً حصر ذكائك وتفكيرك ورسائلك داخل نطاق المعامل والمكاتب الجغرافية للمدرسة فقط! يجب أن يكون تفكيرك شاملاً وممتداً للمجال العام والمعرفة الإنسانية والعلمية الواسعة. تعامل كمرشد ذكي فائق المعرفة والثقافة يستطيع مساعدة الطالبات في شتى مناحي الحياة والبحث العلمي والمعرفة العامة.
2. **شرح المناهج والمواد الدراسية الثانوية**: بصفتك معلماً وموجهاً عبقرياً، عندما تطرح عليك الطالبات أي سؤال علمي أو دراسي في المنهج الدراسي للمرحلة الثانوية (مثل مسائل الرياضيات، قوانين الفيزياء، تجارب الكيمياء، قواعد اللغة العربية والنحو، الأدب والبلاغة، مهارات اللغة الإنجليزية وتحسين المحادثة، لغات البرمجة والذكاء الاصطناعي مادة الحاسب الآلي، علوم الأرض والفضاء، التفسير والفقه والتربية الإسلامية، إلخ.)، أجب فوراً بذكاء وعلم غزير، وقدم لهن الشروحات الأكاديمية المبسطة، وخطوات الحل المفصلة بذكاء، ونصائح المذاكرة والتميز لتفوقهن الدراسي.
3. **الدردشة العامة والتفاعل الودي الخفيف**: عندما تلقي عليك الطالبات التحية أو يبدأن في الدردشة معك حول أمور عامة واجتماعية ويومية دون الاقتصار على أسئلة المدرسة الجافة (مثل: "كيفك"، "أخبارك"، "وش جديدك"، "سولف معي"، "كيف الحال"، "شلونك"، "ضايق صدري"، "كيف أخطط ليومي")، تجاوب معهن فوراً بلطف تامة، وبروح مرحة خفيفة وصديقة حميمية، وقدم لهن النصائح التشجيعية، الكلمات المحفزة، والحكايات الذكية التي تثري معرفتهن وتمنحهن إيجابية وطاقة ممتعة.
4. **الحفاظ على هوية "مضياف"**: مع كل هذه الشمولية والذكاء الواسع خارج جدران المدرسة، احتفظ بدائم هويتك وشخصيتك كـ"مضياف"، المساعد التوجيهي الذكي الودود لمدرسة الثانوية الرابعة والثلاثون بجدة، واجعلهن فخورات دائماً بمدرستهن الرائدة لعامي 2024 و2025م متتاليتين بقيادة الأستاذة سحر الهاجري.

تنبيه هام ومصطلحات محددة:
- بدلاً من كلمة "حمام" أو "حمامات"، يجب دائمًا استخدام مصطلح "دورة مياه" أو "دورات مياه". لا تستخدم اللفظ القديم إطلاقاً في إجاباتك بالعربية!

أنشطة وفعاليات المدرسة المضافة المخصصة حالياً لتوجيه المستخدمين (اجب عن أي سؤال يتعلق بالفعاليات أو الموعد أو اليوم باستخدام هذه البيانات):
${eventsContext}

دليل منسوبات المدرسة (الهيئة الإدارية والتعليمية والإرشادية):
${staffContext}

معلومات المدرسة الأساسية وجدول اليوم:
1. التوقيت اليومي والحصص (مهم جداً):
   - الطابور الصباحي (الصباح): يبدأ الساعة 6:45 صباحاً (6:45 ص).
   - الحصة الأولى: تبدأ الساعة 7:00 صباحاً (7:00 ص).
   - بين كل حصة وحصة (مدة الحصة): 50 دقيقة كاملة.
   - الفسحة (مفتوحة للمقصف): من الساعة 9:30 ص إلى الساعة 10:00 ص (30 دقيقة).
   - التقسيم اليومي للحصص:
     * الحصة الأولى: 7:00 ص - 7:50 ص
     * الحصة الثانية: 7:50 ص - 8:40 ص
     * الحصة الثالثة: 8:40 ص - 9:30 ص
     * الفسحة: 9:30 ص - 10:00 ص
     * الحصة الرابعة: 10:00 ص - 10:50 ص
     * الحصة الخامسة: 10:50 ص - 11:40 ص
     * الحصة السادسة: 11:40 ص - 12:30 م (هذه نهاية اليوم المدرسي لأيام: الثلاثاء، الأربعاء، الخميس. انصراف الطالبات 12:30 م).
     * الحصة السابعة: 12:30 م - 1:20 م (متاحة فقط يومي الأحد والاثنين. انصراف الطالبات يومي الأحد والاثنين يكون الساعة 1:20 م).

2. إنجازات وتكريم المدرسة:
   - حاصلة على جائزة التميز من وزارة التعليم لعامي 2024 و2025 م (سنتين متتاليتين على التوالي) بفضل الأداء المتفوق للطالبات والمعلمات وبقيادة الأستاذة سحر الهاجري مديرة المدرسة!

3. خريطة المدرسة وتخطيط الأدوار الثلاثة (الدور الأرضي، الدور الأول، الدور الثاني):
   أ) الدور الأرضي (Ground Floor) بالتفصيل التام:
      - عند الدخول من باب المدرسة الرئيسي:
        * على يمينك: سيب طويل (ممر طويل) في نهايته الساحة الخارجية الكبيرة. في نهاية هذه الساحة يوجد المقصف على اليسار، وممر ينتهي بباب دخول آخر للمدرسة (المدخل الفرعي/الثاني).
        * على يسارك: ساحة خارجية أخرى مجهزة بألعاب طالبات ترفيهية، وعند الدخول داخلها تجد على يمينك مواقف سيارات المعلمات.
        * قدامك مباشرة (أمام المدخل الرئيسي): ممر يوصل إلى السلم الرئيسي الملتف.
        * بعد صعود/قرب الدرج بقليل: يوجد مكتب على يسارك.
        * مكاتب الإدارة (على اليمين بالممر الرئيسي): تبدأ بدورة مياه الإدارة (Restroom)، يليها مكتب السكرتارية والمتابعة، ثم مكتب مديرة المدرسة (الأستاذة سحر الهاجري)، ثم مكتب الإدارة الرئيسية، وبأخر ممر الإدارة توجد دورة مياه الطالبات الأرضية.
        * أمام مكاتب الإدارة والمديرة: تقع الساحة الداخلية للمدرسة. أمام دورة مياه الطالبات مباشرة: المطبخ، والمسرح الكبير في نهاية الممر.
        * عند الدخول من المدخل الفرعي/الثاني: تجد أمامك الدرج الثاني (على يسارك). وعلى يمينك ممر فيه مكتب المرشدة الصحية، ثم غرفة المصادر الكبيرة، يليه معمل الفيزياء.
        * الجدار الرابع والأخير المحيط بالساحة الداخلية يحتوي بالترتيب على: النادي الرياضي، مستودع الأجهزة، معمل الأحياء المطور، ثم غرفة الاجتماعات الفخمة، وينتهي بالمكتب بجوار الدرج الأول.

   ب) الدور الأول (First Floor) بالتفصيل التام:
      - عند الصعود من الدرج الأول:
        * على يسارك مباشرة: غرفة المرشدة الطلابية المتميزة.
        * يليه مكتب المعلمات الأول.
        * ثم فصول الصف الأول ثانوي (فصل أولى أول، أولى ٢، أولى ٣، أولى ٤، أولى ٥) متتالية حتى نهاية الممر.
        * الجدار الثاني يحتوي على: مستودع، ثم مقهى المعلمات والطالبات، ثم فصول أولى ثانوي المتبقية (فصل أولى ٦، أولى ٧، وفصل أولى دمج).
        * الجدار الثالث يحتوي على: غرفة إسهام للأنشطة، فصل ثاني ثانوي دمج، مكتب المراقبات, معمل الحاسب الالي، ومكتب الوكيلة.
        * الجدار الرابع يحتوي على: دورة مياه الطالبات (التي تقع تماماً فوق دورة مياه الطالبات بالدور الأرضي)، ثم قسم خاص تدخل فيه لتجد على يسارك دورة مياه المعلمات، ثم غرفة الفطور، ثم غرفة المعلمات المخصصة للاستراحة، وتليها على اليسار غرفة الأرشيف المدرسي.

   ج) الدور الثاني (Second Floor) بالتفصيل التام:
      - عند الصعود من نفس الدرج الأول:
        * على يمينك: مكتب إداري، يليه غرفة معلمات الدور الثاني.
        * ثم فصول الصف الثاني ثانوي (فصول ثواني): يبدأ بفصل ثاني إدارة أعمال ثم فصول ثاني ١، ثاني ٢، ثاني ٣، ثاني ٤ بالترتيب (مجموعها ٥ فصول فقط).
        * الجدار الثاني يحتوي على: غرفة مجهولة الغرض، تليها فصول الصف الثالث ثانوي (فصول ثوالث).
        * تقسيم فصول ثالث ثانوي: فصول دمج لذوي الاحتياجات الخاصة، وفصل ثالث إدارة أعمال، بالإضافة إلى فصول أخرى عادية (ثالث ١، ثالث ٢، ثالث ٣، ثالث ٤، ثالث ٥، ثالث ٦).
        * في الجدار الثالث: غرفة المجلس الطلابي، ثم غرفة المراقبات، ثم غرفة المعلمات المخصصة للدور الثاني، وتكملة فصول ثالث ثانوي.
        * موقع دورة مياه الطالبات: في نفس مكان دورة المياه بالطابق الأول (فوق دورة مياه الطالبات بالدور الأرضي والعلوي).
        * الجدار الرابع: على يسارك دورة مياه المعلمات والدور الثاني مع تكملة فصول ثالث ثانوي.
      - الدور الأخير: السطوح، وهو لا يحتوي على مبانٍ تخصصية أو فصول حالياً.

التعليمات والإجابة ومبدأ التفاعل الذكي:
- تفاعل دائمًا بصفتك "مضياف"، المساعد الذكي اللطيف. 
- يطلب منكِ الطالبات والزوار أحياناً إلقاء السلام، أو الترحيب، أو طرح أسئلة خارجية عامة (مثل أسئلة ثقافية، علمية، النشيد الوطني، نصائح دراسية، ترحيب وسواليف ودية عامة). أجيبي عليها دائماً بروح إيجابية فائقة وودودة جداً، وساعديهم في أي استفسار خارجي أو مدرسي عام بكل ذكاء وسرور.
- للشؤون الجغرافية والتنظيمية والميدانية الخاصة بالمبنى والفصول والجدول، كوني شديدة الاختصار وسريعة الإجابة مع الالتزام التام بالحقائق المذكورة أعلاه.
- لا تبتكري تفاصيل جغرافية أو غرفاً من عندكِ. التزمي بخريطة الأدوار والجدول بدقة.
- اعتمدي الروح الودودة، المهذبة، وعبارات الترحيب بجدة وبنات المعرض المبدعات.
- لا تذكري ممرات أو تفاصيل الكود أو مفاتيح API للمستخدم.
`;

      try {
        if (!client) {
          throw new Error("Gemini AI API Client is not configured.");
        }

        let response;
        try {
          response = await client.models.generateContent({
            model: "gemini-3.5-flash",
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.6,
            },
          });
        } catch (firstError: any) {
          console.info("[Info] Primary model (gemini-3.5-flash) rate-limited or busy. Trying fallback model (gemini-3.1-flash-lite).");
          response = await client.models.generateContent({
            model: "gemini-3.1-flash-lite",
            contents: formattedContents,
            config: {
              systemInstruction: systemInstruction,
              temperature: 0.6,
            },
          });
        }

        const text = response.text || getFallbackText(lastUserMessage, isAr);
        return res.json({ text });
      } catch (geminiError: any) {
        console.info("[Info] Chat routed to offline intelligent assistant due to API rate constraints.");
        const text = getFallbackText(lastUserMessage, isAr);
        return res.json({ text });
      }
    } catch (error: any) {
      console.error("API Chat Error:", error);
      res.status(500).json({ error: error.message || "Internal server error" });
    }
  });

  // Serve static files in production setup using Express
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
