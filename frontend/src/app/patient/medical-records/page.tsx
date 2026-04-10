"use client";

import { FileText, AlertCircle, X, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatient } from "../_context/PatientContext";

export default function PatientMedicalRecords() {
  const { timeline, summarizingId, summaryError, setSummaryError, expandedSummary, setExpandedSummary, handleSummarize, formatDate } = usePatient();

  return (
    <div className="space-y-4 max-w-[1400px]">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
        <FileText size={28} className="text-teal-500" /> Medical Records
      </h2>

      {/* AI Summarizer Feature Banner */}
      <div className="bg-gradient-to-r from-violet-500 to-purple-600 rounded-2xl p-4 flex items-center gap-4 shadow-lg shadow-purple-500/20">
        <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Sparkles size={20} className="text-white"/>
        </div>
        <div className="flex-1">
          <p className="text-white font-bold text-sm">AI Medical Summarizer</p>
          <p className="text-purple-100 text-xs">Click "Summarize" on any record to get a simple, patient-friendly explanation — generated once and saved permanently.</p>
        </div>
      </div>

      {summaryError && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-3 flex items-center gap-3">
          <AlertCircle size={16} className="text-red-500 shrink-0"/>
          <p className="text-red-600 text-sm font-medium">{summaryError}</p>
          <button onClick={() => setSummaryError(null)} className="ml-auto text-red-400 hover:text-red-600"><X size={14}/></button>
        </div>
      )}

      {timeline.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
          <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="text-slate-400 font-semibold">No medical records yet. Records will appear after doctor visits and prescriptions.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {timeline.map((rec: any, i: number) => {
            const recId = rec._id?.toString();
            const hasSummary = !!rec.aiSummary;
            const isLoading = summarizingId === recId;
            const isExpanded = expandedSummary === recId;
            const canSummarize = (rec.type === "prescription" || rec.type === "lab_report" || rec.type === "xray" || rec.type === "vaccination") && !hasSummary;
            const typeColor =
              rec.type === "xray" ? { bg: "bg-blue-100", text: "text-blue-600", badge: "bg-blue-50 text-blue-600" } :
              rec.type === "prescription" ? { bg: "bg-purple-100", text: "text-purple-600", badge: "bg-purple-50 text-purple-600" } :
              rec.type === "lab_report" ? { bg: "bg-red-100", text: "text-red-600", badge: "bg-red-50 text-red-600" } :
              { bg: "bg-teal-100", text: "text-teal-600", badge: "bg-teal-50 text-teal-600" };
            return (
              <div key={recId || i} className={`bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all ${
                hasSummary ? "border-purple-200" : "border-slate-100"
              }`}>
                {/* Record Header */}
                <div className="p-5 flex items-start gap-4">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${typeColor.bg} ${typeColor.text}`}>
                    <FileText size={18}/>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="font-bold text-slate-800 text-sm truncate">{rec.title}</h4>
                      <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${typeColor.badge}`}>
                        {rec.type?.replace("_", " ")}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{formatDate(rec.date)}</p>
                    <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{rec.description || rec.notes}</p>
                  </div>
                </div>

                {/* Action Row */}
                <div className="px-5 pb-4 flex items-center gap-2">
                  {canSummarize && (
                    <button
                      onClick={() => handleSummarize(recId!)}
                      disabled={isLoading}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-xs font-bold rounded-xl hover:from-violet-600 hover:to-purple-700 disabled:opacity-60 transition-all shadow-sm shadow-purple-400/30"
                    >
                      {isLoading ? (
                        <><div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin"/> Generating...</>
                      ) : (
                        <><Sparkles size={12}/> Summarize</>
                      )}
                    </button>
                  )}
                  {hasSummary && (
                    <button
                      onClick={() => setExpandedSummary(isExpanded ? null : recId!)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-50 text-purple-700 text-xs font-bold rounded-xl hover:bg-purple-100 transition-all border border-purple-200"
                    >
                      <Sparkles size={12}/>
                      {isExpanded ? "Hide AI Summary" : "View AI Summary"}
                      {isExpanded ? <ChevronUp size={12}/> : <ChevronDown size={12}/>}
                    </button>
                  )}
                  {hasSummary && (
                    <span className="text-[10px] text-purple-400 font-semibold ml-1">✓ AI Summary available</span>
                  )}
                </div>

                {/* AI Summary Panel */}
                <AnimatePresence>
                  {hasSummary && isExpanded && (
                    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                      <div className="mx-4 mb-4 bg-gradient-to-br from-violet-50 to-purple-50 border border-purple-200 rounded-2xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                          <div className="w-6 h-6 bg-purple-500 rounded-lg flex items-center justify-center">
                            <Sparkles size={12} className="text-white"/>
                          </div>
                          <span className="text-xs font-black text-purple-700 uppercase tracking-wider">AI Summary</span>
                          {rec.summaryGeneratedAt && (
                            <span className="ml-auto text-[10px] text-purple-400 font-medium">
                              Generated {formatDate(rec.summaryGeneratedAt)}
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-700 leading-relaxed whitespace-pre-line font-medium">
                          {rec.aiSummary}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
