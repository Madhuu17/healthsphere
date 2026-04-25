"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, KeyRound, CheckCircle2, X, Plus, Pill, FileText, Clock,
  AlertCircle, Image as ImageIcon, Paperclip, Send, Stethoscope,
  BarChart2, Heart, Trash2, Timer, Calendar as CalendarIcon,
  ChevronDown, ChevronUp, Eye,
} from "lucide-react";
import { useDoctor } from "../_context/DoctorContext";

// ── Entry type → display meta (identical to patient timeline) ──────────────
const TYPE_META: Record<string, { color: string; bg: string; border: string; icon: any; label: string }> = {
  consultation:  { color: "text-teal-700",   bg: "bg-teal-50",    border: "border-teal-200",   icon: Stethoscope,  label: "Consultation" },
  appointment:   { color: "text-cyan-700",   bg: "bg-cyan-50",    border: "border-cyan-200",   icon: CalendarIcon, label: "Appointment" },
  prescription:  { color: "text-violet-700", bg: "bg-violet-50",  border: "border-violet-200", icon: Pill,         label: "Prescription" },
  lab_report:    { color: "text-red-700",    bg: "bg-red-50",     border: "border-red-200",    icon: BarChart2,    label: "Lab Report" },
  xray:          { color: "text-blue-700",   bg: "bg-blue-50",    border: "border-blue-200",   icon: ImageIcon,    label: "X-Ray / Scan" },
  report:        { color: "text-orange-700", bg: "bg-orange-50",  border: "border-orange-200", icon: FileText,     label: "Report" },
  vaccination:   { color: "text-green-700",  bg: "bg-green-50",   border: "border-green-200",  icon: Heart,        label: "Vaccination" },
};
const DEFAULT_META = TYPE_META.consultation;

// ── Single timeline entry (identical to patient timeline) ──────────────────
function TimelineEntry({ entry, formatDate }: { entry: any; formatDate: (d: any) => string }) {
  const [open, setOpen] = useState(false);
  const meta = TYPE_META[entry.category] || DEFAULT_META;
  const Icon = meta.icon;

  const hasDetails =
    entry.diagnosis ||
    entry.reportUrl ||
    (entry.attachments?.length > 0) ||
    entry.imageUrl ||
    entry.description ||
    entry.notes ||
    (entry.medicines?.length > 0);

  return (
    <div className="flex gap-4 relative group">
      {/* Timeline dot */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 -ml-10 relative z-10 shadow-md ${meta.bg} ${meta.color} border ${meta.border}`}>
        <Icon size={16} />
      </div>

      {/* Card */}
      <div className={`flex-1 bg-white rounded-2xl border shadow-sm transition-all overflow-hidden ${
        open ? `border-2 ${meta.border}` : "border-slate-100 hover:border-slate-200 hover:shadow-md"
      } group-hover:-translate-y-0.5`}>
        {/* Top colour strip */}
        <div className={`h-0.5 w-full ${meta.bg.replace("50", "200")}`} />

        <div className="p-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-2 mb-3">
            <div className="min-w-0">
              <p className="font-bold text-slate-800 text-sm truncate">{entry.title}</p>
              {entry.doctorName && (
                <p className="text-xs text-slate-500 mt-0.5">
                  {entry.doctorName.replace(/^Dr\.?\s*/i, "Dr. ")}
                  {entry.hospital ? ` · ${entry.hospital}` : ""}
                </p>
              )}
            </div>
            <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${meta.bg} ${meta.color}`}>
              {meta.label}
            </span>
          </div>

          {/* Date + Time row */}
          <div className="flex items-center gap-4 text-xs text-slate-500 font-semibold mb-3">
            <span className="flex items-center gap-1.5">
              <CalendarIcon size={11} className="text-slate-400" />
              {formatDate(entry.date)}
            </span>
            {entry.timeSlot && (
              <span className="flex items-center gap-1.5">
                <Clock size={11} className="text-slate-400" />
                {entry.timeSlot}
              </span>
            )}
          </div>

          {/* Status for appointments */}
          {entry.entryType === "appointment" && entry.status && (
            <span className={`inline-flex text-[10px] font-black uppercase px-2.5 py-1 rounded-full mb-3 ${
              entry.status === "completed" ? "bg-green-100 text-green-700" :
              entry.status === "cancelled" ? "bg-red-100 text-red-600" :
              "bg-teal-100 text-teal-700"
            }`}>{entry.status}</span>
          )}

          {/* Expand / collapse button */}
          {hasDetails && (
            <button
              onClick={() => setOpen(!open)}
              className={`w-full flex items-center justify-between text-xs font-bold border-t border-slate-100 pt-3 transition-colors ${
                open ? `${meta.color}` : "text-slate-400 hover:text-slate-700"
              }`}
            >
              <span className="flex items-center gap-1.5">
                <Eye size={13} />
                {open ? "Collapse" : (entry.entryType === "appointment" ? "View Diagnosis & Report" : "View Details")}
              </span>
              {open ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>
          )}

          {/* Expandable body */}
          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="overflow-hidden"
              >
                <div className="pt-4 space-y-3">
                  {/* Description / notes */}
                  {entry.description && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Notes</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{entry.description}</p>
                    </div>
                  )}

                  {/* Prescription notes */}
                  {entry.notes && !entry.description && (
                    <div className="bg-slate-50 border border-slate-100 rounded-xl p-3">
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Doctor&apos;s Notes</p>
                      <p className="text-xs text-slate-700 leading-relaxed">{entry.notes}</p>
                    </div>
                  )}

                  {/* Medicines list (prescriptions) */}
                  {entry.medicines?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Medicines</p>
                      <div className="space-y-2">
                        {entry.medicines.map((med: any, j: number) => (
                          <div
                            key={j}
                            className="flex items-center justify-between bg-violet-50 border border-violet-100 rounded-xl px-3 py-2.5"
                          >
                            <div className="flex items-center gap-2 min-w-0">
                              <Pill size={13} className="text-violet-500 shrink-0" />
                              <span className="text-xs font-bold text-slate-800 truncate">{med.medicineName}</span>
                            </div>
                            <span className="ml-3 shrink-0 text-xs font-semibold text-violet-700 bg-white border border-violet-200 px-2.5 py-1 rounded-lg">
                              {med.dosage}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Diagnosis (appointments) */}
                  {entry.entryType === "appointment" && (
                    <div className={`${meta.bg} border ${meta.border} rounded-xl p-3`}>
                      <p className={`text-[10px] font-black uppercase tracking-widest mb-1 ${meta.color}`}>Diagnosis</p>
                      <p className="text-xs text-slate-700 font-medium leading-relaxed">
                        {entry.diagnosis || "No diagnosis recorded yet."}
                      </p>
                    </div>
                  )}

                  {/* Report URL (appointment) */}
                  {entry.entryType === "appointment" && (
                    entry.reportUrl ? (
                      <a
                        href={entry.reportUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 text-xs font-bold px-3 py-2 rounded-lg border ${meta.border} ${meta.color} ${meta.bg} hover:opacity-80 transition-opacity`}
                      >
                        <FileText size={13} /> View Report / File
                      </a>
                    ) : (
                      <div className="flex items-center gap-2 text-[10px] text-slate-400 font-medium">
                        <AlertCircle size={11} /> No report attached
                      </div>
                    )
                  )}

                  {/* Attachments (records) */}
                  {entry.attachments?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Attachments</p>
                      <div className="flex flex-wrap gap-2">
                        {entry.attachments.map((url: string, j: number) => (
                          <a key={j} href={url} target="_blank" rel="noreferrer"
                            className="flex items-center gap-1.5 text-xs font-bold text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-lg hover:bg-blue-100 transition-colors">
                            <FileText size={11} /> View File {j + 1}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Image preview (for scan/xray records) */}
                  {entry.imageUrl && (
                    <div>
                      <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Image / Scan</p>
                      <img
                        src={entry.imageUrl} alt="Medical scan"
                        className="w-full max-h-48 rounded-xl object-cover border border-slate-100"
                      />
                      <a href={entry.imageUrl} target="_blank" rel="noreferrer"
                        className="mt-2 inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-teal-700 transition-colors">
                        <Eye size={11} /> View Full Size
                      </a>
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

export default function DoctorPatientRecords() {
  const ctx = useDoctor();
  const {
    searchId, setSearchId, accessStep, setAccessStep,
    accessError, setAccessError, accessLoading, patientData, setPatientData,
    patientTimeline, handleSearch, handleVerify, formatDate,
    showAddRecord, setShowAddRecord, newRecord, setNewRecord,
    uploading, attachedFiles, setAttachedFiles, fileRef, handleAddRecord,
    rxTitle, setRxTitle, rxNotes, setRxNotes, rxMeds, setRxMeds,
    addMed, removeMed, updateMed, emptyMed,
  } = ctx;

  return (
    <div className="max-w-3xl space-y-5">
      {/* Search Step */}
      {accessStep === "search" && (
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }}
          className="bg-white rounded-3xl p-10 shadow-sm border border-slate-100 text-center">
          <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6 ring-8 ring-blue-50/30">
            <Search size={32} className="text-blue-500"/>
          </div>
          <h2 className="text-2xl font-extrabold text-slate-900 mb-2">Access Patient Records</h2>
          <p className="text-slate-500 mb-8 text-sm max-w-sm mx-auto">Enter the Patient ID to securely access patient records.</p>
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



      {/* Patient View */}
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
                <button onClick={() => { setAccessStep("search"); setPatientData(null); setSearchId(""); }}
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
                  <button onClick={() => { setShowAddRecord(false); setAttachedFiles([]); setRxMeds([{...emptyMed}]); setRxTitle(""); setRxNotes(""); }}
                    className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center hover:bg-slate-200">
                    <X size={16}/>
                  </button>
                </div>

                {/* Record Type */}
                <div className="mb-5">
                  <label className="block text-xs font-bold text-slate-600 mb-1.5">Record Type</label>
                  <select value={newRecord.type} onChange={e => setNewRecord((r: any) => ({...r, type: e.target.value}))}
                    className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-sm bg-slate-50">
                    <option value="prescription">💊 Prescription</option>
                    <option value="consultation">🩺 Consultation Note</option>
                    <option value="lab_report">🔬 Lab Report</option>
                    <option value="xray">🩻 X-Ray / Scan</option>
                    <option value="vaccination">💉 Vaccination</option>
                  </select>
                </div>

                {/* Prescription Builder */}
                {newRecord.type === "prescription" ? (
                  <div className="space-y-5">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Prescription Title <span className="text-red-500">*</span></label>
                        <input type="text" value={rxTitle} onChange={e => setRxTitle(e.target.value)} placeholder="e.g. Post-Op Care"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-sm"/>
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Notes (optional)</label>
                        <input type="text" value={rxNotes} onChange={e => setRxNotes(e.target.value)} placeholder="General instructions"
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm"/>
                      </div>
                    </div>

                    <div className="bg-purple-50 border border-purple-200 rounded-xl p-3 flex items-start gap-2">
                      <Timer size={14} className="text-purple-500 shrink-0 mt-0.5"/>
                      <p className="text-purple-700 text-xs font-medium">
                        <strong>Duration Tracking:</strong> Each medicine requires a duration (in days). The system will automatically move medications from Active → Past when their duration expires.
                      </p>
                    </div>

                    <div className="space-y-4">
                      {rxMeds.map((med: any, idx: number) => (
                        <div key={idx} className="bg-slate-50 rounded-2xl p-4 border border-slate-200 relative">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                              <Pill size={12} className="text-purple-500"/> Medicine #{idx + 1}
                            </span>
                            {rxMeds.length > 1 && (
                              <button onClick={() => removeMed(idx)} className="w-7 h-7 bg-red-50 text-red-400 rounded-lg flex items-center justify-center hover:bg-red-100 hover:text-red-600 transition-all">
                                <Trash2 size={13}/>
                              </button>
                            )}
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div className="col-span-2">
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Medicine Name <span className="text-red-500">*</span></label>
                              <input type="text" value={med.medicineName} onChange={e => updateMed(idx, "medicineName", e.target.value)} placeholder="e.g. Amoxicillin 500mg"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-semibold"/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Type</label>
                              <select value={med.type} onChange={e => updateMed(idx, "type", e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-semibold bg-white">
                                <option value="tablet">💊 Tablet</option><option value="capsule">💊 Capsule</option>
                                <option value="syrup">🧪 Syrup</option><option value="injection">💉 Injection</option>
                                <option value="drops">💧 Drops</option><option value="ointment">🧴 Ointment</option>
                                <option value="other">🩺 Other</option>
                              </select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3 mb-3">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Dosage <span className="text-red-500">*</span></label>
                              <input type="text" value={med.dosage} onChange={e => updateMed(idx, "dosage", e.target.value)} placeholder="e.g. 500mg"
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-semibold"/>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Frequency <span className="text-red-500">*</span></label>
                              <select value={med.frequency} onChange={e => updateMed(idx, "frequency", e.target.value)}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-semibold bg-white">
                                <option value="">Select…</option><option value="Once daily">Once daily</option>
                                <option value="Twice daily">Twice daily</option><option value="Three times daily">Three times daily</option>
                                <option value="Every 8 hours">Every 8 hours</option><option value="Every 12 hours">Every 12 hours</option>
                                <option value="Before breakfast">Before breakfast</option><option value="After meals">After meals</option>
                                <option value="Before bed">Before bed</option><option value="As needed">As needed (PRN)</option>
                              </select>
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 mb-1">Duration (days) <span className="text-red-500">*</span></label>
                              <input type="number" min={1} max={365} value={med.durationDays} onChange={e => updateMed(idx, "durationDays", e.target.value)} placeholder="e.g. 7"
                                className="w-full px-3 py-2 border border-purple-200 bg-purple-50/50 rounded-lg outline-none focus:ring-2 focus:ring-purple-500/30 text-sm font-bold text-purple-700"/>
                            </div>
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 mb-1">Instructions (optional)</label>
                            <input type="text" value={med.instructions} onChange={e => updateMed(idx, "instructions", e.target.value)} placeholder="e.g. Take with food"
                              className="w-full px-3 py-2 border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500/30 text-sm font-medium"/>
                          </div>
                        </div>
                      ))}
                      <button onClick={addMed}
                        className="w-full border-2 border-dashed border-blue-300 text-blue-600 py-3 rounded-xl flex items-center justify-center gap-2 hover:bg-blue-50 transition-all text-sm font-bold">
                        <Plus size={16}/> Add Another Medicine
                      </button>
                    </div>

                    {/* File attachments */}
                    <div>
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Attach Files (optional)</label>
                      <input type="file" ref={fileRef} accept="image/*,.pdf" multiple onChange={e => setAttachedFiles(Array.from(e.target.files || []))} className="hidden"/>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 py-4 rounded-2xl flex flex-col items-center gap-1.5 transition-all font-medium text-sm group">
                        <Paperclip size={18} className="group-hover:scale-110 transition-transform"/> Click to attach files
                      </button>
                      {attachedFiles.length > 0 && (
                        <div className="mt-2 space-y-1.5">
                          {attachedFiles.map((f: File, i: number) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-lg px-3 py-1.5 border border-slate-200">
                              <ImageIcon size={12} className="text-blue-500 shrink-0"/>
                              <span className="text-xs font-medium text-slate-600 flex-1 truncate">{f.name}</span>
                              <button onClick={() => setAttachedFiles((prev: File[]) => prev.filter((_: File,j: number) => j !== i))} className="text-slate-300 hover:text-red-400"><X size={12}/></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-3 justify-end">
                      <button onClick={() => { setShowAddRecord(false); setAttachedFiles([]); setRxMeds([{...emptyMed}]); setRxTitle(""); setRxNotes(""); }}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                      <button onClick={handleAddRecord}
                        disabled={uploading || !rxTitle || rxMeds.every((m: any) => !m.medicineName || !m.dosage || !m.frequency || !m.durationDays)}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl hover:from-blue-700 hover:to-purple-700 disabled:opacity-50 flex items-center gap-2 shadow-md shadow-blue-600/20">
                        <Send size={15}/>{uploading ? "Saving..." : "Save Prescription"}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* Non-prescription form */
                  <>
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-600 mb-1.5">Title</label>
                        <input type="text" value={newRecord.title} onChange={e => setNewRecord((r: any) => ({...r, title: e.target.value}))} placeholder="e.g. Blood Test Results" required
                          className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-semibold text-sm"/>
                      </div>
                    </div>
                    <div className="mb-4">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Description / Findings</label>
                      <textarea value={newRecord.description} onChange={e => setNewRecord((r: any) => ({...r, description: e.target.value}))} placeholder="Detailed notes..." rows={4} required
                        className="w-full px-3 py-2.5 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 font-medium text-sm resize-none"/>
                    </div>
                    <div className="mb-5">
                      <label className="block text-xs font-bold text-slate-600 mb-1.5">Attach Images / Reports</label>
                      <input type="file" ref={fileRef} accept="image/*,.pdf" multiple onChange={e => setAttachedFiles(Array.from(e.target.files || []))} className="hidden"/>
                      <button type="button" onClick={() => fileRef.current?.click()}
                        className="w-full border-2 border-dashed border-slate-300 hover:border-blue-400 text-slate-500 hover:text-blue-600 py-5 rounded-2xl flex flex-col items-center gap-2 transition-all font-medium text-sm group">
                        <Paperclip size={22} className="group-hover:scale-110 transition-transform"/> Click to attach files
                        <span className="text-xs text-slate-400">Images, PDFs · Max 10MB each</span>
                      </button>
                      {attachedFiles.length > 0 && (
                        <div className="mt-3 space-y-2">
                          {attachedFiles.map((f: File, i: number) => (
                            <div key={i} className="flex items-center gap-2 bg-slate-50 rounded-xl px-3 py-2 border border-slate-200">
                              <ImageIcon size={14} className="text-blue-500 shrink-0"/>
                              <span className="text-xs font-medium text-slate-600 flex-1 truncate">{f.name}</span>
                              <span className="text-xs text-slate-400">{(f.size/1024).toFixed(0)} KB</span>
                              <button onClick={() => setAttachedFiles((prev: File[]) => prev.filter((_: File,j: number) => j !== i))} className="text-slate-300 hover:text-red-400"><X size={12}/></button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex gap-3 justify-end">
                      <button onClick={() => { setShowAddRecord(false); setAttachedFiles([]); }}
                        className="px-5 py-2.5 text-sm font-bold text-slate-600 bg-slate-100 rounded-xl hover:bg-slate-200">Cancel</button>
                      <button onClick={handleAddRecord} disabled={uploading || !newRecord.title || !newRecord.description}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 disabled:bg-blue-300 flex items-center gap-2 shadow-md shadow-blue-600/20">
                        <Send size={15}/>{uploading ? "Uploading..." : "Save & Send to Patient"}
                      </button>
                    </div>
                  </>
                )}
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
              <div className="relative pl-10">
                {/* Vertical line */}
                <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-300 via-slate-200 to-slate-100 rounded-full" />
                <div className="space-y-5">
                  <AnimatePresence>
                    {(() => {
                      const seen = new Set<string>();
                      return patientTimeline.filter((r: any) => {
                        const key = r._id || r.appointmentId || `${r.title}-${r.date}`;
                        if (seen.has(key)) return false;
                        seen.add(key);
                        return true;
                      }).map((entry: any, i: number) => (
                        <motion.div
                          key={entry._id || entry.appointmentId || i}
                          initial={{ opacity: 0, x: -12 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: -12 }}
                          transition={{ delay: i * 0.03 }}
                        >
                          <TimelineEntry entry={entry} formatDate={formatDate} />
                        </motion.div>
                      ));
                    })()}
                  </AnimatePresence>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
