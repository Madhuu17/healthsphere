"use client";

import { Calendar as CalendarIcon, Stethoscope, Activity, Clock, FileText, Pill, Heart, BarChart2, Image as ImageIcon } from "lucide-react";
import { usePatient } from "../_context/PatientContext";

const TYPE_META: Record<string, { color: string; bg: string; icon: any; label: string }> = {
  consultation:  { color: "text-teal-600",   bg: "bg-teal-100",   icon: Stethoscope, label: "Consultation" },
  prescription:  { color: "text-purple-600", bg: "bg-purple-100", icon: Pill,         label: "Prescription" },
  lab_report:    { color: "text-red-600",    bg: "bg-red-100",    icon: BarChart2,    label: "Lab Report" },
  xray:          { color: "text-blue-600",   bg: "bg-blue-100",   icon: ImageIcon,    label: "X-Ray / Scan" },
  vaccination:   { color: "text-green-600",  bg: "bg-green-100",  icon: Heart,        label: "Vaccination" },
  appointment:   { color: "text-teal-600",   bg: "bg-teal-100",   icon: CalendarIcon, label: "Appointment" },
};

export default function PatientTimeline() {
  const { pastAppointments, timeline, formatDate } = usePatient();

  // Merge timeline (medical records) + past appointments into one sorted list
  const timelineEntries = [
    ...timeline.map((t: any) => ({
      ...t,
      _type: "record",
      _date: new Date(t.date),
      _title: t.title,
      _description: t.description || t.notes || "",
      _category: t.type || "consultation",
    })),
    ...pastAppointments
      .filter((a: any) => !timeline.some((t: any) =>
        t.title?.includes(a.appointmentId) || t.title?.includes(a.doctorName)
      ))
      .map((a: any) => ({
        ...a,
        _type: "appointment",
        _date: new Date(a.date),
        _title: `Appointment with ${a.doctorName}`,
        _description: `${a.hospital || ""} · ${a.timeSlot || ""}`.trim(),
        _category: "appointment",
      })),
  ].sort((a, b) => b._date.getTime() - a._date.getTime());

  return (
    <div className="max-w-2xl mx-auto">
      <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight flex items-center gap-3">
        <Activity size={28} className="text-teal-500" /> Timeline
      </h2>

      <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-4">
        <h3 className="text-xl font-bold text-slate-800 mb-1">Medical History</h3>
        <p className="text-slate-400 text-sm">A chronological record of all your appointments, prescriptions, and medical records.</p>
      </div>

      {timelineEntries.length === 0 ? (
        <div className="bg-white rounded-3xl p-14 text-center border border-slate-100">
          <Activity size={48} className="mx-auto text-slate-200 mb-4"/>
          <p className="text-slate-400 font-semibold">No timeline entries yet.</p>
          <p className="text-slate-400 text-sm mt-1">Completed appointments and medical records will appear here automatically.</p>
        </div>
      ) : (
        <div className="relative pl-10">
          <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-slate-200 to-slate-100"/>
          <div className="space-y-4">
            {timelineEntries.map((entry: any, i: number) => {
              const meta = TYPE_META[entry._category] || TYPE_META.consultation;
              const Icon = meta.icon;
              return (
                <div key={entry._id || entry.appointmentId || i} className="flex gap-5 relative group">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 -ml-10 relative z-10 shadow-md ${meta.bg} ${meta.color}`}>
                    <Icon size={16}/>
                  </div>
                  <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-100 transition-all group-hover:-translate-y-0.5">
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <p className="font-bold text-slate-800 text-sm">{entry._title}</p>
                        {entry.doctorName && entry._type === "record" && (
                          <p className="text-xs text-slate-500 mt-0.5">Dr. {entry.doctorName?.replace(/^Dr\.?\s*/i, "")}</p>
                        )}
                      </div>
                      <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${meta.bg} ${meta.color}`}>
                        {meta.label}
                      </span>
                    </div>
                    <div className="space-y-1.5 pt-3 border-t border-slate-100 text-sm">
                      {entry._description && (
                        <p className="text-slate-600 leading-snug text-xs line-clamp-3">{entry._description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <CalendarIcon size={13} className="text-slate-400 shrink-0"/>
                        <p className="text-slate-500 text-xs font-semibold">{formatDate(entry._date)}</p>
                      </div>
                      {entry.timeSlot && (
                        <div className="flex items-center gap-2">
                          <Clock size={13} className="text-slate-400 shrink-0"/>
                          <p className="text-slate-500 text-xs font-semibold">{entry.timeSlot}</p>
                        </div>
                      )}
                      {/* Attachments */}
                      {entry.attachments?.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-2">
                          {entry.attachments.map((url: string, j: number) => (
                            <a key={j} href={url} target="_blank" rel="noreferrer"
                              className="text-xs font-semibold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg hover:bg-blue-100 transition-colors flex items-center gap-1">
                              <FileText size={10}/> View File
                            </a>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
