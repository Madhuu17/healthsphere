"use client";

import { ChevronLeft, ChevronRight, X, Lock, Unlock, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useDoctor } from "../_context/DoctorContext";

export default function DoctorWeeklySchedule() {
  const {
    weekOffset, setWeekOffset, weekDates, blockedDates, leaveMode, setLeaveMode,
    toggleBlock, getSlotsForDay, isExpiredSlot, activeSlot, setActiveSlot,
    today, dayNames, SLOT_TIMES, toYMD,
  } = useDoctor();

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <button onClick={() => setWeekOffset((w: number) => w - 1)}
            className="w-9 h-9 bg-slate-100 rounded-xl flex items-center justify-center hover:bg-slate-200 transition-colors">
            <ChevronLeft size={18}/>
          </button>
          <span className="font-bold text-slate-800 text-sm">
            {weekDates[0] ? `${String(weekDates[0].getDate()).padStart(2,"0")}-${String(weekDates[0].getMonth()+1).padStart(2,"0")} – ${String(weekDates[6]?.getDate()).padStart(2,"0")}-${String(weekDates[6]?.getMonth()+1).padStart(2,"0")}-${weekDates[6]?.getFullYear()}` : ""}
          </span>
          <button onClick={() => setWeekOffset((w: number) => w + 1)}
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
                const appts = getSlotsForDay(date).filter((a: any) => a.timeSlot === slot);
                const expired = isExpiredSlot(date, slot);

                return (
                  <div key={di} className={`p-1.5 border-r border-slate-100 last:border-r-0 min-h-[52px] ${isBlocked ? "bg-red-50/30" : ""}`}>
                    {isBlocked ? (
                      <div className="h-full flex items-center justify-center">
                        <X size={12} className="text-red-200"/>
                      </div>
                    ) : appts.map((appt: any) => (
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
                                <p className="text-[10px] text-slate-400">{slot} · {String(date.getDate()).padStart(2,"0")}-{String(date.getMonth()+1).padStart(2,"0")}-{date.getFullYear()}</p>
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
  );
}
