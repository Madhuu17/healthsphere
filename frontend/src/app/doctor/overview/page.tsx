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

      {/* Doctor Profile Card + Today's appointments */}
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
          <h2 className="text-base font-black text-slate-700 uppercase tracking-wider mb-6">Professional Profile</h2>
          <div className="flex items-start gap-6">
            <div className="w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-700 rounded-2xl flex items-center justify-center text-white text-4xl font-black shadow-xl shadow-blue-500/30 shrink-0">
              {doctor.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-black text-slate-900">{doctor.name}</h3>
              <p className="text-blue-600 font-bold">{doctorProfile?.designation}</p>
              <div className="grid grid-cols-2 gap-4 mt-4">
                {[
                  ["Specialization", doctorProfile?.specialization],
                  ["Qualification", doctorProfile?.qualification],
                  ["Hospital", doctorProfile?.hospital],
                  ["Experience", doctorProfile?.experience ? `${doctorProfile.experience} years` : "—"],
                  ["Contact", doctorProfile?.contactNumber],
                  ["Age", doctorProfile?.age ? `${doctorProfile.age} years` : "—"],
                ].map(([k, v]) => (
                  <div key={k as string} className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">{k}</p>
                    <p className="font-bold text-slate-700 text-sm mt-0.5 truncate">{(v as string) || "—"}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Today's appointments */}
        <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
          <h2 className="text-base font-black text-slate-700 uppercase tracking-wider mb-5">Today&apos;s Appointments</h2>
          {todayAppts.length === 0 ? (
            <div className="text-center py-8">
              <Calendar size={36} className="mx-auto text-slate-200 mb-3"/>
              <p className="text-slate-400 text-sm font-medium">No appointments today</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.map((a: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-blue-50 rounded-xl border border-blue-100">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center text-white font-black text-sm shrink-0">
                    {a.patientName?.[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0">
                    <p className="font-bold text-slate-800 text-sm truncate">{a.patientName}</p>
                    <p className="text-xs text-blue-500 font-semibold">{a.timeSlot}</p>
                  </div>
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
