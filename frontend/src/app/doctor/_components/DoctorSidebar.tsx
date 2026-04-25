"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Stethoscope, Calendar, Search, BarChart2, LogOut, Award, BriefcaseMedical, Mail, AlertTriangle } from "lucide-react";
import { useDoctor } from "../_context/DoctorContext";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";

const NAV = [
  { id: "overview",        href: "/doctor/overview",        label: "Overview",        icon: BarChart2 },
  { id: "weeklyschedule",  href: "/doctor/weeklyschedule",  label: "Weekly Schedule", icon: Calendar },
  { id: "patientrecords",  href: "/doctor/patientrecords",  label: "Patient Records", icon: Search },
] as const;

export default function DoctorSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { doctor, doctorProfile, totalApptThisWeek } = useDoctor();

  const [showLogoutModal, setShowLogoutModal] = useState(false);

  async function confirmLogout() {
    try {
      await signOut(auth);
      localStorage.clear();
      router.push("/login");
    } catch (err: any) {
      console.error("Logout error:", err.message);
    }
  }

  return (
    <>
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

        {/* Doctor info + logout */}
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
            <button
              onClick={() => setShowLogoutModal(true)}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-400 hover:text-red-400 hover:bg-red-900/20 transition-all"
            >
              <LogOut size={16}/> Sign Out
            </button>
          </div>
        )}
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => setShowLogoutModal(false)}
          />
          {/* Modal */}
          <div className="relative bg-white rounded-3xl shadow-2xl p-8 w-full max-w-sm mx-4 z-10">
            <div className="flex flex-col items-center text-center gap-4">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle size={32} className="text-red-500"/>
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-800">Confirm Logout</h2>
                <p className="text-slate-500 text-sm mt-1">Are you sure you want to logout?</p>
              </div>
              <div className="flex gap-3 w-full mt-2">
                <button
                  onClick={() => setShowLogoutModal(false)}
                  className="flex-1 px-5 py-3 rounded-xl border border-slate-200 text-slate-600 font-semibold text-sm hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 px-5 py-3 rounded-xl bg-red-500 text-white font-bold text-sm hover:bg-red-600 transition-colors shadow-lg shadow-red-500/30"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
