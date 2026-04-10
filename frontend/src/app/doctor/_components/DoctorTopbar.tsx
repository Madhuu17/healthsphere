"use client";

import { usePathname } from "next/navigation";

const TITLES: Record<string, string> = {
  "/doctor/overview":       "Overview",
  "/doctor/weeklyschedule": "Weekly Schedule",
  "/doctor/patientrecords": "Patient Records",
};

export default function DoctorTopbar() {
  const pathname = usePathname();
  const title = TITLES[pathname] || "Dashboard";

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 px-8 h-16 flex items-center justify-between">
      <div>
        <h1 className="text-lg font-black text-slate-800">{title}</h1>
        <p className="text-xs text-slate-400 font-medium">
          {new Date().toLocaleDateString("en-IN", { weekday:"long", day:"numeric", month:"long", year:"numeric" })}
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="w-2.5 h-2.5 bg-green-400 rounded-full animate-pulse"/>
        <span className="text-xs text-slate-500 font-semibold">System Online</span>
      </div>
    </header>
  );
}
