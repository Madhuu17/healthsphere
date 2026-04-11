"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Activity, Stethoscope, UserRound, CreditCard,
  FileText, Pill, Mail, LogOut, ArrowLeft, Calendar,
} from "lucide-react";


interface SymptomResult {
  severity: number;
  explanation: string;
  recommendation: "home" | "consult";
  possibleConditions?: string[];
}

interface DoctorMatchResult {
  specialization: string;
  urgency: string;
  reason: string;
  alternativeSpecializations?: string[];
}

const NAV_LINKS = [
  { label: "Profile",         href: "/patient/overview", icon: UserRound },
  { label: "Appointments",    href: "/patient/appointments", icon: Calendar },
  { label: "Medical Records", href: "/patient/medical-records", icon: FileText },
  { label: "Medications",     href: "/patient/medications", icon: Pill },
  { label: "Messages",        href: "/patient/messages", icon: Mail },
];

const severityColor = (s: number) =>
  s <= 3 ? "#16a34a" : s <= 6 ? "#d97706" : "#dc2626";

const severityLabel = (s: number) =>
  s <= 3 ? "Mild" : s <= 6 ? "Moderate" : "Severe";

export default function SymptomCheckerPage() {
  const router = useRouter();
  const [symptoms, setSymptoms] = useState("");
  const [result, setResult] = useState<SymptomResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [doctorMatch, setDoctorMatch] = useState<DoctorMatchResult | null>(null);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState("");

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("isLoggedIn");
    router.push("/login");
  };

  const handleCheck = async () => {
    if (!symptoms.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    setDoctorMatch(null);
    setMatchError("");
    try {
      const res = await fetch("http://localhost:5000/api/ai/symptoms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Something went wrong");
      setResult(data.data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to analyze symptoms. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleBookAppointment = async () => {
    if (!symptoms.trim()) return;
    setMatchLoading(true);
    setDoctorMatch(null);
    setMatchError("");
    try {
      const res = await fetch("http://localhost:5000/api/ai/match-doctor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ symptoms }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Doctor matching failed");
      setDoctorMatch(data.data);
    } catch (err: unknown) {
      setMatchError(err instanceof Error ? err.message : "Failed to match doctor. Please try again.");
    } finally {
      setMatchLoading(false);
    }
  };

  const urgencyStyle = (urgency: string) => {
    if (urgency === "emergency") return "bg-red-50 text-red-700 border-red-200";
    if (urgency === "urgent")    return "bg-yellow-50 text-yellow-700 border-yellow-200";
    return "bg-green-50 text-green-700 border-green-200";
  };

  const urgencyIcon = (urgency: string) => {
    if (urgency === "emergency") return "🚨";
    if (urgency === "urgent")    return "⚡";
    return "📅";
  };

  const urgencyLabel = (urgency: string) => {
    if (urgency === "emergency") return "Emergency — Go to ER Now";
    if (urgency === "urgent")    return "Urgent — See within 48h";
    return "Routine Visit";
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
          {/* Back to Dashboard */}
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

          {/* Active: Symptom Checker */}
          <div className="pt-3 mt-3 border-t border-slate-100">
            <div className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-teal-50 text-teal-600 font-semibold shadow-sm">
              <Stethoscope size={20} className="text-teal-500" />
              <span className="flex-1">Check Symptoms</span>
            </div>
          </div>
        </nav>

        {/* User footer */}
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-3xl p-3 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-black">
                P
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-black text-slate-800 truncate leading-tight">Patient</p>
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
            <h1 className="text-xl font-black text-slate-800 tracking-tight">Symptom Checker</h1>
            <p className="text-sm text-slate-500 mt-0.5">AI-powered symptom analysis</p>
          </div>
          <div className="bg-white border border-slate-200 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hidden md:block">
            {new Date().toLocaleString("en-US", { hour: "2-digit", minute: "2-digit", hour12: true, month: "2-digit", day: "2-digit", year: "numeric" })}
          </div>
        </header>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <div className="max-w-2xl mx-auto space-y-6">

            {/* Input Card */}
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-teal-100 rounded-2xl flex items-center justify-center">
                  <Stethoscope size={22} className="text-teal-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-800">Describe Your Symptoms</h2>
                  <p className="text-slate-500 text-sm">Be as detailed as possible for better results</p>
                </div>
              </div>

              <textarea
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                placeholder="e.g. I have a headache, fever of 38°C, and sore throat for the past 2 days..."
                rows={5}
                className="w-full px-4 py-3 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-medium text-slate-700 bg-slate-50 transition-all resize-none"
              />

              <button
                onClick={handleCheck}
                disabled={loading || !symptoms.trim()}
                className={`mt-4 w-full py-3.5 rounded-2xl text-base font-bold transition-all ${
                  loading || !symptoms.trim()
                    ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-sm hover:shadow-md"
                }`}
              >
                {loading ? "⏳ Analyzing..." : "Check Symptoms"}
              </button>
            </div>

            {/* Symptom Check Error */}
            {error && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 font-semibold text-sm">
                ⚠️ {error}
              </div>
            )}

            {/* Result Card */}
            {result && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Severity Banner */}
                <div
                  className="px-8 py-5 flex items-center justify-between"
                  style={{ backgroundColor: severityColor(result.severity) }}
                >
                  <div>
                    <p className="text-white/80 text-sm font-semibold uppercase tracking-widest">Severity Level</p>
                    <p className="text-white text-2xl font-black mt-0.5">
                      {severityLabel(result.severity)} — {result.severity}/10
                    </p>
                  </div>
                  <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white text-3xl font-black">
                    {result.severity}
                  </div>
                </div>

                <div className="p-8 space-y-6">
                  {/* Recommendation Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold ${
                    result.recommendation === "home"
                      ? "bg-green-50 text-green-700"
                      : "bg-yellow-50 text-yellow-700"
                  }`}>
                    {result.recommendation === "home" ? "🏠 Home Care Recommended" : "🏥 Consult a Doctor"}
                  </div>

                  {/* Assessment */}
                  <div>
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-2">Assessment</h3>
                    <p className="text-slate-700 leading-relaxed font-medium">{result.explanation}</p>
                  </div>

                  {/* Possible Conditions */}
                  {result.possibleConditions && result.possibleConditions.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">Possible Conditions</h3>
                      <div className="flex flex-wrap gap-2">
                        {result.possibleConditions.map((c, i) => (
                          <span key={i} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-semibold text-slate-700">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Book Appointment Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <button
                      onClick={handleBookAppointment}
                      disabled={matchLoading}
                      className={`w-full py-3.5 rounded-2xl text-base font-bold transition-all flex items-center justify-center gap-2 ${
                        matchLoading
                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                          : "bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 shadow-sm hover:shadow-md"
                      }`}
                    >
                      <Calendar size={18} />
                      {matchLoading ? "⏳ Finding Best Doctor..." : "Book Appointment"}
                    </button>
                  </div>
                </div>

                {/* Disclaimer */}
                <div className="px-8 py-4 bg-slate-50 border-t border-slate-100 text-xs text-slate-400 font-medium">
                  ⚠️ This is an AI assessment only — not a medical diagnosis. Always consult a qualified healthcare professional.
                </div>
              </div>
            )}

            {/* Doctor Match Error */}
            {matchError && (
              <div className="bg-red-50 border border-red-100 rounded-2xl px-6 py-4 text-red-600 font-semibold text-sm">
                ⚠️ {matchError}
              </div>
            )}

            {/* Doctor Match Result Card */}
            {doctorMatch && (
              <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden">
                {/* Header */}
                <div className="px-8 py-5 bg-gradient-to-r from-blue-500 to-indigo-500 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center text-white text-2xl">
                    🩺
                  </div>
                  <div>
                    <p className="text-white/80 text-sm font-semibold uppercase tracking-widest">Recommended Specialist</p>
                    <p className="text-white text-xl font-black mt-0.5">{doctorMatch.specialization}</p>
                  </div>
                </div>

                <div className="p-8 space-y-5">
                  {/* Urgency Badge */}
                  <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold border ${urgencyStyle(doctorMatch.urgency)}`}>
                    {urgencyIcon(doctorMatch.urgency)}
                    <span>{urgencyLabel(doctorMatch.urgency)}</span>
                  </div>

                  {/* Reason */}
                  <div>
                    <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-2">Why This Specialist?</h3>
                    <p className="text-slate-700 leading-relaxed font-medium">{doctorMatch.reason}</p>
                  </div>

                  {/* Alternative Specializations */}
                  {doctorMatch.alternativeSpecializations && doctorMatch.alternativeSpecializations.length > 0 && (
                    <div>
                      <h3 className="text-sm font-black text-slate-500 uppercase tracking-wider mb-3">Also Consider</h3>
                      <div className="flex flex-wrap gap-2">
                        {doctorMatch.alternativeSpecializations.map((alt, i) => (
                          <span key={i} className="px-3 py-1.5 bg-blue-50 border border-blue-100 rounded-xl text-sm font-semibold text-blue-700">
                            {alt}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* CTA → Book Appointment */}
                  <div className="pt-2 border-t border-slate-100">
                    <Link
                      href={`/patient/book-appointment?symptoms=${encodeURIComponent(symptoms)}&doctorType=${encodeURIComponent(doctorMatch.specialization)}&severity=${result?.severity ?? ""}`}
                      className="w-full py-3.5 rounded-2xl text-base font-bold bg-gradient-to-r from-teal-500 to-emerald-500 text-white hover:from-teal-600 hover:to-emerald-600 shadow-sm hover:shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <Calendar size={18} />
                      Book This Appointment →
                    </Link>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
}
