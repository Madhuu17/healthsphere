"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Stethoscope, Calendar, Search, KeyRound, CheckCircle2,
  ChevronLeft, ChevronRight, X, Plus, Pill, FileText, Clock,
  LogOut, Activity, AlertCircle, Lock, Unlock, Image as ImageIcon,
  Users, Star, TrendingUp, Award, Phone, Mail, Paperclip, Send,
  BarChart2, Heart, BriefcaseMedical
} from "lucide-react";
import { useRouter } from "next/navigation";

const API = "http://localhost:5000";
const SLOT_TIMES = ["09:00 AM","09:30 AM","10:00 AM","10:30 AM","11:00 AM","11:30 AM",
                    "12:00 PM","02:00 PM","02:30 PM","03:00 PM","03:30 PM","04:00 PM"];

function getWeekDates(offset = 0) {
  const today = new Date();
  const sunday = new Date(today);
  sunday.setDate(today.getDate() - today.getDay() + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sunday);
    d.setDate(sunday.getDate() + i);
    return d;
  });
}

function toYMD(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${dd}`;
}

const TYPE_META: Record<string, { color: string; bg: string; icon: any }> = {
  prescription: { color: "text-purple-600", bg: "bg-purple-100", icon: Pill },
  consultation: { color: "text-teal-600",   bg: "bg-teal-100",   icon: Stethoscope },
  lab_report:   { color: "text-red-600",    bg: "bg-red-100",    icon: BarChart2 },
  xray:         { color: "text-blue-600",   bg: "bg-blue-100",   icon: ImageIcon },
  vaccination:  { color: "text-green-600",  bg: "bg-green-100",  icon: Heart },
};

export default function DoctorDashboard() {
  const router = useRouter();

  /* ── Doctor state ── */
  const [doctor, setDoctor]             = useState<any>(null);
  const [doctorProfile, setDoctorProfile] = useState<any>(null);
  const [tab, setTab]                   = useState<"home"|"schedule"|"patient">("home");

  /* ── Schedule ── */
  const [weekOffset, setWeekOffset]   = useState(0);
  const [weekDates, setWeekDates]     = useState<Date[]>([]);
  const [appointments, setAppointments] = useState<any[]>([]);
  const [activeSlot, setActiveSlot]   = useState<string | null>(null);
  const [blockedDates, setBlockedDates] = useState<string[]>([]);
  const [leaveMode, setLeaveMode]     = useState(false);

  /* ── Patient access ── */
  const [searchId, setSearchId]         = useState("");
  const [otp, setOtp]                   = useState(["","","","","",""]);
  const [accessStep, setAccessStep]     = useState<"search"|"otp"|"view">("search");
  const [accessError, setAccessError]   = useState("");
  const [accessLoading, setAccessLoading] = useState(false);
  const [patientData, setPatientData]   = useState<any>(null);
  const [patientTimeline, setPatientTimeline] = useState<any[]>([]);

  /* ── Add Record modal ── */
  const [showAddRecord, setShowAddRecord] = useState(false);
  const [newRecord, setNewRecord]     = useState({ type: "prescription", title: "", description: "" });
  const [uploading, setUploading]     = useState(false);
  const [attachedFiles, setAttachedFiles] = useState<File[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  /* ── Helpers ── */
  const today = toYMD(new Date());
  const dayNames = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

  const fetchSchedule = useCallback(async (doctorId: string) => {
    try {
      const res = await fetch(`${API}/api/doctor/schedule/${doctorId}`);
      const data = await res.json();
      setAppointments(Array.isArray(data) ? data : []);
    } catch {}
  }, []);

  const fetchProfile = useCallback(async (doctorId: string) => {
    try {
      const res = await fetch(`${API}/api/doctor/profile/${doctorId}`);
      const data = await res.json();
      setDoctorProfile(data);
      if (data.blockedDates) setBlockedDates(data.blockedDates);
    } catch {}
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "null");
    if (!user || user.role !== "doctor") { router.push("/login"); return; }

    // ── First-login guard ────────────────────────────────────────────────────
    if (!user.isProfileCompleted) { router.push("/doctor/setup-profile"); return; }

    setDoctor(user);
    fetchSchedule(user.id);
    fetchProfile(user.id);
  }, []);

  useEffect(() => {
    setWeekDates(getWeekDates(weekOffset));
    if (doctor) fetchSchedule(doctor.id);
  }, [weekOffset, doctor]);

  const toggleBlock = async (date: string) => {
    if (!doctor) return;
    const nb = blockedDates.includes(date)
      ? blockedDates.filter(d => d !== date)
      : [...blockedDates, date];
    setBlockedDates(nb);
    await fetch(`${API}/api/doctor/blocked-dates`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: doctor.id, blockedDates: nb })
    });
  };

  const getSlotsForDay = (date: Date) => appointments.filter(a => a.date === toYMD(date));

  const isExpiredSlot = (date: Date, slot: string) => {
    const [time, period] = slot.split(" ");
    let [h, m] = time.split(":").map(Number);
    if (period === "PM" && h !== 12) h += 12;
    if (period === "AM" && h === 12) h = 0;
    const dt = new Date(date); dt.setHours(h, m, 0, 0);
    return new Date() > dt;
  };

  const totalApptThisWeek = weekDates.reduce((acc, d) => acc + getSlotsForDay(d).length, 0);

  /* ── Patient OTP access ── */
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessLoading(true); setAccessError("");
    try {
      const res = await fetch(`${API}/api/doctor/search`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: searchId })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setAccessStep("otp");
    } catch (err: any) { setAccessError(err.message); }
    finally { setAccessLoading(false); }
  };

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setAccessLoading(true); setAccessError("");
    try {
      const res = await fetch(`${API}/api/doctor/verify`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ patientId: searchId, otp: otp.join("") })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setPatientData(data.patient);
      setPatientTimeline(data.timeline || []);
      setAccessStep("view");
    } catch (err: any) { setAccessError(err.message); }
    finally { setAccessLoading(false); }
  };

  /* ── Add record with file upload ── */
  const handleAddRecord = async () => {
    if (!patientData || !doctor || !newRecord.title || !newRecord.description) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("patientId",   patientData.patientId);
      fd.append("doctorId",    doctor.id);
      fd.append("doctorName",  doctor.name);
      fd.append("type",        newRecord.type);
      fd.append("title",       newRecord.title);
      fd.append("description", newRecord.description);
      fd.append("date",        new Date().toISOString());
      attachedFiles.forEach(f => fd.append("attachments", f));

      const res = await fetch(`${API}/api/doctor/add-record`, { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      setPatientTimeline(prev => [data.record, ...prev]);
      setShowAddRecord(false);
      setNewRecord({ type: "prescription", title: "", description: "" });
      setAttachedFiles([]);
    } catch (err: any) { alert(err.message); }
    finally { setUploading(false); }
  };

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/login"); };

  if (!doctor) return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center">
      <div className="flex items-center gap-3 text-blue-600 font-bold text-lg">
        <div className="w-6 h-6 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"/>
        Loading Dashboard...
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ══ SIDEBAR ══ */}
      <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col z-40 shadow-2xl">
        {/* Logo */}
        <div className="px-6 py-7 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
              <Stethoscope size={22} className="text-white"/>
            </div>
            <div>
              <p className="font-black text-white text-lg leading-tight">HealthSphere</p>
              <p className="text-blue-400 text-xs font-semibold">Provider Portal</p>
            </div>
          </div>
        </div>

        {/* Doctor profile card */}
        {doctorProfile && (
          <div className="px-4 py-5 border-b border-slate-800">
            <div className="bg-slate-800 rounded-2xl p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                  {doctor.name?.[0]?.toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="text-white font-bold text-sm truncate">{doctor.name}</p>
                  <p className="text-blue-300 text-xs truncate">{doctorProfile.designation || doctorProfile.specialization}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-slate-700 rounded-xl p-2 text-center">
                  <p className="text-blue-300 text-xs font-semibold">{doctorProfile.experience || 0}yrs</p>
                  <p className="text-slate-400 text-[10px]">Experience</p>
                </div>
                <div className="bg-slate-700 rounded-xl p-2 text-center">
                  <p className="text-blue-300 text-xs font-semibold">{totalApptThisWeek}</p>
                  <p className="text-slate-400 text-[10px]">This Week</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="px-4 py-4 flex-1 space-y-1">
          {([
            ["home",     "Overview",        BarChart2],
            ["schedule", "Weekly Schedule", Calendar],
            ["patient",  "Patient Records", Search],
          ] as const).map(([id, label, Icon]) => (
            <button key={id} onClick={() => setTab(id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                tab === id
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}>
              <Icon size={18}/>{label}
            </button>
          ))}
        </nav>

        {/* Doctor info */}
        {doctorProfile && (
          <div className="px-4 pb-4 space-y-2">
            <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-2">
              <div className="flex items-center gap-2 text-slate-300">
                <BriefcaseMedical size={13} className="text-blue-400 shrink-0"/>
                <span className="truncate">{doctorProfile.hospital}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Award size={13} className="text-blue-400 shrink-0"/>
                <span className="truncate">{doctorProfile.qualification}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail size={13} className="text-blue-400 shrink-0"/>
                <span className="truncate">{doctor.email}</span>
              </div>
            </div>
            <button onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all">
              <LogOut size={16}/> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* ══ MAIN CONTENT ══ */}
      <div className="ml-64 min-h-screen">

        {/* ── Top Bar ── */}
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 h-16 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-black text-slate-800">
              {tab === "home" ? "Overview" : tab === "schedule" ? "Weekly Schedule" : "Patient Records"}
            </h1>
            <p className="text-xs text-slate-400 font-medium">
              {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"/>
            <span className="text-xs text-slate-500 font-semibold">System Online</span>
          </div>
        </header>

        <div className="p-8">

          {/* ════════════════ HOME / OVERVIEW TAB ════════════════ */}
          {tab === "home" && (
            <div className="space-y-8">

              {/* Stats row */}
              <div className="grid grid-cols-4 gap-5">
                {[
                  { label: "Appointments This Week", value: totalApptThisWeek, icon: Calendar,       color: "bg-blue-500",   light: "bg-blue-50   text-blue-600" },
                  { label: "Leave Days Blocked",     value: blockedDates.length, icon: Lock,         color: "bg-red-500",    light: "bg-red-50    text-red-600" },
                  { label: "Years Experience",        value: doctorProfile?.experience || "—", icon: Award, color: "bg-purple-500", light: "bg-purple-50 text-purple-600" },
                  { label: "Specialization",          value: doctorProfile?.specialization || "—", icon: Stethoscope, color: "bg-teal-500", light: "bg-teal-50 text-teal-600" },
                ].map(({ label, value, icon: Icon, color, light }) => (
                  <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                    <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                      <Icon size={20} className="text-white"/>
                    </div>
                    <p className="text-2xl font-black text-slate-800">{value}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{label}</p>
                  </div>
                ))}
              </div>

              {/* Doctor Profile Card */}
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <h2 className="text-base font-black text-slate-700 uppercase tracking-wider mb-6">Professional Profile</h2>
                  <div className="flex items-start gap-6">
                    <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/30 shrink-0">
                      {doctor.name?.[0]?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-black text-slate-900">{doctor.name}</h3>
                      <p className="text-blue-600 font-bold">{doctorProfile?.designation}</p>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        {[
                          ["Specialization", doctorProfile?.specialization],
                          ["Qualification",  doctorProfile?.qualification],
                          ["Hospital",       doctorProfile?.hospital],
                          ["Experience",     doctorProfile?.experience ? `${doctorProfile.experience} years` : "—"],
                          ["Contact",        doctorProfile?.contactNumber],
                          ["Age",            doctorProfile?.age ? `${doctorProfile.age} years` : "—"],
                        ].map(([k,v]) => (
                          <div key={k} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{k}</p>
                            <p className="font-bold text-slate-700 text-sm mt-0.5 truncate">{v || "—"}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Today's schedule summary */}
                <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                  <h2 className="text-base font-black text-slate-700 uppercase tracking-wider mb-5">Today's Appointments</h2>
                  {(() => {
                    const todayAppts = appointments.filter(a => a.date === today);
                    return todayAppts.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar size={36} className="mx-auto text-slate-200 mb-3"/>
                        <p className="text-slate-400 text-sm font-medium">No appointments today</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {todayAppts.map((a: any, i: number) => (
                          <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                            <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                              {a.patientName?.[0]?.toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 text-sm truncate">{a.patientName}</p>
                              <p className="text-xs text-blue-500 font-semibold">{a.timeSlot}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              </div>

              {/* Upcoming appointments from this week */}
              <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-base font-black text-slate-700 uppercase tracking-wider">Upcoming This Week</h2>
                  <button onClick={() => setTab("schedule")} className="text-blue-600 text-sm font-bold hover:underline">
                    View Full Schedule →
                  </button>
                </div>
                {appointments.length === 0 ? (
                  <p className="text-slate-400 text-sm text-center py-8">No appointments scheduled this week.</p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-slate-100">
                          {["Patient", "Date", "Time", "Hospital", "Status"].map(h => (
                            <th key={h} className="pb-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {appointments.slice(0, 8).map((a: any, i: number) => (
                          <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                            <td className="py-3.5 font-bold text-slate-800">{a.patientName}</td>
                            <td className="py-3.5 text-slate-500">{a.date}</td>
                            <td className="py-3.5 text-slate-500">{a.timeSlot}</td>
                            <td className="py-3.5 text-slate-500 truncate max-w-[150px]">{a.hospital}</td>
                            <td className="py-3.5">
                              <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                                a.status === "scheduled" ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-400"
                              }`}>{a.status}</span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ════════════════ WEEKLY SCHEDULE TAB ════════════════ */}
          {tab === "schedule" && (
            <div className="space-y-4">
              {/* Controls */}
              <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <button onClick={() => setWeekOffset(w => w - 1)}
                    className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <ChevronLeft size={18}/>
                  </button>
                  <span className="font-bold text-slate-800 text-sm">
                    {weekDates[0] ? `${weekDates[0].toLocaleDateString("en-IN",{day:"numeric",month:"short"})} – ${weekDates[6]?.toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}` : ""}
                  </span>
                  <button onClick={() => setWeekOffset(w => w + 1)}
                    className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
                    <ChevronRight size={18}/>
                  </button>
                  <button onClick={() => setWeekOffset(0)}
                    className="px-3 py-1.5 text-xs font-bold text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">Today</button>
                </div>
                <button onClick={() => setLeaveMode(!leaveMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${leaveMode ? "bg-red-500 text-white" : "bg-slate-100 text-slate-600 hover:bg-slate-200"}`}>
                  {leaveMode ? <><Unlock size={14}/> Exit Leave Mode</> : <><Lock size={14}/> Block Leave Dates</>}
                </button>
              </div>

              {leaveMode && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex items-center gap-3">
                  <AlertCircle size={20} className="text-amber-600 shrink-0"/>
                  <p className="text-amber-800 text-sm font-medium">
                    <strong>Leave Mode Active:</strong> Click any date header to toggle leave. Patients cannot book on blocked dates.
                  </p>
                </div>
              )}

              {/* Weekly Grid */}
              <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Date Headers */}
                <div className="grid grid-cols-8 border-b border-slate-200">
                  <div className="p-4 text-xs font-bold text-slate-400 uppercase tracking-wider border-r border-slate-200 bg-slate-50">Time</div>
                  {weekDates.map((date, i) => {
                    const ymd = toYMD(date);
                    const isToday = ymd === today;
                    const isBlocked = blockedDates.includes(ymd);
                    const dayAppts = getSlotsForDay(date).length;
                    return (
                      <div key={i} onClick={() => leaveMode && toggleBlock(ymd)}
                        className={`p-4 text-center border-r border-slate-200 last:border-r-0 transition-all
                          ${leaveMode ? "cursor-pointer hover:bg-red-50" : ""}
                          ${isBlocked ? "bg-red-50" : isToday ? "bg-blue-50" : ""}`}>
                        <p className="text-xs font-bold text-slate-400 uppercase">{dayNames[i]}</p>
                        <p className={`text-xl font-black mt-1 ${isToday ? "text-blue-600" : "text-slate-700"}`}>{date.getDate()}</p>
                        {isBlocked
                          ? <span className="text-[10px] font-black text-red-500 uppercase">LEAVE</span>
                          : dayAppts > 0
                            ? <span className="text-[10px] font-black text-teal-500">{dayAppts} appt{dayAppts > 1 ? "s" : ""}</span>
                            : null
                        }
                      </div>
                    );
                  })}
                </div>

                {/* Time Slot Rows */}
                <div className="overflow-y-auto max-h-[500px]">
                  {SLOT_TIMES.map(slot => (
                    <div key={slot} className="grid grid-cols-8 border-b border-slate-100 last:border-b-0">
                      <div className="p-3 px-4 text-xs font-bold text-slate-400 border-r border-slate-200 flex items-center bg-slate-50/50">{slot}</div>
                      {weekDates.map((date, di) => {
                        const ymd = toYMD(date);
                        const isBlocked = blockedDates.includes(ymd);
                        const appts = getSlotsForDay(date).filter(a => a.timeSlot === slot);
                        const expired = isExpiredSlot(date, slot);

                        return (
                          <div key={di} className={`p-1.5 border-r border-slate-100 last:border-r-0 min-h-[52px] ${isBlocked ? "bg-red-50/30" : ""}`}>
                            {isBlocked ? (
                              <div className="h-full flex items-center justify-center">
                                <X size={12} className="text-red-200"/>
                              </div>
                            ) : appts.map(appt => (
                              <div key={appt._id} className="relative">
                                <button onClick={() => setActiveSlot(activeSlot === appt._id ? null : appt._id)}
                                  className={`w-full text-left px-2 py-1.5 rounded-lg text-[10px] font-bold transition-all leading-tight ${
                                    expired ? "bg-slate-100 text-slate-300 line-through" : "bg-blue-100 text-blue-700 hover:bg-blue-200"
                                  }`}>
                                  <p className="truncate">{appt.patientName?.split(" ")[0]}</p>
                                  <p className="opacity-60 font-mono truncate text-[9px]">{appt.patientId}</p>
                                </button>
                                <AnimatePresence>
                                  {activeSlot === appt._id && (
                                    <motion.div initial={{ opacity:0, y:-6, scale:0.95 }} animate={{ opacity:1, y:0, scale:1 }} exit={{ opacity:0, scale:0.95 }}
                                      className="absolute top-full left-0 z-30 bg-white border border-blue-200 rounded-xl shadow-2xl p-3 min-w-[170px] mt-1">
                                      <p className="text-[10px] text-blue-500 font-black uppercase mb-1">Patient Info</p>
                                      <p className="font-bold text-slate-800 text-sm">{appt.patientName}</p>
                                      <p className="text-xs text-slate-500 font-mono mt-0.5">{appt.patientId}</p>
                                      <div className="border-t border-slate-100 mt-2 pt-2 space-y-1">
                                        <p className="text-[10px] text-slate-400">{slot} · {date.toLocaleDateString("en-IN",{day:"numeric",month:"short"})}</p>
                                        <p className="text-[10px] text-slate-400">{appt.hospital}</p>
                                        <span className={`inline-block text-[10px] font-black px-2 py-0.5 rounded-full ${expired ? "bg-slate-100 text-slate-400" : "bg-teal-50 text-teal-600"}`}>
                                          {expired ? "Completed" : "Scheduled"}
                                        </span>
                                      </div>
                                    </motion.div>
                                  )}
                                </AnimatePresence>
                              </div>
                            ))}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* ════════════════ PATIENT RECORDS TAB ════════════════ */}
          {tab === "patient" && (
            <div className="max-w-3xl space-y-5">

              {/* ── Search Step ── */}
              {accessStep === "search" && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
                  <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-blue-50/30">
                    <Search size={32} className="text-blue-500"/>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Access Patient Records</h2>
                  <p className="text-slate-500 mb-8 text-sm max-w-sm mx-auto">Enter the Patient ID to initiate a secure OTP-gated access request.</p>
                  <form onSubmit={handleSearch} className="flex gap-3 max-w-sm mx-auto">
                    <input type="text" value={searchId} onChange={e => setSearchId(e.target.value)} required
                      placeholder="PID-XXXXX"
                      className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 outline-none font-bold tracking-wider text-center"/>
                    <button type="submit" disabled={accessLoading}
                      className="bg-blue-600 text-white font-bold px-6 py-3 rounded-xl hover:bg-blue-700 disabled:bg-blue-400 transition-colors">
                      {accessLoading ? "..." : "Search"}
                    </button>
                  </form>
                  {accessError && <p className="text-red-500 text-sm mt-4 font-medium">{accessError}</p>}
                </motion.div>
              )}

              {/* ── OTP Step ── */}
              {accessStep === "otp" && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
                  className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 max-w-sm mx-auto text-center">
                  <div className="w-16 h-16 bg-amber-50 text-amber-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <KeyRound size={28}/>
                  </div>
                  <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Patient Consent OTP</h2>
                  <p className="text-slate-500 text-sm mb-6">OTP sent to patient. Dev bypass: <code className="bg-slate-100 px-1.5 rounded font-mono text-xs">000000</code></p>
                  <form onSubmit={handleVerify} className="space-y-6">
                    <div className="flex justify-between gap-2">
                      {otp.map((d, idx) => (
                        <input key={idx} id={`otp-${idx}`} type="text" maxLength={1} value={d}
                          onChange={e => {
                            const n = [...otp]; n[idx] = e.target.value; setOtp(n);
                            if (e.target.value && idx < 5) document.getElementById(`otp-${idx+1}`)?.focus();
                          }}
                          className="w-12 h-14 text-center text-2xl font-bold rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none"/>
                      ))}
                    </div>
                    {accessError && <p className="text-red-500 text-sm">{accessError}</p>}
                    <button type="submit" disabled={accessLoading}
                      className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl flex items-center justify-center gap-2 hover:bg-slate-800 disabled:bg-slate-700">
                      <CheckCircle2 size={18}/>{accessLoading ? "Verifying..." : "Verify & Access"}
                    </button>
                    <button type="button" onClick={() => { setAccessStep("search"); setAccessError(""); }}
                      className="text-slate-500 text-sm hover:text-slate-700">← Back</button>
                  </form>
                </motion.div>
              )}

              {/* ── Patient View ── */}
              {accessStep === "view" && patientData && (
                <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} className="space-y-5">

                  {/* Patient Header */}
                  <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-teal-400 to-teal-600 rounded-2xl flex items-center justify-center text-white text-2xl font-black shadow-lg shadow-teal-500/30">
                          {patientData.name?.[0]?.toUpperCase()}
                        </div>
                        <div>
                          <h2 className="text-xl font-black text-slate-900">{patientData.name}</h2>
                          <div className="flex flex-wrap gap-3 mt-1">
                            <span className="text-xs text-slate-500 font-semibold">{patientData.patientId}</span>
                            <span className="text-xs text-slate-500">Age {patientData.age}</span>
                            <span className="text-xs text-slate-500">{patientData.gender}</span>
                            <span className="text-xs bg-red-50 text-red-600 font-black px-2 py-0.5 rounded-full">{patientData.bloodGroup}</span>
                          </div>
                          <div className="flex gap-3 mt-1">
                            <span className="text-xs text-slate-400">{patientData.email}</span>
                            <span className="text-xs text-slate-400">{patientData.contactNumber}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => setShowAddRecord(true)}
                          className="bg-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-blue-700 shadow-md shadow-blue-600/20">
                          <Plus size={16}/> Add Record
                        </button>
                        <button onClick={() => { setAccessStep("search"); setPatientData(null); setOtp(["","","","","",""]); setSearchId(""); }}
                          className="bg-slate-100 text-slate-600 px-4 py-2 rounded-xl font-bold text-sm hover:bg-slate-200">Close</button>
                      </div>
                    </div>
                  </div>

                  {/* Add Record Modal */}
                  <AnimatePresence>
                    {showAddRecord && (
                      <motion.div initial={{ opacity:0, y:-10 }} animate={{ opacity:1, y:0 }} exit={{ opacity:0 }}
                        className="bg-white rounded-3xl p-7 border-2 border-blue-200 shadow-2xl">
                        <div className="flex items-center justify-between mb-5">
                          <h3 className="font-black text-slate-800 flex items-center gap-2 text-lg">
                            <Plus size={20} className="text-blue-600"/> New Medical Record
                          </h3>
                          <button onClick={() => { setShowAddRecord(false); setAttachedFiles([]); }}
                            className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                            <X size={16}/>
                          </button>
                        </div>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Record Type</label>
                            <select value={newRecord.type} onChange={e => setNewRecord(r => ({...r, type: e.target.value}))}
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-sm bg-slate-50">
                              <option value="prescription">💊 Prescription</option>
                              <option value="consultation">🩺 Consultation Note</option>
                              <option value="lab_report">🔬 Lab Report</option>
                              <option value="xray">🩻 X-Ray / Scan</option>
                              <option value="vaccination">💉 Vaccination</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-bold text-slate-600 mb-1.5">Title / Medicine Name</label>
                            <input type="text" value={newRecord.title} onChange={e => setNewRecord(r => ({...r, title: e.target.value}))}
                              placeholder="e.g. Amoxicillin 500mg" required
                              className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-sm"/>
                          </div>
                        </div>
                        <div className="mb-4">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Description / Dosage / Findings</label>
                          <textarea value={newRecord.description} onChange={e => setNewRecord(r => ({...r, description: e.target.value}))}
                            placeholder="Detailed notes, dosage instructions, or clinical findings..." rows={4} required
                            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm resize-none"/>
                        </div>

                        {/* File attachments */}
                        <div className="mb-5">
                          <label className="block text-xs font-bold text-slate-600 mb-1.5">Attach Images / Reports (X-rays, scans, PDFs)</label>
                          <input type="file" ref={fileRef} accept="image/*,.pdf" multiple
                            onChange={e => setAttachedFiles(Array.from(e.target.files || []))}
                            className="hidden"/>
                          <button type="button" onClick={() => fileRef.current?.click()}
                            className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all font-medium text-sm group">
                            <Paperclip size={22} className="group-hover:scale-110 transition-transform"/>
                            Click to attach files
                            <span className="text-xs text-slate-400">Images, PDFs · Max 10MB each</span>
                          </button>
                          {attachedFiles.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {attachedFiles.map((f, i) => (
                                <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                                  <ImageIcon size={14} className="text-blue-500 shrink-0"/>
                                  <span className="text-xs font-medium text-slate-600 flex-1 truncate">{f.name}</span>
                                  <span className="text-xs text-slate-400">{(f.size/1024).toFixed(0)} KB</span>
                                  <button onClick={() => setAttachedFiles(prev => prev.filter((_,j) => j !== i))}
                                    className="text-slate-300 hover:text-red-400"><X size={12}/></button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        <div className="flex gap-3 justify-end">
                          <button onClick={() => { setShowAddRecord(false); setAttachedFiles([]); }}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                          <button onClick={handleAddRecord}
                            disabled={uploading || !newRecord.title || !newRecord.description}
                            className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-md shadow-blue-600/20">
                            <Send size={15}/>{uploading ? "Uploading..." : "Save & Send to Patient"}
                          </button>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Patient Timeline */}
                  <div className="bg-white rounded-3xl p-7 shadow-sm border border-slate-100">
                    <h3 className="font-black text-slate-800 mb-6 flex items-center gap-2 text-base">
                      <Clock size={18} className="text-blue-600"/> Medical History & Timeline
                    </h3>
                    {patientTimeline.length === 0 ? (
                      <div className="text-center py-10">
                        <FileText size={40} className="mx-auto text-slate-200 mb-3"/>
                        <p className="text-slate-400 text-sm">No records yet. Add the first record above.</p>
                      </div>
                    ) : (
                      <div className="relative">
                        {/* Vertical line */}
                        <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-slate-100"/>
                        <div className="space-y-4">
                          {patientTimeline.map((r: any, i: number) => {
                            const meta = TYPE_META[r.type] || TYPE_META.consultation;
                            const Icon = meta.icon;
                            return (
                              <div key={r._id || i} className="flex gap-4 relative">
                                <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 relative z-10 ${meta.bg} ${meta.color}`}>
                                  <Icon size={18}/>
                                </div>
                                <div className="flex-1 bg-slate-50 rounded-2xl p-4 border border-slate-100 hover:border-blue-100 transition-all">
                                  <div className="flex items-start justify-between gap-2">
                                    <div>
                                      <p className="font-bold text-slate-800">{r.title}</p>
                                      <p className="text-xs text-slate-400 mt-0.5">{new Date(r.date).toLocaleDateString("en-IN",{day:"numeric",month:"short",year:"numeric"})}</p>
                                    </div>
                                    <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                                      {r.type?.replace("_"," ")}
                                    </span>
                                  </div>
                                  <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.description}</p>
                                  {/* Attachments / images */}
                                  {r.attachments?.length > 0 && (
                                    <div className="mt-3 grid grid-cols-3 gap-2">
                                      {r.attachments.map((url: string, j: number) => (
                                        url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                          <a key={j} href={url} target="_blank" rel="noreferrer">
                                            <img src={url} alt="attachment" className="w-full h-24 object-cover rounded-xl border border-slate-200 hover:opacity-90 transition-opacity"/>
                                          </a>
                                        ) : (
                                          <a key={j} href={url} target="_blank" rel="noreferrer"
                                            className="flex items-center gap-2 bg-white border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-all">
                                            <FileText size={12}/> View Report
                                          </a>
                                        )
                                      ))}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
