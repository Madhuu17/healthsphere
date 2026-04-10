"use client";

import { Calendar as CalendarIcon, Stethoscope, Activity, Clock } from "lucide-react";
import { usePatient } from "../_context/PatientContext";

export default function PatientAppointments() {
  const { upcomingAppointments, openAppt, formatDate } = usePatient();

  return (
    <div className="max-w-[1400px]">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
        <CalendarIcon size={28} className="text-teal-500" /> Appointments
      </h2>

      <div className="flex items-center justify-between mb-6">
        <h3 className="text-2xl font-bold text-slate-800">My Appointments</h3>
        <button onClick={openAppt} className="bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-600 transition-colors">+ Book New</button>
      </div>
      {upcomingAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
            <CalendarIcon size={30} className="text-teal-400"/>
          </div>
          <div>
            <p className="text-slate-700 font-bold text-lg">No upcoming appointments</p>
            <p className="text-slate-400 text-sm mt-1">Use the "Book New" button to schedule a visit.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {upcomingAppointments.map((a: any, i: number) => (
            <div key={i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-teal-50 rounded-full flex items-center justify-center shrink-0">
                    <Stethoscope size={18} className="text-teal-600"/>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-800 leading-tight text-sm">{a.doctorType || a.specialization || "Specialist"}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">{a.doctorName}</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-700">{a.status || "Scheduled"}</span>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
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
          ))}
        </div>
      )}
    </div>
  );
}
