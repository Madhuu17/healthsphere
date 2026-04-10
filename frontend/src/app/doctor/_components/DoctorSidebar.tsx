"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, Calendar, Search, BarChart2, LogOut, Award, BriefcaseMedical, Mail } from "lucide-react";
import { useDoctor } from "../_context/DoctorContext";

const NAV = [
  { id: "overview",        href: "/doctor/overview",        label: "Overview",        icon: BarChart2 },
  { id: "weeklyschedule",  href: "/doctor/weeklyschedule",  label: "Weekly Schedule", icon: Calendar },
  { id: "patientrecords",  href: "/doctor/patientrecords",  label: "Patient Records", icon: Search },
] as const;

export default function DoctorSidebar() {
  const pathname = usePathname();
  const { doctor, doctorProfile, totalApptThisWeek, handleLogout } = useDoctor();

  return (
    <div className="fixed left-0 top-0 bottom-0 w-64 bg-slate-900 flex flex-col z-40 shadow-2xl">
      {/* Logo */}
      <div className="px-6 py-7 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="bg-blue-500 p-2.5 rounded-xl shadow-lg shadow-blue-500/30">
            <Stethoscope size={22} className="text-white"/>
          </div>
          <div>
            <p className="font-black text-white text-lg leading-tight">HealthSphere</p>
            <p className="text-blue-400 text-xs font-semibold">Provider Portal</p>
          </div>
        </div>
      </div>

      {/* Doctor profile card */}
      {doctorProfile && (
        <div className="px-4 py-5 border-b border-slate-800">
          <div className="bg-slate-800 rounded-2xl p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-11 h-11 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white font-black text-xl shadow-lg">
                {doctor.name?.[0]?.toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="text-white font-bold text-sm truncate">{doctor.name}</p>
                <p className="text-blue-300 text-xs truncate">{doctorProfile.designation || doctorProfile.specialization}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-slate-700 rounded-xl p-2 text-center">
                <p className="text-blue-300 text-xs font-semibold">{doctorProfile.experience || 0}yrs</p>
                <p className="text-slate-400 text-[10px]">Experience</p>
              </div>
              <div className="bg-slate-700 rounded-xl p-2 text-center">
                <p className="text-blue-300 text-xs font-semibold">{totalApptThisWeek}</p>
                <p className="text-slate-400 text-[10px]">This Week</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="px-4 py-4 flex-1 space-y-1">
        {NAV.map(({ id, href, label, icon: Icon }) => {
          const isActive = pathname === href;
          return (
            <Link key={id} href={href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              }`}>
              <Icon size={18}/>{label}
            </Link>
          );
        })}
      </nav>

      {/* Doctor info */}
      {doctorProfile && (
        <div className="px-4 pb-4 space-y-2">
          <div className="bg-slate-800 rounded-xl p-3 text-xs space-y-2">
            <div className="flex items-center gap-2 text-slate-300">
              <BriefcaseMedical size={13} className="text-blue-400 shrink-0"/>
              <span className="truncate">{doctorProfile.hospital}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Award size={13} className="text-blue-400 shrink-0"/>
              <span className="truncate">{doctorProfile.qualification}</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <Mail size={13} className="text-blue-400 shrink-0"/>
              <span className="truncate">{doctor.email}</span>
            </div>
          </div>
          <button onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all">
            <LogOut size={16}/> Sign Out
          </button>
        </div>
      )}
    </div>
  );
}
