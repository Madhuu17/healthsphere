"use client";

import Link from "next/link";
import { UserRound, Calendar as CalendarIcon, FileText, Pill, Activity, QrCode, Edit2, Stethoscope } from "lucide-react";
import { usePatient } from "../_context/PatientContext";

export default function PatientOverview() {
  const { profile, timeline, appointments, upcomingAppointments, setShowSettings, openAppt, setShowRecord, formatDate, calcAge } = usePatient();

  return (
    <div className="space-y-8 max-w-[1400px]">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
        <Activity size={28} className="text-teal-500" /> Overview
      </h2>

      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Profile Card */}
        <div className="xl:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-8">
          <div className="relative shrink-0">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 border-4 border-white shadow-lg flex items-center justify-center overflow-hidden">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <UserRound size={54} className="text-teal-300"/>
              )}
            </div>
            <button onClick={() => setShowSettings(true)} className="absolute bottom-1 right-1 w-9 h-9 bg-teal-500 text-white rounded-full flex items-center justify-center border-2 border-white shadow hover:bg-teal-600 transition-colors">
              <Edit2 size={14}/>
            </button>
          </div>
          <div className="flex-1 space-y-4 w-full">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <h3 className="text-2xl font-bold text-slate-800">{profile.name}</h3>
                <p className="text-teal-500 font-semibold text-sm mt-0.5">Role: Patient</p>
              </div>
              <span className="bg-teal-500 text-white text-xs font-bold px-3 py-1 rounded-lg">Active</span>
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {profile.dob && <span className="bg-teal-50 text-teal-700 text-xs font-bold px-3 py-1 rounded-full border border-teal-100">Age: {calcAge(profile.dob) ?? "—"} yrs</span>}
              {profile.gender && <span className="bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full border border-blue-100">{profile.gender}</span>}
              {profile.bloodGroup && <span className="bg-red-50 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-100">🩸 {profile.bloodGroup}</span>}
            </div>
            <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-2">
              <div className="col-span-2"><span className="text-slate-500">Residential Address</span><p className="font-semibold text-slate-800">{profile.address || "Not provided"}</p></div>
              <div><span className="text-slate-500">Emergency Contact</span><p className="font-semibold text-slate-800">{profile.emergencyContact?.name || "N/A"}</p></div>
              <div><span className="text-slate-500">Emergency Phone</span><p className="font-semibold text-teal-600">{profile.emergencyContact?.phone || "N/A"}</p></div>
            </div>
            <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
              <div><span className="text-teal-500 font-bold">Chart ID: </span><span className="text-slate-700 font-semibold">{profile.id}</span></div>
              {profile.height && <div><span className="text-teal-500 font-bold">Height: </span><span className="text-slate-700 font-semibold">{profile.height} cm</span></div>}
              {profile.weight && <div><span className="text-teal-500 font-bold">Weight: </span><span className="text-slate-700 font-semibold">{profile.weight} kg</span></div>}
            </div>
          </div>
        </div>

        {/* QR + Appointments mini */}
        <div className="xl:col-span-7 flex flex-col gap-8">
          <Link href="/patient/qr" className="bg-gradient-to-br from-teal-500 to-emerald-600 text-white rounded-3xl p-6 flex items-center gap-6 shadow-lg hover:scale-[1.02] transition-transform cursor-pointer">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center shrink-0">
              <QrCode size={34} className="text-white"/>
            </div>
            <div>
              <h4 className="text-lg font-bold">Emergency QR Code</h4>
              <p className="text-teal-100 text-sm mt-1">Generate your Medical ID QR for quick first-responder access to your critical health info.</p>
              <span className="mt-3 inline-block bg-white/20 border border-white/30 text-white text-xs font-bold px-3 py-1.5 rounded-lg hover:bg-white/30 transition-colors">Generate QR →</span>
            </div>
          </Link>

          <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm flex-1">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-800">Appointments</h3>
              <button onClick={openAppt} className="bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-teal-600 transition-colors">+ Book New</button>
            </div>
            <table className="w-full text-left text-sm">
              <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                <th className="pb-3 font-bold">Type</th><th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Doctor</th><th className="pb-3 font-bold">Status</th>
              </tr></thead>
              <tbody className="font-semibold text-slate-700">
                {upcomingAppointments.slice(0,3).map((a: any,i: number)=>(
                  <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3">Visit</td><td className="py-3">{formatDate(a.date)}</td><td className="py-3 truncate max-w-[130px]">{a.doctorName}</td>
                    <td className="py-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-600">{a.status || "Scheduled"}</span></td>
                  </tr>
                ))}
                {upcomingAppointments.length===0 && (
                  <tr><td colSpan={4} className="py-6 text-center text-slate-400 text-xs">No appointments yet. Book one above!</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Bottom 3-cols */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Medical Records */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-800">Medical Records</h3>
            <Link href="/patient/medical-records" className="bg-teal-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">Browse All</Link>
          </div>
          <table className="w-full text-left text-sm">
            <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
              <th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Name</th>
            </tr></thead>
            <tbody className="font-semibold text-slate-700">
              {timeline.slice(0,4).map((r: any,i: number)=>(
                <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer" onClick={()=>setShowRecord(r)}>
                  <td className="py-3 text-slate-500 whitespace-nowrap">{formatDate(r.date)}</td>
                  <td className="py-3 truncate max-w-[180px]">{r.title}</td>
                </tr>
              ))}
              {timeline.length===0 && <tr><td colSpan={2} className="py-4 text-center text-slate-400 text-xs">No records yet</td></tr>}
            </tbody>
          </table>
        </div>

        {/* Quick Stats - Medications */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-slate-800">Medications</h3>
            <Link href="/patient/medications" className="bg-purple-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-purple-600 transition-colors">Manage</Link>
          </div>
          <div className="space-y-3">
            {[
              { name: "Amoxicillin 500mg", dose: "1 pill every 8 hours", condition: "Infection" },
              { name: "Vitamin D3 2000IU", dose: "1 capsule daily", condition: "Deficiency" },
              { name: "Paracetamol 650mg", dose: "As needed (max 4/day)", condition: "Pain relief" }
            ].map((med, i) => (
              <div key={i} className="flex items-center gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:bg-purple-50 hover:border-purple-100 transition-colors">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center text-purple-600 shrink-0"><Pill size={18}/></div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-slate-800 text-sm truncate">{med.name}</p>
                  <p className="text-xs text-slate-500">{med.dose} · {med.condition}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Activity / Stats */}
        <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-5">Quick Stats</h3>
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: "Total Records", value: timeline.length, color: "bg-teal-50 text-teal-600" },
              { label: "Upcoming Appts", value: upcomingAppointments.length, color: "bg-blue-50 text-blue-600" },
              { label: "Blood Group", value: profile.bloodGroup || "—", color: "bg-red-50 text-red-600" },
              { label: "Height", value: profile.height ? `${profile.height}cm` : "—", color: "bg-purple-50 text-purple-600" },
            ].map(s => (
              <div key={s.label} className={`${s.color} rounded-2xl p-4 text-center border border-slate-100`}>
                <p className="text-2xl font-black">{s.value}</p>
                <p className="text-xs font-bold mt-1 opacity-70">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
