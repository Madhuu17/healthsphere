"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { PatientProvider } from "./_context/PatientContext";
import PatientSidebar from "./_components/PatientSidebar";
import PatientTopbar from "./_components/PatientTopbar";
import PatientModals from "./_components/PatientModals";

// Pages that use the full dashboard shell (sidebar + topbar)
const DASHBOARD_ROUTES = [
  "/patient/overview", "/patient/appointments", "/patient/medical-records",
  "/patient/medications", "/patient/timeline", "/patient/diet-plan", "/patient/messages",
];

export default function PatientLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = DASHBOARD_ROUTES.some(r => pathname.startsWith(r));

  // Non-dashboard pages (setup-profile, symptom-checker, etc.) render without shell
  if (!isDashboardRoute) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </div>
    );
  }

  // Dashboard pages get the full shell
  return (
    <PatientProvider>
      <div className="flex h-screen bg-slate-50 overflow-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>
        <PatientSidebar />
        <main className="flex-1 flex flex-col h-screen overflow-hidden">
          <PatientTopbar />
          <div className="flex-1 overflow-y-auto px-8 py-8">
            {children}
          </div>
        </main>
        <PatientModals />
      </div>
    </PatientProvider>
  );
}
