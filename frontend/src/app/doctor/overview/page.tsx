"use client";

import { useState, useMemo } from "react";
import { Calendar, Lock, Award, Stethoscope, Star, ArrowUp, AlertTriangle, CheckCircle, Zap } from "lucide-react";
import { useDoctor } from "../_context/DoctorContext";

// ── Severity helpers ──────────────────────────────────────────────────────────
function severityMeta(score: number | null | undefined) {
  if (!score) return { label: "N/A", color: "bg-slate-100 text-slate-400", border: "border-slate-200", bg: "", dot: "bg-slate-300" };
  if (score <= 3) return { label: "Low",      color: "bg-green-100 text-green-700",  border: "border-green-200",  bg: "bg-green-50/40",   dot: "bg-green-500"  };
  if (score <= 6) return { label: "Moderate", color: "bg-amber-100 text-amber-700",  border: "border-amber-200",  bg: "bg-amber-50/40",   dot: "bg-amber-500"  };
  return           { label: "High",     color: "bg-red-100 text-red-700",    border: "border-red-300",    bg: "bg-red-50/50",     dot: "bg-red-500"    };
}

function parseTime(slot: string): number {
  // e.g. "09:00 AM", "02:30 PM"
  const match = slot.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let h = parseInt(match[1]);
  const m = parseInt(match[2]);
  const ampm = match[3].toUpperCase();
  if (ampm === "PM" && h !== 12) h += 12;
  if (ampm === "AM" && h === 12) h = 0;
  return h * 60 + m;
}

export default function DoctorOverview() {
  const { doctor, doctorProfile, appointments, blockedDates, totalApptThisWeek, today, formatDate } = useDoctor();

  // Local priority state (for instant UI feedback; backend is source of truth on reload)
  const [priorityIds, setPriorityIds] = useState<Set<string>>(new Set());
  const [loadingId, setLoadingId] = useState<string | null>(null);

  // Today's appointments — sort: priority first, then by time
  const todayAppts = useMemo(() => {
    const list = appointments.filter((a: any) => a.date === today);
    return list.sort((a: any, b: any) => {
      const aPri = a.isPriority || priorityIds.has(a.appointmentId) ? 1 : 0;
      const bPri = b.isPriority || priorityIds.has(b.appointmentId) ? 1 : 0;
      if (bPri !== aPri) return bPri - aPri;
      return parseTime(a.timeSlot) - parseTime(b.timeSlot);
    });
  }, [appointments, today, priorityIds]);

  async function handlePrioritize(appt: any) {
    setLoadingId(appt.appointmentId);
    try {
      await fetch(`http://localhost:5000/api/appointments/${appt.appointmentId}/prioritize`, {
        method: "PATCH",
      });
      setPriorityIds(prev => new Set([...prev, appt.appointmentId]));
    } catch (e) {
      console.error("Prioritize failed:", e);
    } finally {
      setLoadingId(null);
    }
  }

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Appointments This Week", value: totalApptThisWeek,             icon: Calendar,   color: "bg-blue-500"   },
          { label: "Leave Days Blocked",      value: blockedDates.length,           icon: Lock,       color: "bg-red-500"    },
          { label: "Years Experience",         value: doctorProfile?.experience || "—", icon: Award, color: "bg-purple-500" },
          { label: "Specialization",           value: doctorProfile?.specialization || "—", icon: Stethoscope, color: "bg-teal-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <Icon size={20} className="text-white"/>
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments — centered + priority sorted */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calendar size={20} className="text-white"/>
            </div>
            <h2 className="text-base font-black text-slate-700 uppercase tracking-wider">
              Today&apos;s Appointments
            </h2>
            {todayAppts.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full">
                {todayAppts.length} scheduled
              </span>
            )}
          </div>

          {/* Severity legend */}
          {todayAppts.length > 0 && (
            <div className="flex items-center gap-4 mb-5 px-1">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Severity:</span>
              {[{ label: "Low (1–3)", dot: "bg-green-500" }, { label: "Moderate (4–6)", dot: "bg-amber-500" }, { label: "High (7–10)", dot: "bg-red-500" }].map(s => (
                <div key={s.label} className="flex items-center gap-1.5">
                  <div className={`w-2 h-2 rounded-full ${s.dot}`}/>
                  <span className="text-[10px] text-slate-500 font-semibold">{s.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {todayAppts.length === 0 ? (
            <div className="text-center py-12">
              <CheckCircle size={44} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 font-semibold">No appointments today</p>
              <p className="text-slate-300 text-sm mt-1">Enjoy your free day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((a: any) => {
                const isPri = a.isPriority || priorityIds.has(a.appointmentId);
                const meta  = severityMeta(a.severityScore);
                const isLoading = loadingId === a.appointmentId;

                return (
                  <div
                    key={a.appointmentId}
                    className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                      isPri
                        ? "border-blue-300 bg-blue-50/60 shadow-md shadow-blue-100"
                        : `${meta.border} ${meta.bg}`
                    }`}
                  >
                    {/* Avatar */}
                    <div className={`relative w-11 h-11 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md ${isPri ? "bg-blue-600" : "bg-slate-700"}`}>
                      {a.patientName?.[0]?.toUpperCase()}
                      {isPri && (
                        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-sm">
                          <Star size={10} className="text-white fill-white"/>
                        </div>
                      )}
                    </div>

                    {/* Info */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-bold text-slate-800 truncate">{a.patientName}</p>
                        {isPri && (
                          <span className="inline-flex items-center gap-1 bg-blue-600 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full">
                            <Zap size={8}/> Priority
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 truncate mt-0.5">{a.hospital}</p>
                    </div>

                    {/* Severity badge */}
                    <div className="shrink-0 flex flex-col items-center gap-1">
                      <div className={`flex items-center gap-1.5 text-[11px] font-black px-2.5 py-1 rounded-xl ${meta.color}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${meta.dot}`}/>
                        {meta.label}
                      </div>
                      {a.severityScore && (
                        <span className="text-[10px] text-slate-400 font-semibold">
                          {a.severityScore}/10
                        </span>
                      )}
                    </div>

                    {/* Time slot */}
                    <span className="shrink-0 bg-slate-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl">
                      {a.timeSlot}
                    </span>

                    {/* Prioritize button */}
                    {!isPri && (
                      <button
                        onClick={() => handlePrioritize(a)}
                        disabled={isLoading}
                        title="Move to top and notify patient"
                        className="shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 text-xs font-bold hover:bg-amber-100 transition-colors disabled:opacity-50"
                      >
                        {isLoading ? (
                          <span className="w-3 h-3 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"/>
                        ) : (
                          <ArrowUp size={13}/>
                        )}
                        Prioritize
                      </button>
                    )}
                    {isPri && (
                      <div className="shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-100 text-blue-600 text-xs font-bold">
                        <AlertTriangle size={12}/>
                        Notified
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
