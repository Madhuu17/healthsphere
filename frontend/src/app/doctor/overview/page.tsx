"use client";

import { Calendar, Lock, Award, Stethoscope } from "lucide-react";
import { useDoctor } from "../_context/DoctorContext";

export default function DoctorOverview() {
  const { doctor, doctorProfile, appointments, blockedDates, totalApptThisWeek, today, formatDate } = useDoctor();

  const todayAppts = appointments.filter((a: any) => a.date === today);

  return (
    <div className="space-y-8">
      {/* Stats row */}
      <div className="grid grid-cols-4 gap-5">
        {[
          { label: "Appointments This Week", value: totalApptThisWeek, icon: Calendar, color: "bg-blue-500" },
          { label: "Leave Days Blocked", value: blockedDates.length, icon: Lock, color: "bg-red-500" },
          { label: "Years Experience", value: doctorProfile?.experience || "—", icon: Award, color: "bg-purple-500" },
          { label: "Specialization", value: doctorProfile?.specialization || "—", icon: Stethoscope, color: "bg-teal-500" },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="bg-white rounded-2xl p-6 border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className={`w-11 h-11 ${color} rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
              <Icon size={20} className="text-white"/>
            </div>
            <p className="text-2xl font-black text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 font-semibold mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Today's Appointments — centered */}
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Calendar size={20} className="text-white"/>
            </div>
            <h2 className="text-base font-black text-slate-700 uppercase tracking-wider">
              Today&apos;s Appointments
            </h2>
            {todayAppts.length > 0 && (
              <span className="ml-auto bg-blue-100 text-blue-600 text-xs font-black px-3 py-1 rounded-full">
                {todayAppts.length} scheduled
              </span>
            )}
          </div>

          {todayAppts.length === 0 ? (
            <div className="text-center py-12">
              <Calendar size={44} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 font-semibold">No appointments today</p>
              <p className="text-slate-300 text-sm mt-1">Enjoy your free day!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-100 hover:bg-blue-100/60 transition-colors">
                  <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0 shadow-md shadow-blue-600/20">
                    {a.patientName?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-bold text-slate-800 truncate">{a.patientName}</p>
                    <p className="text-xs text-slate-500 truncate mt-0.5">{a.hospital}</p>
                  </div>
                  <span className="shrink-0 bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-sm">
                    {a.timeSlot}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upcoming this week */}
      <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-base font-black text-slate-700 uppercase tracking-wider">Upcoming This Week</h2>
        </div>
        {appointments.length === 0 ? (
          <p className="text-slate-400 text-sm text-center py-8">No appointments scheduled this week.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Patient", "Date", "Time", "Hospital", "Status"].map(h => (
                    <th key={h} className="pb-3 text-left text-xs font-black text-slate-400 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {appointments.slice(0, 8).map((a: any, i: number) => (
                  <tr key={i} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 font-bold text-slate-800">{a.patientName}</td>
                    <td className="py-3.5 text-slate-500">{formatDate(a.date)}</td>
                    <td className="py-3.5 text-slate-500">{a.timeSlot}</td>
                    <td className="py-3.5 text-slate-500 truncate max-w-[150px]">{a.hospital}</td>
                    <td className="py-3.5">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black ${
                        a.status === "scheduled" ? "bg-teal-50 text-teal-600" : "bg-slate-100 text-slate-400"
                      }`}>{a.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
