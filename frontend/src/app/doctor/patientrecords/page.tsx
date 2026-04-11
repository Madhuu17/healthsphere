"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search, KeyRound, CheckCircle2, X, Plus, Pill, FileText, Clock,
  AlertCircle, Image as ImageIcon, Paperclip, Send, Stethoscope,
  BarChart2, Heart, Trash2, Timer
} from "lucide-react";
import { useDoctor } from "../_context/DoctorContext";

const TYPE_META: Record<string, { color: string; bg: string; icon: any }> = {
  prescription: { color: "text-purple-600", bg: "bg-purple-100", icon: Pill },
  consultation: { color: "text-teal-600",   bg: "bg-teal-100",   icon: Stethoscope },
  lab_report:   { color: "text-red-600",    bg: "bg-red-100",    icon: BarChart2 },
  xray:         { color: "text-blue-600",   bg: "bg-blue-100",   icon: ImageIcon },
  vaccination:  { color: "text-green-600",  bg: "bg-green-100",  icon: Heart },
};

export default function DoctorPatientRecords() {
  const ctx = useDoctor();
  const {
    searchId, setSearchId, otp, setOtp, accessStep, setAccessStep,
    accessError, setAccessError, accessLoading, patientData, setPatientData,
    patientTimeline, handleSearch, handleVerify,
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

      {/* OTP Step */}
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
              {otp.map((d: string, idx: number) => (
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
              <div className="relative">
                <div className="absolute left-[22px] top-0 bottom-0 w-0.5 bg-slate-100"/>
                <div className="space-y-4">
                  {(() => {
                    // Deduplicate timeline entries by _id
                    const seen = new Set<string>();
                    const uniqueTimeline = patientTimeline.filter((r: any) => {
                      const key = r._id || r.appointmentId || `${r.title}-${r.date}`;
                      if (seen.has(key)) return false;
                      seen.add(key);
                      return true;
                    });
                    return uniqueTimeline.map((r: any, i: number) => {
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
                              <p className="text-xs text-slate-400 mt-0.5">{(() => { const d = new Date(r.date); return `${String(d.getDate()).padStart(2,"0")}-${String(d.getMonth()+1).padStart(2,"0")}-${d.getFullYear()}`; })()}</p>
                            </div>
                            <span className={`shrink-0 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full ${meta.bg} ${meta.color}`}>
                              {r.type?.replace("_"," ")}
                            </span>
                          </div>
                          <p className="text-sm text-slate-600 mt-2 leading-relaxed">{r.description}</p>
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
                  });
                  })()}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
}
