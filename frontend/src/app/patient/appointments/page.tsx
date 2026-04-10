"use client";

import { Calendar as CalendarIcon, Stethoscope, Activity, Clock, CheckCircle2, XCircle } from "lucide-react";
import { usePatient } from "../_context/PatientContext";

export default function PatientAppointments() {
  const { upcomingAppointments, pastAppointments, appointmentsLoading, openAppt, formatDate } = usePatient();

  if (appointmentsLoading) {
    return (
      <div className="max-w-[1400px] flex items-center justify-center py-20">
        <div className="flex items-center gap-3 text-teal-600 font-bold text-lg">
          <div className="w-6 h-6 border-4 border-teal-600 border-t-transparent rounded-full animate-spin"/>
          Loading appointments...
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1400px]">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
        <CalendarIcon size={28} className="text-teal-500" /> Appointments
      </h2>

      {/* Upcoming */}
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold text-slate-800">Upcoming Appointments</h3>
        <button onClick={openAppt} className="bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-600 transition-colors">+ Book New</button>
      </div>
      {upcomingAppointments.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 border border-slate-100 shadow-sm flex flex-col items-center text-center gap-4 mb-10">
          <div className="w-16 h-16 bg-teal-50 rounded-2xl flex items-center justify-center">
            <CalendarIcon size={30} className="text-teal-400"/>
          </div>
          <div>
            <p className="text-slate-700 font-bold text-lg">No upcoming appointments</p>
            <p className="text-slate-400 text-sm mt-1">Use the &quot;Book New&quot; button to schedule a visit.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mb-10">
          {upcomingAppointments.map((a: any, i: number) => (
            <div key={a.appointmentId || a._id || i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md hover:border-teal-100 transition-all">
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
                <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-teal-100 text-teal-700">{a.status || "scheduled"}</span>
              </div>
              <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
                {a.hospital && (
                  <div className="flex items-center gap-2">
                    <Activity size={13} className="text-slate-400 shrink-0"/>
                    <p className="text-slate-600"><span className="font-semibold text-slate-700">Hospital: </span>{a.hospital}</p>
                  </div>
                )}
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

      {/* Past Appointments */}
      {pastAppointments.length > 0 && (
        <>
          <h3 className="text-xl font-bold text-slate-800 mb-6">Past Appointments</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {pastAppointments.map((a: any, i: number) => (
              <div key={a.appointmentId || a._id || i} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm opacity-75 hover:opacity-100 transition-all">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center shrink-0">
                      {a.status === 'completed' ? (
                        <CheckCircle2 size={18} className="text-green-500"/>
                      ) : a.status === 'cancelled' ? (
                        <XCircle size={18} className="text-red-400"/>
                      ) : (
                        <Stethoscope size={18} className="text-slate-400"/>
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-700 leading-tight text-sm">{a.doctorType || a.specialization || "Specialist"}</h4>
                      <p className="text-xs text-slate-500 mt-0.5">{a.doctorName}</p>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                    a.status === 'completed' ? 'bg-green-100 text-green-700' :
                    a.status === 'cancelled' ? 'bg-red-100 text-red-600' :
                    'bg-slate-100 text-slate-500'
                  }`}>{a.status || "past"}</span>
                </div>
                <div className="space-y-2 pt-4 border-t border-slate-100 text-sm">
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
        </>
      )}
    </div>
  );
}
