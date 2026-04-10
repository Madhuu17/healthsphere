"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Calendar as CalendarIcon, FileText, Pill, Activity, Mail, LayoutDashboard, Stethoscope, Salad, Settings, LogOut } from "lucide-react";
import { usePatient } from "../_context/PatientContext";

const NAV = [
  { name: "Overview",        href: "/patient/overview",        icon: LayoutDashboard },
  { name: "Appointments",    href: "/patient/appointments",    icon: CalendarIcon },
  { name: "Medical Records", href: "/patient/medical-records", icon: FileText },
  { name: "Medications",     href: "/patient/medications",     icon: Pill },
  { name: "Timeline",        href: "/patient/timeline",        icon: Activity },
  { name: "Diet Plan",       href: "/patient/diet-plan",       icon: Salad },
  { name: "Messages",        href: "/patient/messages",        icon: Mail },
];

export default function PatientSidebar() {
  const pathname = usePathname();
  const { profile, messages, setShowSettings, handleLogout } = usePatient();
  const unreadCount = messages.filter((m: any) => m.isNew).length;

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
      <div className="p-6 flex items-center gap-2 border-b border-slate-100">
        <Activity className="text-teal-500" size={22}/>
        <span className="text-xl font-black text-teal-500 tracking-tight">HealthSphere</span>
      </div>
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {NAV.map(item => {
          const isActive = pathname === item.href;
          const isMessageItem = item.name === "Messages";
          const badgeCount = isMessageItem ? unreadCount : 0;
          return (
            <Link key={item.name} href={item.href}
              className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-left
                ${isActive ? "bg-teal-50 text-teal-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
              <div className="relative">
                <item.icon size={20} className={isActive ? "text-teal-500" : "text-slate-400"} />
                {badgeCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 border-2 border-white rounded-full text-[8px] font-black flex items-center justify-center text-white">{badgeCount}</span>}
              </div>
              <span className="flex-1">{item.name}</span>
            </Link>
          );
        })}
        <div className="pt-3 mt-3 border-t border-slate-100 space-y-1">
          <Link href="/patient/medicine-reminders"
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl text-slate-500 hover:bg-orange-50 hover:text-orange-600 font-semibold text-left transition-all">
            <Pill size={20} className="text-orange-400" />
            <span className="flex-1">Medicine Reminders</span>
          </Link>
          <Link href="/patient/symptom-checker"
            className="w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl bg-gradient-to-r from-teal-500 to-emerald-500 text-white font-semibold text-left hover:from-teal-600 hover:to-emerald-600 transition-all shadow-sm hover:shadow-md">
            <Stethoscope size={20} />
            <span className="flex-1">Check Symptoms</span>
          </Link>
        </div>
      </nav>
      <div className="p-4 border-t border-slate-100">
        <div className="bg-slate-50 rounded-3xl p-3 border border-slate-100 flex flex-col gap-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-inner overflow-hidden">
              {profile.profilePicture ? (
                <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
              ) : (
                profile.name?.[0]?.toUpperCase() || "P"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-black text-slate-800 truncate leading-tight">{profile.name}</p>
              <p className="text-[10px] font-bold text-teal-600 uppercase tracking-tighter mt-0.5">Patient Account</p>
            </div>
          </div>
          <div className="flex gap-1">
            <button onClick={() => setShowSettings(true)} className="flex-1 flex items-center justify-center py-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:border-teal-200 hover:text-teal-600 transition-all">
              <Settings size={16}/>
            </button>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center py-2 bg-white rounded-xl border border-slate-200 text-slate-500 hover:border-red-200 hover:text-red-600 transition-all">
              <LogOut size={16}/>
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
}
