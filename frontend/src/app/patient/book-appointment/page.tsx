"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  Activity, Stethoscope, UserRound, CreditCard,
  FileText, Pill, Mail, LogOut, ArrowLeft, Calendar,
  CheckCircle2, AlertCircle, Clock, Building2, User,
} from "lucide-react";

const NAV_LINKS = [
  { label: "Profile",         href: "/patient/overview", icon: UserRound },
  { label: "Appointments",    href: "/patient/appointments", icon: Calendar },
  { label: "Medical Records", href: "/patient/medical-records", icon: FileText },
  { label: "Medications",     href: "/patient/medications", icon: Pill },
  { label: "Messages",        href: "/patient/messages", icon: Mail },
];

const DOCTOR_TYPES = [
  "General Physician",
  "Cardiologist",
  "Dermatologist",
  "Pediatrician",
  "Neurologist",
  "Orthopedic Surgeon",
  "Gynecologist",
  "Psychiatrist",
  "Ophthalmologist",
  "ENT Specialist",
  "Pulmonologist",
  "Gastroenterologist",
  "Endocrinologist",
  "Oncologist",
  "Urologist",
];

const TIME_SLOTS = [
  "08:00 AM", "08:30 AM", "09:00 AM", "09:30 AM",
  "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
  "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM",
  "03:00 PM", "03:30 PM", "04:00 PM", "04:30 PM",
  "05:00 PM", "05:30 PM",
];

// Helper to format date explicitly as dd-mm-yyyy
function formatDate(d: any) {
  if (!d) return "";
  const date = new Date(d);
  if (isNaN(date.getTime())) return typeof d === "string" ? d : "";
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
}

export default function BookAppointmentPage() {
  const router      = useRouter();
  const searchParams = useSearchParams();

  // Pre-fill from query params (passed from symptom-checker)
  const prefillSymptoms   = searchParams.get("symptoms") || "";
  const prefillDoctorType = searchParams.get("doctorType") || "";

  const [patientId,   setPatientId]   = useState("");
  const [patientName, setPatientName] = useState("");

  const [form, setForm] = useState({
    symptoms:   prefillSymptoms,
    doctorType: prefillDoctorType || "General Physician",
    doctorName: "",
    hospital:   "",
    date:       "",
    timeSlot:   "",
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error,   setError]   = useState("");

  useEffect(() => {
    const raw = localStorage.getItem("user");
    if (raw) {
      const user = JSON.parse(raw);
      setPatientId(user.id || user.patientId || "");
      setPatientName(user.name || "");
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  const set = (field: string, value: string) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // Today for min date
  const today = new Date().toISOString().split("T")[0];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!form.doctorName.trim()) { setError("Please enter the doctor's name."); return; }
    if (!form.hospital.trim())   { setError("Please enter the hospital/clinic name."); return; }
    if (!form.date)              { setError("Please select an appointment date."); return; }
    if (!form.timeSlot)          { setError("Please select a time slot."); return; }

    setLoading(true);
    try {
      const res = await fetch("http://localhost:5000/api/appointments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId:   patientId   || "guest",
          patientName: patientName || "Guest Patient",
          doctorId:    `DOC-${form.doctorType.replace(/\s+/g, "-").toUpperCase()}`,
          doctorName:  form.doctorName,
          hospital:    form.hospital,
          date:        form.date,
          timeSlot:    form.timeSlot,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Booking failed");
      setSuccess(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to book appointment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <Activity className="text-teal-500" size={22} />
          <span className="text-xl font-black text-teal-500 tracking-tight">HealthSphere</span>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          <Link href="/patient/overview"
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all font-semibold text-left mb-1">
            <ArrowLeft size={20} className="text-slate-400" />
            <span className="flex-1">Back to Dashboard</span>
          </Link>

          {NAV_LINKS.map((item) => (
            <Link key={item.label} href={item.href}
              className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all font-semibold text-left">
              <item.icon size={20} className="text-slate-400" />
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}

          <div className="pt-3 mt-3 border-t border-slate-100">
            <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-teal-50 text-teal-600 font-semibold shadow-sm">
              <Calendar size={20} className="text-teal-500" />
              <span className="flex-1">Book Appointment</span>
            </div>
          </div>
        </nav>

        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-3xl p-3 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-black">
                {patientName?.[0]?.toUpperCase() || "P"}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate leading-tight">{patientName || "Patient"}</p>
                <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter mt-0.5">Patient Account</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center justify-center gap-2 py-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600 transition-all text-sm font-semibold"
            >
              <LogOut size={14} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
        <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
          <div>
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Book Appointment</h1>
            <p className="text-sm text-slate-500 mt-0.5">Schedule a visit with a specialist</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hidden md:block">
            {new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, month: "2-digit", day: "2-digit", year: "numeric" })}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* ── Success State ── */}
            {success ? (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                <div className="px-8 py-10 flex flex-col items-center text-center gap-5">
                  <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
                    <CheckCircle2 size={44} className="text-teal-500" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black text-slate-800">Appointment Booked!</h2>
                    <p className="text-slate-500 mt-2 font-medium">
                      Your appointment with <span className="text-teal-600 font-bold">{form.doctorName}</span> at{" "}
                      <span className="text-teal-600 font-bold">{form.hospital}</span> has been confirmed.
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="w-full bg-slate-50 rounded-2xl p-6 border border-slate-100 text-left space-y-3 mt-2">
                    <div className="flex items-center gap-3 text-sm">
                      <User size={16} className="text-teal-500 shrink-0" />
                      <span className="text-slate-500 font-semibold w-28">Specialist</span>
                      <span className="text-slate-800 font-bold">{form.doctorType}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Stethoscope size={16} className="text-teal-500 shrink-0" />
                      <span className="text-slate-500 font-semibold w-28">Doctor</span>
                      <span className="text-slate-800 font-bold">{form.doctorName}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Building2 size={16} className="text-teal-500 shrink-0" />
                      <span className="text-slate-500 font-semibold w-28">Hospital</span>
                      <span className="text-slate-800 font-bold">{form.hospital}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar size={16} className="text-teal-500 shrink-0" />
                      <span className="text-slate-500 font-semibold w-28">Date</span>
                      <span className="text-slate-800 font-bold">
                        {new Date(form.date).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock size={16} className="text-teal-500 shrink-0" />
                      <span className="text-slate-500 font-semibold w-28">Time</span>
                      <span className="text-slate-800 font-bold">{form.timeSlot}</span>
                    </div>
                  </div>

                  <div className="flex gap-3 w-full mt-2">
                    <button
                      onClick={() => { setSuccess(false); setForm({ symptoms: "", doctorType: "General Physician", doctorName: "", hospital: "", date: "", timeSlot: "" }); }}
                      className="flex-1 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-all text-sm"
                    >
                      Book Another
                    </button>
                    <Link
                      href="/patient/overview"
                      className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-bold hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm text-sm flex items-center justify-center"
                    >
                      Go to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* ── Form Card ── */}
                <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
                  <div className="flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                      <Calendar size={22} className="text-teal-600" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-slate-800">Appointment Details</h2>
                      <p className="text-slate-500 text-sm">Fill in the details to schedule your visit</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">

                    {/* Patient Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Patient Name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={patientName} onChange={(e) => setPatientName(e.target.value)}
                        placeholder="Your full name" required
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-medium text-slate-700 bg-slate-50 transition-all" />
                    </div>

                    {/* Symptoms */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">Symptoms</label>
                      <textarea value={form.symptoms} onChange={(e) => set("symptoms", e.target.value)}
                        placeholder="Briefly describe your symptoms (optional)" rows={3}
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-medium text-slate-700 bg-slate-50 transition-all resize-none" />
                    </div>

                    {/* Doctor Type */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Specialist Type <span className="text-red-400">*</span>
                      </label>
                      <select value={form.doctorType} onChange={(e) => set("doctorType", e.target.value)} required
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-semibold text-slate-700 bg-slate-50 transition-all appearance-none cursor-pointer">
                        {DOCTOR_TYPES.map((t) => (<option key={t} value={t}>{t}</option>))}
                      </select>
                      {prefillDoctorType && (
                        <p className="text-xs text-teal-600 font-semibold mt-1.5 flex items-center gap-1">✨ Pre-filled from AI symptom analysis</p>
                      )}
                    </div>

                    {/* Doctor Name */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Doctor Name <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={form.doctorName} onChange={(e) => set("doctorName", e.target.value)}
                        placeholder="e.g. Dr. Aditi Verma" required
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-medium text-slate-700 bg-slate-50 transition-all" />
                    </div>

                    {/* Hospital */}
                    <div>
                      <label className="block text-sm font-bold text-slate-700 mb-1.5">
                        Hospital / Clinic <span className="text-red-400">*</span>
                      </label>
                      <input type="text" value={form.hospital} onChange={(e) => set("hospital", e.target.value)}
                        placeholder="e.g. Lilavati Hospital, Mumbai" required
                        className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-medium text-slate-700 bg-slate-50 transition-all" />
                    </div>

                    {/* Date + Time row */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Date <span className="text-red-400">*</span></label>
                        <input type="date" min={today} value={form.date} onChange={(e) => set("date", e.target.value)} required
                          className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-semibold text-slate-700 bg-slate-50 transition-all cursor-pointer" />
                      </div>
                      <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1.5">Time Slot <span className="text-red-400">*</span></label>
                        <select value={form.timeSlot} onChange={(e) => set("timeSlot", e.target.value)} required
                          className="w-full px-4 py-3.5 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-semibold text-slate-700 bg-slate-50 transition-all appearance-none cursor-pointer">
                          <option value="">Select a slot</option>
                          {TIME_SLOTS.map((t) => (<option key={t} value={t}>{t}</option>))}
                        </select>
                      </div>
                    </div>

                    {/* Error */}
                    {error && (
                      <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-2xl px-5 py-4 text-red-600 text-sm font-semibold">
                        <AlertCircle size={18} className="shrink-0" />
                        {error}
                      </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={loading}
                      className={`w-full py-4 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                        loading
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-sm hover:shadow-md"
                      }`}>
                      <Calendar size={18} />
                      {loading ? "Booking..." : "Confirm Appointment"}
                    </button>
                  </form>
                </div>

                {/* Info card */}
                <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-5 flex items-start gap-4">
                  <div className="w-9 h-9 bg-teal-100 rounded-xl flex items-center justify-center shrink-0 mt-0.5">
                    <Clock size={18} className="text-teal-600" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-teal-800">Appointment Confirmation</p>
                    <p className="text-xs text-teal-600 font-medium mt-0.5 leading-relaxed">
                      You will receive a confirmation once your appointment is booked. Please arrive 15 minutes before your scheduled time.
                    </p>
                  </div>
                </div>
              </>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
