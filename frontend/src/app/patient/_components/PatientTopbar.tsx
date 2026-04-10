"use client";

import { usePathname } from "next/navigation";
import { Calendar as CalendarIcon, FileText, Pill, Activity, Mail, Search, LayoutDashboard, Salad } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { usePatient } from "../_context/PatientContext";

const PAGE_TITLES: Record<string, { label: string; icon: any }> = {
  "/patient/overview":        { label: "Overview",        icon: LayoutDashboard },
  "/patient/appointments":    { label: "Appointments",    icon: CalendarIcon },
  "/patient/medical-records": { label: "Medical Records", icon: FileText },
  "/patient/medications":     { label: "Medications",     icon: Pill },
  "/patient/timeline":        { label: "Timeline",        icon: Activity },
  "/patient/diet-plan":       { label: "Diet Plan",       icon: Salad },
  "/patient/messages":        { label: "Messages",        icon: Mail },
};

export default function PatientTopbar() {
  const pathname = usePathname();
  const { profile, messages, showMessages, setShowMessages, setShowCalendar, setShowSettings, scheduled, markOneRead, markAllRead, formatDate } = usePatient();

  const page = PAGE_TITLES[pathname] || { label: "Dashboard", icon: LayoutDashboard };
  const PageIcon = page.icon;

  return (
    <header className="bg-white border-b border-slate-200 px-8 py-4 flex items-center justify-between shrink-0">
      <div className="flex items-center gap-6 flex-1">
        <div className="relative w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={16}/>
          <input type="text" placeholder="Search..." className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-full outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 text-sm font-medium transition-all"/>
        </div>
        <div className="bg-white border border-slate-200 rounded-full px-5 py-2.5 text-sm font-semibold text-slate-600 shadow-sm hidden md:block">
          {new Date().toLocaleString("en-US",{hour:"2-digit",minute:"2-digit",hour12:true,month:"2-digit",day:"2-digit",year:"numeric"})}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <button onClick={() => setShowCalendar(true)} className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-500 hover:bg-teal-50 hover:text-teal-600 transition-colors relative">
          <CalendarIcon size={18}/>
          {scheduled.length > 0 && <span className="absolute top-0.5 right-0.5 w-2.5 h-2.5 bg-teal-400 border-2 border-white rounded-full"></span>}
        </button>
        <div className="relative">
          <button onClick={() => setShowMessages(!showMessages)} className="w-10 h-10 bg-teal-500 rounded-full flex items-center justify-center text-white hover:bg-teal-600 relative">
            <Mail size={18}/><span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-400 border-2 border-white rounded-full text-[8px] font-bold flex items-center justify-center text-white">{messages.filter((m: any) => m.isNew).length}</span>
          </button>
          <AnimatePresence>
            {showMessages && (
              <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}}
                className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h4 className="font-bold text-slate-800">Messages & Notifications</h4>
                  <button onClick={() => markAllRead()} className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Mark All Read</button>
                </div>
                <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                  {messages.map((m: any) => (
                    <div key={m.id} onClick={() => markOneRead(m)} className={`p-3 rounded-2xl border transition-all cursor-pointer ${m.isNew ? "bg-teal-50/50 border-teal-100 hover:bg-teal-50" : "bg-slate-50 border-slate-100 opacity-75"}`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.type === "appointment" ? "bg-teal-100 text-teal-600" : "bg-purple-100 text-purple-600"}`}>
                          {m.type === "appointment" ? <CalendarIcon size={14}/> : <Pill size={14}/>}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-semibold text-slate-800 leading-normal">{m.text}</p>
                          <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">{formatDate(m.date)}</span>
                        </div>
                        {m.isNew && <div className="w-2 h-2 bg-orange-400 rounded-full mt-1"></div>}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
        <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 border-2 border-white shadow-sm ml-1 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform overflow-hidden">
          {profile.profilePicture ? (
            <img src={profile.profilePicture} alt="Avatar" className="w-full h-full object-cover" />
          ) : (
            profile.name?.[0]?.toUpperCase() || "P"
          )}
        </button>
      </div>
    </header>
  );
}
