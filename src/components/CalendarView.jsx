import { useState, useEffect } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Link2,
  Plus,
  ChevronRight,
  ChevronLeft,
  Trash2,
  X,
} from "lucide-react";

export default function CalendarView() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);

  // Modal States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [activeDay, setActiveDay] = useState(new Date().getDate());

  useEffect(() => {
    const load = async () => {
      try {
        const token = localStorage.getItem("pro_token");
        const res = await fetch("/api/data/settings", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          if (data["calendar:events"]) {
            setEvents(JSON.parse(data["calendar:events"]));
          } else {
            // Default mock events if none exist
            setEvents([
              {
                id: 1,
                title: "Deep Work: Coding V3",
                time: "10:00 AM",
                type: "focus",
                date: new Date().getDate(),
              },
              {
                id: 2,
                title: "Gym Session",
                time: "5:30 PM",
                type: "health",
                date: new Date().getDate(),
              },
              {
                id: 3,
                title: "Read 20 Pages",
                time: "9:00 PM",
                type: "habit",
                date: new Date().getDate(),
              },
            ]);
          }
        }
      } catch (e) {
        console.error("Failed to load events", e);
      }
    };
    load();
  }, []);

  const saveEventsToDB = async (newEvents) => {
    try {
      const token = localStorage.getItem("pro_token");
      await fetch("/api/data/settings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          key: "calendar:events",
          value: JSON.stringify(newEvents),
        }),
      });
    } catch (e) {
      console.error("Failed to save events", e);
    }
  };

  // Adjust to make Monday the first day of the week (0)
  const startingDay = firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1;

  const prevMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1),
    );
  const nextMonth = () =>
    setCurrentDate(
      new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1),
    );

  const getTypeColor = (type) => {
    switch (type) {
      case "focus":
        return "#6366f1";
      case "health":
        return "#10b981";
      case "habit":
        return "#f59e0b";
      case "finance":
        return "#a855f7";
      default:
        return "#71717a";
    }
  };

  const openModal = (day, eventToEdit = null) => {
    setActiveDay(day);
    if (eventToEdit) {
      setEditingEvent({ ...eventToEdit });
    } else {
      setEditingEvent({
        id: Date.now(),
        title: "",
        time: "12:00 PM",
        type: "focus",
        date: day,
      });
    }
    setIsModalOpen(true);
  };

  const saveEvent = () => {
    if (!editingEvent.title) return;
    let nextEvents;
    if (events.find((e) => e.id === editingEvent.id)) {
      nextEvents = events.map((e) =>
        e.id === editingEvent.id ? editingEvent : e,
      );
    } else {
      nextEvents = [...events, editingEvent];
    }
    setEvents(nextEvents);
    saveEventsToDB(nextEvents);
    setIsModalOpen(false);
  };

  const deleteEvent = (id) => {
    const nextEvents = events.filter((e) => e.id !== id);
    setEvents(nextEvents);
    saveEventsToDB(nextEvents);
    setIsModalOpen(false);
  };

  const renderCalendarGrid = () => {
    const days = [];
    const today = new Date();

    // Empty cells before start of month
    for (let i = 0; i < startingDay; i++) {
      days.push(
        <div
          key={`empty-${i}`}
          className="calendar-day empty"
          style={{
            minHeight: 120,
            border: "1px solid rgba(255,255,255,0.03)",
            padding: 12,
          }}
        />,
      );
    }

    // Actual days
    for (let day = 1; day <= daysInMonth; day++) {
      const isToday =
        day === today.getDate() &&
        currentDate.getMonth() === today.getMonth() &&
        currentDate.getFullYear() === today.getFullYear();

      const dayEvents = events.filter((e) => e.date === day);

      days.push(
        <div
          key={day}
          style={{
            minHeight: 120,
            background: isToday
              ? "rgba(99, 102, 241, 0.05)"
              : "rgba(255,255,255,0.01)",
            border: isToday
              ? "1px solid rgba(99, 102, 241, 0.3)"
              : "1px solid rgba(255,255,255,0.05)",
            padding: 12,
            borderRadius: 12,
            display: "flex",
            flexDirection: "column",
            gap: 8,
            transition: "background 0.2s",
            cursor: "pointer",
          }}
          onClick={() => openModal(day)}
          onMouseOver={(e) =>
            !isToday &&
            (e.currentTarget.style.background = "rgba(255,255,255,0.03)")
          }
          onMouseOut={(e) =>
            !isToday &&
            (e.currentTarget.style.background = "rgba(255,255,255,0.01)")
          }
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <span
              style={{
                width: 28,
                height: 28,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "50%",
                background: isToday ? "#6366f1" : "transparent",
                color: isToday ? "#fff" : "#e4e4e7",
                fontWeight: isToday ? 800 : 500,
                fontSize: 14,
                fontFamily: "'JetBrains Mono'",
              }}
            >
              {day}
            </span>
            <button
              style={{
                background: "transparent",
                border: "none",
                color: "#71717a",
                cursor: "pointer",
              }}
              onClick={(e) => {
                e.stopPropagation();
                openModal(day);
              }}
            >
              <Plus size={14} />
            </button>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 4,
              flex: 1,
              overflowY: "auto",
            }}
          >
            {dayEvents.map((ev) => (
              <div
                key={ev.id}
                onClick={(e) => {
                  e.stopPropagation();
                  openModal(day, ev);
                }}
                style={{
                  fontSize: 11,
                  padding: "4px 8px",
                  background: `${getTypeColor(ev.type)}22`,
                  borderLeft: `2px solid ${getTypeColor(ev.type)}`,
                  color: "#e4e4e7",
                  borderRadius: "0 4px 4px 0",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  fontFamily: "'Tajawal', sans-serif",
                  transition: "filter 0.2s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.filter = "brightness(1.5)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.filter = "brightness(1)")
                }
              >
                {ev.time} - {ev.title}
              </div>
            ))}
          </div>
        </div>,
      );
    }
    return days;
  };

  return (
    <div
      className="fade-up-1 ar-text"
      style={{ display: "flex", flexDirection: "column", height: "100%" }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 32,
        }}
      >
        <div>
          <h2
            style={{
              fontSize: 28,
              fontWeight: 900,
              margin: "0 0 8px",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              gap: 12,
            }}
          >
            <CalendarIcon color="#f59e0b" size={32} />
            إدارة الوقت والمواعيد
          </h2>
          <p style={{ margin: 0, fontSize: 14, color: "#a1a1aa" }}>
            تخطيط استراتيجي لكل دقيقة في يومك.
          </p>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            style={{
              background: "rgba(59, 130, 246, 0.1)",
              border: "1px solid rgba(59, 130, 246, 0.2)",
              color: "#3b82f6",
              padding: "10px 16px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.background = "rgba(59, 130, 246, 0.2)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.background = "rgba(59, 130, 246, 0.1)")
            }
          >
            <Link2 size={18} /> مزامنة Google Calendar
          </button>
          <button
            style={{
              background: "#6366f1",
              border: "none",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 12,
              display: "flex",
              alignItems: "center",
              gap: 8,
              cursor: "pointer",
              fontWeight: 700,
              fontFamily: "'Tajawal', sans-serif",
              boxShadow: "0 4px 12px rgba(99, 102, 241, 0.3)",
            }}
            onClick={() => openModal(currentDate.getDate())}
            onMouseOver={(e) =>
              (e.currentTarget.style.transform = "translateY(-1px)")
            }
            onMouseOut={(e) =>
              (e.currentTarget.style.transform = "translateY(0)")
            }
          >
            <Plus size={18} /> إضافة موعد
          </button>
        </div>
      </div>

      <div
        style={{
          background: "rgba(9,9,11,0.5)",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 24,
          padding: 24,
          flex: 1,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* Calendar Header Controls */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 24,
          }}
        >
          <div
            style={{
              fontSize: 24,
              fontWeight: 800,
              color: "#fff",
              fontFamily: "'Tajawal', sans-serif",
            }}
          >
            {currentDate.toLocaleDateString("ar-SA", {
              month: "long",
              year: "numeric",
            })}
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={prevMonth}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "#fff",
                padding: 8,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "#fff",
                padding: "8px 16px",
                borderRadius: 8,
                cursor: "pointer",
                fontFamily: "'Tajawal', sans-serif",
                fontWeight: 700,
              }}
            >
              اليوم
            </button>
            <button
              onClick={nextMonth}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: "none",
                color: "#fff",
                padding: 8,
                borderRadius: 8,
                cursor: "pointer",
              }}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 12,
            marginBottom: 16,
          }}
        >
          {[
            "الاثنين",
            "الثلاثاء",
            "الأربعاء",
            "الخميس",
            "الجمعة",
            "السبت",
            "الأحد",
          ].map((day) => (
            <div
              key={day}
              style={{
                textAlign: "center",
                color: "#a1a1aa",
                fontWeight: 600,
                fontSize: 13,
                textTransform: "uppercase",
                letterSpacing: 1,
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: 12,
            flex: 1,
          }}
        >
          {renderCalendarGrid()}
        </div>
      </div>

      {/* Event Modal */}
      {isModalOpen && editingEvent && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.8)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
          onClick={() => setIsModalOpen(false)}
        >
          <div
            style={{
              background: "#18181b",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              maxWidth: 440,
              boxShadow: "0 24px 48px rgba(0,0,0,0.5)",
              cursor: "default",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 24,
              }}
            >
              <h3
                style={{
                  fontSize: 20,
                  fontWeight: 800,
                  margin: 0,
                  color: "#fff",
                  fontFamily: "'Tajawal', sans-serif",
                }}
              >
                {events.find((e) => e.id === editingEvent.id)
                  ? "تعديل موعد"
                  : "إضافة موعد جديد"}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: "rgba(255,255,255,0.05)",
                  border: "none",
                  color: "#a1a1aa",
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                }}
              >
                <X size={16} />
              </button>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label
                  style={{
                    fontSize: 13,
                    color: "#a1a1aa",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  عنوان النشاط
                </label>
                <input
                  type="text"
                  value={editingEvent.title}
                  onChange={(e) =>
                    setEditingEvent({ ...editingEvent, title: e.target.value })
                  }
                  placeholder="مثال: اجتماع عمل، نادي، دراسة..."
                  style={{
                    width: "100%",
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 12,
                    padding: "12px 16px",
                    color: "#fff",
                    fontSize: 15,
                    outline: "none",
                    fontFamily: "'Tajawal', sans-serif",
                  }}
                  autoFocus
                />
              </div>

              <div style={{ display: "flex", gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 13,
                      color: "#a1a1aa",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    الوقت
                  </label>
                  <input
                    type="text"
                    value={editingEvent.time}
                    onChange={(e) =>
                      setEditingEvent({ ...editingEvent, time: e.target.value })
                    }
                    placeholder="10:00 AM"
                    style={{
                      width: "100%",
                      background: "rgba(0,0,0,0.3)",
                      border: "1px solid rgba(255,255,255,0.1)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      color: "#fff",
                      fontSize: 15,
                      outline: "none",
                      fontFamily: "'JetBrains Mono'",
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    style={{
                      fontSize: 13,
                      color: "#a1a1aa",
                      fontWeight: 700,
                      display: "block",
                      marginBottom: 6,
                    }}
                  >
                    تاريخ اليوم
                  </label>
                  <div
                    style={{
                      width: "100%",
                      background: "rgba(255,255,255,0.02)",
                      border: "1px solid rgba(255,255,255,0.05)",
                      borderRadius: 12,
                      padding: "12px 16px",
                      color: "#71717a",
                      fontSize: 15,
                      fontFamily: "'JetBrains Mono'",
                    }}
                  >
                    {editingEvent.date} / {currentDate.getMonth() + 1}
                  </div>
                </div>
              </div>

              <div>
                <label
                  style={{
                    fontSize: 13,
                    color: "#a1a1aa",
                    fontWeight: 700,
                    display: "block",
                    marginBottom: 6,
                  }}
                >
                  التصنيف
                </label>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(4, 1fr)",
                    gap: 8,
                  }}
                >
                  {[
                    { id: "focus", label: "عمل/تركيز", color: "#6366f1" },
                    { id: "health", label: "صحة/رياضة", color: "#10b981" },
                    { id: "habit", label: "عادات/تطوير", color: "#f59e0b" },
                    { id: "finance", label: "مالية", color: "#a855f7" },
                  ].map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() =>
                        setEditingEvent({ ...editingEvent, type: cat.id })
                      }
                      style={{
                        background:
                          editingEvent.type === cat.id
                            ? `${cat.color}22`
                            : "rgba(255,255,255,0.02)",
                        border:
                          editingEvent.type === cat.id
                            ? `1px solid ${cat.color}`
                            : "1px solid rgba(255,255,255,0.05)",
                        color:
                          editingEvent.type === cat.id ? "#fff" : "#a1a1aa",
                        padding: "10px 4px",
                        borderRadius: 10,
                        cursor: "pointer",
                        fontFamily: "'Tajawal', sans-serif",
                        fontSize: 12,
                        fontWeight: 700,
                        transition: "all 0.2s",
                      }}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              </div>

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginTop: 16,
                  paddingTop: 16,
                  borderTop: "1px solid rgba(255,255,255,0.05)",
                }}
              >
                {events.find((e) => e.id === editingEvent.id) ? (
                  <button
                    onClick={() => deleteEvent(editingEvent.id)}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      background: "rgba(239, 68, 68, 0.1)",
                      color: "#ef4444",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  >
                    <Trash2 size={16} /> حذف
                  </button>
                ) : (
                  <div />
                )}

                <div style={{ display: "flex", gap: 12 }}>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    style={{
                      background: "transparent",
                      color: "#a1a1aa",
                      border: "none",
                      padding: "10px 16px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 700,
                      fontFamily: "'Tajawal', sans-serif",
                    }}
                  >
                    إلغاء
                  </button>
                  <button
                    onClick={saveEvent}
                    style={{
                      background: "#3b82f6",
                      color: "#fff",
                      border: "none",
                      padding: "10px 24px",
                      borderRadius: 10,
                      cursor: "pointer",
                      fontWeight: 800,
                      fontFamily: "'Tajawal', sans-serif",
                      boxShadow: "0 4px 12px rgba(59, 130, 246, 0.3)",
                    }}
                  >
                    حفظ الموعد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
