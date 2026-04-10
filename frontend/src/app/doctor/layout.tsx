"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { DoctorProvider } from "./_context/DoctorContext";
import DoctorSidebar from "./_components/DoctorSidebar";
import DoctorTopbar from "./_components/DoctorTopbar";

const DASHBOARD_ROUTES = ["/doctor/overview", "/doctor/weeklyschedule", "/doctor/patientrecords"];

export default function DoctorLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isDashboardRoute = DASHBOARD_ROUTES.some(r => pathname.startsWith(r));

  if (!isDashboardRoute) {
    return (
      <div style={{ background: "#f8fafc", minHeight: "100vh", fontFamily: "'Inter', system-ui, -apple-system, sans-serif" }}>
        {children}
      </div>
    );
  }

  return (
    <DoctorProvider>
      <div className="min-h-screen bg-slate-50" style={{ fontFamily: "'Inter', sans-serif" }}>
        <DoctorSidebar />
        <div className="ml-64 min-h-screen">
          <DoctorTopbar />
          <div className="p-8">
            {children}
          </div>
        </div>
      </div>
    </DoctorProvider>
  );
}
