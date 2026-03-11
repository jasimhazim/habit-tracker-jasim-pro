export const getWeekKey = (offset = 0) => {
  const now = new Date();
  const dayOfWeek = now.getDay();
  const saturdayOffset = dayOfWeek >= 6 ? dayOfWeek - 6 : dayOfWeek + 1;
  const saturday = new Date(now);
  saturday.setDate(now.getDate() - saturdayOffset + offset * 7);
  const y = saturday.getFullYear();
  const m = String(saturday.getMonth() + 1).padStart(2, "0");
  const d = String(saturday.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

export const getWeekLabel = (weekKey) => {
  const [y, m, d] = weekKey.split("-").map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const fmt = (dt) =>
    dt.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  return `${fmt(start)} – ${fmt(end)}`;
};

export const getTodayDayIdx = () => {
  const d = new Date().getDay();
  return d === 6 ? 0 : d + 1; // 0 = Sat, 1 = Sun, 2 = Mon ... 6 = Fri
};
