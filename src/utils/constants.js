export const HABITS = [
  { id: "gym", icon: "🏋️", name: "Gym", sub: "45 min minimum", priority: true },
  {
    id: "food",
    icon: "🥗",
    name: "Diet",
    sub: "1800–2000 cal",
    priority: true,
  },
  {
    id: "study",
    icon: "📖",
    name: "Study",
    sub: "1hr library",
    priority: false,
  },
  { id: "sleep", icon: "😴", name: "Sleep", sub: "11PM–6AM", priority: false },
  { id: "water", icon: "💧", name: "Water", sub: "3L daily", priority: false },
  { id: "tidy", icon: "🧹", name: "Tidy", sub: "15 min", priority: false },
  {
    id: "phone",
    icon: "📵",
    name: "Phone",
    sub: "Limits AM/PM",
    priority: false,
  },
  {
    id: "spend",
    icon: "💰",
    name: "Spend",
    sub: "Log expense",
    priority: false,
  },
];

export const DAYS = ["Sat", "Sun", "Mon", "Tue", "Wed", "Thu", "Fri"];

export const RULES = [
  {
    title: "قاعدة الـ 5 دقائق",
    desc: "أي مهمة (تنظيف، ترتيب) تستغرق أقل من 5 دقائق، تُنفذ فوراً ولا تُجدول.",
    icon: "⏱️",
  },
  {
    title: "قاعدة الـ 3 ثوانٍ",
    desc: "قبل الرد في أي حوار اجتماعي، انتظر 3 ثوانٍ. يمنحك الرزانة ويمنع الاندفاع.",
    icon: "🧘‍♂️",
  },
  {
    title: "قاعدة الـ 10 دقائق حركة",
    desc: "بعد كل وجبة، تحرك لـ 10 دقائق (مشي أو ترتيب) لكسر الخمول ومنع التشتت.",
    icon: "🚶‍♂️",
  },
  {
    title: "قاعدة البيئة الواحدة",
    desc: "الدراسة في المكتبة، والبيت للراحة فقط. لا تخلط بين بيئة الإنجاز والاسترخاء.",
    icon: "🏛️",
  },
  {
    title: "قاعدة التجهيز المسبق",
    desc: "الأكل والملابس وحقيبة الجم تُجهز ليلاً. تقليل القرارات يوفر طاقة تركيزك.",
    icon: "🎒",
  },
];

export const GOAL_CATEGORIES = [
  { id: "health", icon: "❤️", title: "أهداف صحية" },
  { id: "edu", icon: "🧠", title: "تعليمية وتطورية" },
  { id: "fin", icon: "💵", title: "أهداف مالية" },
];

export const GOAL_PERIODS = [
  { id: "yearly", title: "الهدف السنوي" },
  { id: "monthly", title: "الهدف الشهري" },
  { id: "weekly", title: "الهدف الأسبوعي" },
];
