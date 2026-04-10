"use client";

import { Calendar as CalendarIcon, Stethoscope, Activity, Clock } from "lucide-react";
import { usePatient } from "../_context/PatientContext";

export default function PatientTimeline() {
  const { pastAppointments, formatDate } = usePatient();

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
        <Activity size={28} className="text-teal-500" /> Timeline
      </h2>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-4">
        <h3 className="text-xl font-bold text-slate-800 mb-1">Past Appointments</h3>
        <p className="text-slate-400 text-sm">A chronological record of your completed appointments.</p>
      </div>
      {pastAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center border border-slate-100">
          <Activity size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="text-slate-400 font-semibold">No past appointments.</p>
          <p className="text-slate-400 text-sm mt-1">Completed appointments will appear here automatically.</p>
        </div>
      ) : (
        <div className="relative pl-10">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-slate-200 to-slate-100"/>
          <div className="space-y-4">
            {pastAppointments.map((a: any, i: number) => (
              <div key={a._id || i} className="flex gap-5 relative group">
                <div className="w-9 h-9 bg-teal-500 rounded-xl flex items-center justify-center shrink-0 -ml-10 relative z-10 shadow-md">
                  <Stethoscope size={16} className="text-white"/>
                </div>
                <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-100 transition-all group-hover:-translate-y-0.5">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <p className="font-bold text-slate-800 text-sm">{a.doctorType || a.specialization || "Specialist"}</p>
                      <p className="text-xs text-slate-500 mt-0.5">{a.doctorName}</p>
                    </div>
                    <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                      a.status === "Completed" ? "bg-slate-100 text-slate-500" : "bg-teal-100 text-teal-700"
                    }`}>{a.status || "Completed"}</span>
                  </div>
                  <div className="space-y-1.5 pt-3 border-t border-slate-100 text-sm">
                    <div className="flex items-start gap-2">
                      <Activity size={13} className="text-slate-400 shrink-0 mt-0.5"/>
                      <p className="text-slate-600 leading-snug"><span className="font-semibold text-slate-700">Symptoms: </span>{a.symptoms || "Not provided"}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <CalendarIcon size={13} className="text-slate-400 shrink-0"/>
                      <p className="text-slate-600"><span className="font-semibold text-slate-700">Date: </span>{formatDate(a.date)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock size={13} className="text-slate-400 shrink-0"/>
                      <p className="text-slate-600"><span className="font-semibold text-slate-700">Time: </span>{a.timeSlot}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
