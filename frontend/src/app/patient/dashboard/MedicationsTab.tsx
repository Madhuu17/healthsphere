"use client";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Pill, Clock, CheckCircle2, AlertCircle, ChevronDown, ChevronUp,
  Calendar, User, Stethoscope, Timer, History, Activity, Info,
  Filter
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────
interface Medicine {
  _id: string;
  medicineName: string;
  type: string;
  dosage: string;
  frequency: string;
  instructions: string;
  durationDays: number;
  prescribedDate: string;
  endDate: string;
  status: "active" | "completed";
  daysLeft?: number;
  doctorName: string;
  prescriptionTitle: string;
  prescriptionId: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(d: string | Date) {
  if (!d) return "—";
  const date = new Date(d);
  if (isNaN(date.getTime())) return String(d);
  return date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

const TYPE_ICONS: Record<string, string> = {
  tablet: "💊", syrup: "🧪", capsule: "💉", injection: "💉",
  drops: "💧", ointment: "🧴", other: "🩺",
};

function DaysLeftBadge({ daysLeft }: { daysLeft: number }) {
  const color =
    daysLeft <= 1  ? "bg-red-100 text-red-700 border-red-200" :
    daysLeft <= 3  ? "bg-orange-100 text-orange-700 border-orange-200" :
    daysLeft <= 7  ? "bg-amber-100 text-amber-700 border-amber-200" :
                    "bg-teal-100 text-teal-700 border-teal-200";
  const label = daysLeft === 0 ? "Expires today" : daysLeft === 1 ? "1 day left" : `${daysLeft} days left`;
  return (
    <span className={`flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full border ${color}`}>
      <Timer size={11} /> {label}
    </span>
  );
}

// ══════════════════════════════════════════════════════════════════════════
// Main Component
// ══════════════════════════════════════════════════════════════════════════
interface MedicationsTabProps {
  profile: any;
}

export default function MedicationsTab({ profile }: MedicationsTabProps) {
  const [activeMeds, setActiveMeds]   = useState<Medicine[]>([]);
  const [pastMeds,   setPastMeds]     = useState<Medicine[]>([]);
  const [loading,    setLoading]      = useState(true);
  const [error,      setError]        = useState("");
  const [section,    setSection]      = useState<"active" | "past">("active");
  const [expanded,   setExpanded]     = useState<string | null>(null);

  useEffect(() => {
    const patientId = profile?.patientId || profile?.id;
    if (!patientId) return;
    loadMedications(patientId);
  }, [profile?.patientId, profile?.id]);

  const loadMedications = async (patientId: string) => {
    setLoading(true); setError("");
    try {
      const [activeRes, pastRes] = await Promise.all([
        fetch(`http://localhost:5000/api/prescriptions/${patientId}/active`),
        fetch(`http://localhost:5000/api/prescriptions/${patientId}/past`),
      ]);
      const activeData = await activeRes.json();
      const pastData   = await pastRes.json();
      if (activeData.success) setActiveMeds(activeData.medications || []);
      if (pastData.success)   setPastMeds(pastData.medications || []);
    } catch {
      setError("Failed to load medications. Please refresh.");
    } finally {
      setLoading(false);
    }
  };

  const displayList = section === "active" ? activeMeds : pastMeds;

  // ── Loading ──────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4">
        <div className="w-10 h-10 border-4 border-teal-500 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-500 font-medium">Loading your medications...</p>
      </div>
    );
  }

  return (
    <div className="max-w-[1100px] space-y-6">

      {/* ── Hero Banner ── */}
      <div className="bg-gradient-to-br from-violet-500 via-purple-500 to-indigo-600 rounded-3xl p-7 flex items-center gap-6 shadow-xl shadow-purple-500/20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px)", backgroundSize: "32px 32px" }} />
        <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
          <Pill size={32} className="text-white" />
        </div>
        <div className="flex-1 relative z-10">
          <h2 className="text-2xl font-black text-white">My Medications</h2>
          <p className="text-purple-100 text-sm mt-1">
            Track your active prescriptions and view your complete medication history. Status updates automatically based on prescription duration.
          </p>
        </div>
        {/* Summary chips */}
        <div className="flex gap-3 shrink-0">
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
            <p className="text-white text-2xl font-black">{activeMeds.length}</p>
            <p className="text-purple-100 text-[10px] font-bold uppercase tracking-wider">Active</p>
          </div>
          <div className="bg-white/20 backdrop-blur-sm rounded-2xl px-5 py-3 text-center border border-white/20">
            <p className="text-white text-2xl font-black">{pastMeds.length}</p>
            <p className="text-purple-100 text-[10px] font-bold uppercase tracking-wider">Completed</p>
          </div>
        </div>
      </div>

      {/* ── Error ── */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4">
          <AlertCircle size={18} className="text-red-500 shrink-0" />
          <p className="text-red-600 text-sm font-medium">{error}</p>
        </div>
      )}

      {/* ── Section Tabs ── */}
      <div className="flex gap-2 bg-slate-100 p-1.5 rounded-2xl w-fit">
        <button
          onClick={() => setSection("active")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            section === "active"
              ? "bg-white text-teal-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}>
          <Activity size={16} />
          Active Medications
          {activeMeds.length > 0 && (
            <span className="bg-teal-500 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {activeMeds.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setSection("past")}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all ${
            section === "past"
              ? "bg-white text-slate-700 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}>
          <History size={16} />
          Past Medications
          {pastMeds.length > 0 && (
            <span className="bg-slate-400 text-white text-[10px] font-black px-2 py-0.5 rounded-full">
              {pastMeds.length}
            </span>
          )}
        </button>
      </div>

      {/* ── Section Header ── */}
      {section === "active" ? (
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-teal-500 rounded-full" />
          <div>
            <h3 className="font-black text-slate-800 text-lg">Active Medications</h3>
            <p className="text-slate-500 text-xs">Currently prescribed medicines — auto-expire when duration ends</p>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3">
          <div className="w-2 h-8 bg-slate-400 rounded-full" />
          <div>
            <h3 className="font-black text-slate-800 text-lg">Past Medications</h3>
            <p className="text-slate-500 text-xs">Complete medication history — permanently stored, never deleted</p>
          </div>
        </div>
      )}

      {/* ── Medication List ── */}
      <AnimatePresence mode="wait">
        {displayList.length === 0 ? (
          <motion.div key="empty" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="bg-white rounded-3xl p-14 border border-dashed border-slate-200 flex flex-col items-center gap-3">
            {section === "active" ? (
              <>
                <Pill size={40} className="text-slate-200" />
                <p className="text-slate-500 font-bold">No active medications</p>
                <p className="text-slate-400 text-sm text-center max-w-xs">
                  Your doctor will add prescriptions here after your appointment. They'll appear automatically with duration tracking.
                </p>
              </>
            ) : (
              <>
                <History size={40} className="text-slate-200" />
                <p className="text-slate-500 font-bold">No past medications yet</p>
                <p className="text-slate-400 text-sm text-center max-w-xs">
                  Completed medications will appear here permanently as your prescription history.
                </p>
              </>
            )}
          </motion.div>
        ) : (
          <motion.div key={section} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {displayList.map((med, idx) => {
              const isExpanded = expanded === med._id;
              const isActive = med.status === "active";
              return (
                <motion.div
                  key={med._id || idx}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.04 }}
                  className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all overflow-hidden ${
                    isActive
                      ? "border-teal-100 hover:border-teal-200"
                      : "border-slate-100 opacity-85 hover:opacity-100"
                  }`}>

                  {/* Colored top strip */}
                  <div className={`h-1 w-full ${isActive ? "bg-gradient-to-r from-teal-400 to-emerald-500" : "bg-gradient-to-r from-slate-300 to-slate-400"}`} />

                  <div className="p-5">
                    {/* Header row */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                          isActive ? "bg-teal-50" : "bg-slate-100"
                        }`}>
                          {TYPE_ICONS[med.type] || "💊"}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-black text-slate-800 truncate">{med.medicineName}</h4>
                          <p className="text-xs text-slate-500 font-medium capitalize mt-0.5">{med.type} · {med.dosage}</p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-1.5 shrink-0">
                        {isActive ? (
                          <>
                            <span className="bg-teal-100 text-teal-700 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                              ● Active
                            </span>
                            {med.daysLeft !== undefined && <DaysLeftBadge daysLeft={med.daysLeft} />}
                          </>
                        ) : (
                          <span className="flex items-center gap-1 bg-slate-100 text-slate-500 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            <CheckCircle2 size={10} /> Completed
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Key info row */}
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      <InfoChip icon={<Clock size={11} />} label="Frequency" value={med.frequency} />
                      <InfoChip icon={<Calendar size={11} />} label="Duration" value={`${med.durationDays} day${med.durationDays !== 1 ? "s" : ""}`} />
                      <InfoChip icon={<Calendar size={11} />} label="Started" value={formatDate(med.prescribedDate)} />
                      <InfoChip icon={<Calendar size={11} />} label="Ends" value={formatDate(med.endDate)} />
                    </div>

                    {/* Doctor & prescription */}
                    <div className="flex items-center gap-2 mb-3 bg-slate-50 rounded-xl p-2.5">
                      <Stethoscope size={13} className="text-slate-400 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-700 truncate">{med.doctorName}</p>
                        <p className="text-[10px] text-slate-400 truncate">{med.prescriptionTitle}</p>
                      </div>
                    </div>

                    {/* Expand toggle */}
                    {med.instructions && (
                      <button
                        onClick={() => setExpanded(isExpanded ? null : med._id)}
                        className="w-full flex items-center justify-between px-3 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 transition-colors text-xs font-bold text-slate-600">
                        <span className="flex items-center gap-1.5"><Info size={12} /> Instructions</span>
                        {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                      </button>
                    )}

                    <AnimatePresence>
                      {isExpanded && med.instructions && (
                        <motion.div
                          initial={{ opacity: 0, height: 0, marginTop: 0 }}
                          animate={{ opacity: 1, height: "auto", marginTop: 8 }}
                          exit={{ opacity: 0, height: 0, marginTop: 0 }}
                          className="overflow-hidden">
                          <div className="bg-blue-50 border border-blue-100 rounded-xl p-3">
                            <p className="text-xs text-blue-800 font-medium leading-relaxed">{med.instructions}</p>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Info Note ── */}
      <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 flex items-start gap-3">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div className="text-xs text-blue-700 leading-relaxed">
          <strong>How it works:</strong> Medications are automatically moved from Active to Past when their prescribed duration ends.
          Past medications are <strong>permanently preserved</strong> as your medical history and can never be deleted.
          The status updates daily (and immediately when you load this page).
        </div>
      </div>
    </div>
  );
}

// ── Sub-component ──────────────────────────────────────────────────────────
function InfoChip({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-2 border border-slate-100">
      <div className="flex items-center gap-1 text-[10px] text-slate-400 font-semibold mb-0.5">
        {icon} {label}
      </div>
      <p className="text-xs font-bold text-slate-700 truncate">{value}</p>
    </div>
  );
}
