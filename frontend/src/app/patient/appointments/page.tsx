"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Calendar as CalendarIcon, Stethoscope, Clock, CheckCircle2,
  XCircle, ChevronDown, ChevronUp, FileText, AlertCircle,
  ArrowUpDown, Pill,
} from "lucide-react";
import { usePatient } from "../_context/PatientContext";

// ── Status chip ────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    scheduled: "bg-teal-100 text-teal-700",
    completed: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-600",
  };
  return (
    <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${map[status] || "bg-slate-100 text-slate-500"}`}>
      {status}
    </span>
  );
}

// ── Single appointment card ────────────────────────────────────────────────
function AppointmentCard({ appt, formatDate }: { appt: any; formatDate: (d: any) => string }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="bg-white rounded-2xl border border-teal-100 shadow-sm hover:shadow-md hover:border-teal-200 transition-all overflow-hidden">
      {/* Header strip */}
      <div className="h-1 w-full bg-gradient-to-r from-teal-400 to-emerald-500"/>

      <div className="p-5">
        {/* Row 1: icon + doctor + status */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center shrink-0">
              <Stethoscope size={18} className="text-teal-600" />
            </div>
            <div>
              <h4 className="font-bold text-slate-800 text-sm leading-tight">{appt.doctorName}</h4>
              <p className="text-xs text-slate-500 mt-0.5">{appt.hospital}</p>
            </div>
          </div>
          <StatusBadge status={appt.status} />
        </div>

        {/* Row 2: Date + Time */}
        <div className="flex gap-4 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CalendarIcon size={12} className="text-slate-400" />
            <span className="font-semibold">{formatDate(appt.date)}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock size={12} className="text-slate-400" />
            <span className="font-semibold">{appt.timeSlot}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Page
// ══════════════════════════════════════════════════════════════════════════
export default function PatientAppointments() {
  const { upcomingAppointments, appointmentsLoading, openAppt, formatDate } = usePatient();
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  function parseTimeSlot(slot: string): number {
    const m = (slot || "").match(/(\d+):(\d+)\s*(AM|PM)/i);
    if (!m) return 0;
    let h = parseInt(m[1]), min = parseInt(m[2]);
    if (m[3].toUpperCase() === "PM" && h !== 12) h += 12;
    if (m[3].toUpperCase() === "AM" && h === 12) h = 0;
    return h * 60 + min;
  }

  function applySort(list: any[]) {
    return [...list].sort((a, b) => {
      const dateComp = a.date.localeCompare(b.date);
      if (dateComp !== 0) return sortOrder === "asc" ? dateComp : -dateComp;
      const pa = parseTimeSlot(a.timeSlot), pb = parseTimeSlot(b.timeSlot);
      return sortOrder === "asc" ? pa - pb : pb - pa;
    });
  }

  const sortedUpcoming = applySort(upcomingAppointments);

  if (appointmentsLoading) {
    return (
      <div className="max-w-[1400px] flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-teal-600 font-bold text-lg">
          <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin" />
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px] space-y-10">
      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-teal-500 via-emerald-500 to-cyan-600 rounded-3xl p-7 flex items-center gap-6 shadow-xl shadow-teal-500/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <CalendarIcon size={32} className="text-white" />
        </div>
        <div className="flex-1 relative z-10">
          <h2 className="text-2xl font-black text-white">Upcoming Appointments</h2>
          <p className="text-teal-100 text-sm mt-1">
            Only scheduled future visits are shown here. Completed appointments appear in your{" "}
            <span className="font-bold underline">Timeline</span>.
          </p>
        </div>
        <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20 shrink-0">
          <p className="text-white text-2xl font-black">{upcomingAppointments.length}</p>
          <p className="text-teal-100 text-[10px] font-bold uppercase tracking-wider">Scheduled</p>
        </div>
      </div>

      {/* ── Upcoming Appointments ── */}
      <section>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-xl font-bold text-slate-800">Upcoming Appointments</h3>
            <p className="text-slate-400 text-xs mt-0.5">
              Sorted {sortOrder === "asc" ? "earliest → latest" : "latest → earliest"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSortOrder(s => s === "asc" ? "desc" : "asc")}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-slate-200 text-xs font-bold text-slate-500 hover:border-teal-300 hover:text-teal-600 transition-all"
            >
              <ArrowUpDown size={13} /> {sortOrder === "asc" ? "Earliest First" : "Latest First"}
            </button>
            <button
              onClick={openAppt}
              className="bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-600 transition-colors"
            >
              + Book New
            </button>
          </div>
        </div>

        {sortedUpcoming.length === 0 ? (
          <div className="bg-white rounded-3xl p-14 border border-dashed border-slate-200 flex flex-col items-center text-center gap-4">
            <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
              <CalendarIcon size={30} className="text-teal-400" />
            </div>
            <div>
              <p className="text-slate-700 font-bold text-lg">No upcoming appointments</p>
              <p className="text-slate-400 text-sm mt-1">Use the "Book New" button to schedule a visit.</p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {sortedUpcoming.map((a: any, i: number) => (
              <AppointmentCard key={a.appointmentId || a._id || i} appt={a} formatDate={formatDate} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
