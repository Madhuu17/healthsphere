"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, MicOff, X, Calendar, Clock, Stethoscope, Building2, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import { parseVoiceIntent, type VoiceIntent } from "@/utils/voiceNlp";

const API = "http://localhost:5000";

type Phase =
  | "idle"
  | "listening"
  | "processing"
  | "awaiting_input"
  | "awaiting_confirmation"
  | "booking"
  | "success"
  | "error";

interface DoctorResult {
  doctorId: string;
  name: string;
  specialization: string;
  hospital: string;
  experience?: number;
}

interface Props {
  onClose: () => void;
  onBooked: (apptData?: any) => void;
}

export default function VoiceAssistant({ onClose, onBooked }: Props) {
  const [phase, setPhase] = useState<Phase>("idle");
  const [transcript, setTranscript] = useState("");
  const [statusText, setStatusText] = useState("Tap the mic to start");
  const [errorMsg, setErrorMsg] = useState("");

  // Booking state
  const [doctors, setDoctors] = useState<DoctorResult[]>([]);
  const [selectedDoc, setSelectedDoc] = useState<DoctorResult | null>(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [bookedAppt, setBookedAppt] = useState<any>(null);
  const [confirmMsg, setConfirmMsg] = useState("");

  // Speech recognition
  const recognitionRef = useRef<any>(null);
  const isListeningRef = useRef(false);
  const finalTranscriptRef = useRef("");

  // Patient info
  const getPatient = () => {
    const raw = localStorage.getItem("user");
    if (!raw) return { id: "", name: "" };
    const u = JSON.parse(raw);
    return { id: u.id || u.patientId || "", name: u.name || "" };
  };

  // ── Speech Recognition Setup ──
  const startListening = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setErrorMsg("Speech recognition is not supported in this browser. Please use Chrome.");
      setPhase("error");
      return;
    }

    finalTranscriptRef.current = "";

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = true;
    recognition.continuous = true;

    recognition.onstart = () => {
      isListeningRef.current = true;
      setPhase("listening");
      setStatusText("Listening...");
      setErrorMsg("");
    };

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          final += event.results[i][0].transcript;
        } else {
          interim += event.results[i][0].transcript;
        }
      }
      const display = final || interim;
      setTranscript(display);
      if (final) finalTranscriptRef.current = final;
    };

    recognition.onend = () => {
      isListeningRef.current = false;
      const text = finalTranscriptRef.current.trim();
      if (text) {
        handleTranscript(text);
      } else {
        setPhase("idle");
        setStatusText("Tap the mic to start");
      }
    };

    recognition.onerror = (event: any) => {
      isListeningRef.current = false;
      if (event.error === "not-allowed") {
        setErrorMsg("Microphone permission denied — please allow mic access in your browser settings.");
        setPhase("error");
      } else if (event.error === "no-speech") {
        setPhase("idle");
        setStatusText("No speech detected. Tap to try again.");
      } else {
        setErrorMsg(`Speech error: ${event.error}`);
        setPhase("error");
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && isListeningRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current = null;
    }
  }, []);

  // ── Handle final transcript ──
  const handleTranscript = async (text: string) => {
    setPhase("processing");
    setStatusText("Processing...");

    const intent = parseVoiceIntent(text);

    switch (intent.type) {
      case "book":
        await handleBookIntent(intent);
        break;
      case "search_specialty":
        await handleSpecialtySearch(intent);
        break;
      case "check_availability":
        await handleAvailabilityCheck(intent);
        break;
      case "confirm_yes":
        await handleConfirmYes();
        break;
      case "confirm_no":
        setPhase("idle");
        setStatusText("Cancelled. Tap the mic for a new command.");
        setTranscript("");
        setConfirmMsg("");
        break;
      case "unknown":
        setStatusText("Could not understand command. Try saying: 'Book appointment with Dr...'");
        setPhase("idle");
        break;
    }
  };

  // ── CASE: Book intent ──
  const handleBookIntent = async (intent: VoiceIntent & { type: "book" }) => {
    // Search for doctor
    if (intent.doctor) {
      try {
        const res = await fetch(`${API}/api/voice-booking/search-doctors`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name: intent.doctor, hospital: intent.hospital }),
        });
        const data = await res.json();

        if (!data.success || !data.doctors?.length) {
          setStatusText(`Doctor "${intent.doctor}" not found. Try again.`);
          setPhase("idle");
          return;
        }

        if (data.doctors.length === 1) {
          const doc = data.doctors[0];
          setSelectedDoc(doc);

          // If we have all details, try to book
          if (intent.date && intent.time) {
            await tryAutoBook(doc, intent.date, intent.time);
          } else if (intent.date) {
            // Fetch slots for selected date
            setSelectedDate(intent.date);
            await fetchSlots(doc.doctorId, intent.date);
            setStatusText(`Select a time slot for ${doc.name}`);
            setPhase("awaiting_input");
          } else {
            setStatusText(`Select date and time for ${doc.name}`);
            setPhase("awaiting_input");
          }
        } else {
          setDoctors(data.doctors);
          setStatusText(`Found ${data.doctors.length} doctors. Select one:`);
          setPhase("awaiting_input");
        }
      } catch {
        setErrorMsg("Network error — please check your connection.");
        setPhase("error");
      }
    } else {
      setStatusText("Please mention a doctor name. Try: 'Book with Dr...'");
      setPhase("idle");
    }
  };

  // ── CASE: Specialty search ──
  const handleSpecialtySearch = async (intent: VoiceIntent & { type: "search_specialty" }) => {
    try {
      const res = await fetch(`${API}/api/voice-booking/search-doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ specialty: intent.specialty, hospital: intent.hospital }),
      });
      const data = await res.json();

      if (!data.success || !data.doctors?.length) {
        setStatusText(`No ${intent.specialty}s found${intent.hospital ? ` at ${intent.hospital}` : ""}. Try a different search.`);
        setPhase("idle");
        return;
      }

      setDoctors(data.doctors);
      setStatusText(`${data.doctors.length} ${intent.specialty}${data.doctors.length > 1 ? "s" : ""} found:`);
      setPhase("awaiting_input");
    } catch {
      setErrorMsg("Network error — please check your connection.");
      setPhase("error");
    }
  };

  // ── CASE: Availability check ──
  const handleAvailabilityCheck = async (intent: VoiceIntent & { type: "check_availability" }) => {
    try {
      const searchRes = await fetch(`${API}/api/voice-booking/search-doctors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: intent.doctor }),
      });
      const searchData = await searchRes.json();

      if (!searchData.success || !searchData.doctors?.length) {
        setStatusText(`Doctor "${intent.doctor}" not found.`);
        setPhase("idle");
        return;
      }

      const doc = searchData.doctors[0];
      setSelectedDoc(doc);

      const date = intent.date || new Date().toISOString().split("T")[0];
      setSelectedDate(date);

      const res = await fetch(`${API}/api/voice-booking/check-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: doc.doctorId, date, time: intent.time }),
      });
      const data = await res.json();

      if (data.available && intent.time) {
        setConfirmMsg(`Yes, ${doc.name} is available on ${formatDisplayDate(date)} at ${intent.time}. Would you like to book?`);
        setSelectedSlot(intent.time);
        setPhase("awaiting_confirmation");
      } else if (data.available) {
        setAvailableSlots(data.availableSlots || []);
        setStatusText(`${doc.name} is available. Select a slot:`);
        setPhase("awaiting_input");
      } else {
        setAvailableSlots(data.availableSlots || []);
        setStatusText(intent.time
          ? `${doc.name} is not available at ${intent.time}. Choose an alternative:`
          : `${doc.name} is unavailable on this date.`);
        setPhase("awaiting_input");
      }
    } catch {
      setErrorMsg("Network error — please check your connection.");
      setPhase("error");
    }
  };

  // ── Confirm yes → book ──
  const handleConfirmYes = async () => {
    if (selectedDoc && selectedDate && selectedSlot) {
      await doBook(selectedDoc, selectedDate, selectedSlot);
    } else {
      setStatusText("Nothing to confirm. Start a new command.");
      setPhase("idle");
    }
  };

  // ── Try auto booking ──
  const tryAutoBook = async (doc: DoctorResult, date: string, time: string) => {
    const res = await fetch(`${API}/api/voice-booking/check-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ doctorId: doc.doctorId, date, time }),
    });
    const data = await res.json();

    if (data.available) {
      await doBook(doc, date, time);
    } else {
      setSelectedDoc(doc);
      setSelectedDate(date);
      setAvailableSlots(data.availableSlots || []);
      setStatusText(`${doc.name} is unavailable at ${time}. Choose an alternative:`);
      setPhase("awaiting_input");
    }
  };

  // ── Execute booking ──
  const doBook = async (doc: DoctorResult, date: string, slot: string) => {
    setPhase("booking");
    setStatusText("Booking appointment...");
    const patient = getPatient();

    try {
      const res = await fetch(`${API}/api/voice-booking/book`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId: patient.id,
          patientName: patient.name,
          doctorId: doc.doctorId,
          date,
          timeSlot: slot,
        }),
      });
      const data = await res.json();

      if (data.success) {
        setBookedAppt(data.appointment);
        setPhase("success");
        setStatusText("Appointment booked!");
        onBooked(data.appointment);
      } else if (res.status === 409) {
        setAvailableSlots(data.alternativeSlots || []);
        setStatusText("Slot was just taken. Choose an alternative:");
        setPhase("awaiting_input");
      } else {
        setErrorMsg(data.message || "Booking failed");
        setPhase("error");
      }
    } catch {
      setErrorMsg("Network error — please check your connection.");
      setPhase("error");
    }
  };

  // ── Fetch slots for a date ──
  const fetchSlots = async (docId: string, date: string) => {
    setSlotsLoading(true);
    try {
      const res = await fetch(`${API}/api/voice-booking/check-availability`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ doctorId: docId, date }),
      });
      const data = await res.json();
      setAvailableSlots(data.availableSlots || []);
    } catch {
      setAvailableSlots([]);
    }
    setSlotsLoading(false);
  };

  // ── Select a doctor card ──
  const onSelectDoctor = async (doc: DoctorResult) => {
    setSelectedDoc(doc);
    setDoctors([]);
    if (selectedDate) {
      await fetchSlots(doc.doctorId, selectedDate);
      setStatusText(`Select a time slot for ${doc.name}`);
    } else {
      setStatusText(`Select date and time for ${doc.name}`);
    }
    setPhase("awaiting_input");
  };

  // ── Select a slot → book ──
  const onSelectSlot = async (slot: string) => {
    if (!selectedDoc || !selectedDate) return;
    setSelectedSlot(slot);
    await doBook(selectedDoc, selectedDate, slot);
  };

  // ── Date change handler ──
  const onDateChange = async (date: string) => {
    setSelectedDate(date);
    setSelectedSlot("");
    if (selectedDoc) {
      await fetchSlots(selectedDoc.doctorId, date);
      setStatusText(`Select a time slot for ${selectedDoc.name}`);
    }
  };

  // ── Mic toggle ──
  const toggleMic = () => {
    if (phase === "listening") {
      stopListening();
    } else {
      setTranscript("");
      startListening();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => { stopListening(); };
  }, [stopListening]);

  const formatDisplayDate = (d: string) => {
    if (!d) return "";
    const date = new Date(d + "T00:00:00");
    return date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short", year: "numeric" });
  };

  const today = new Date().toISOString().split("T")[0];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)" }}
    >
      {/* Close button */}
      <button
        onClick={() => { stopListening(); onClose(); }}
        className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-colors z-10"
      >
        <X size={20} className="text-white" />
      </button>

      {/* Title */}
      <div className="absolute top-8 left-8 z-10">
        <h2 className="text-white text-xl font-black tracking-tight">Voice Assistant</h2>
        <p className="text-slate-400 text-sm font-medium mt-0.5">AI-powered appointment booking</p>
      </div>

      {/* ── Center Orb Area ── */}
      <div className="relative flex flex-col items-center gap-8">
        {/* Animated rings */}
        {(phase === "listening" || phase === "processing" || phase === "booking") && (
          <>
            <div className="absolute w-48 h-48 rounded-full border border-teal-500/20 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute w-64 h-64 rounded-full border border-teal-500/10 animate-ping" style={{ animationDuration: "3s" }} />
            <div className="absolute w-80 h-80 rounded-full border border-teal-500/5 animate-ping" style={{ animationDuration: "4s" }} />
          </>
        )}

        {/* Orb / Mic button */}
        {phase !== "success" && (
          <motion.button
            onClick={toggleMic}
            whileTap={{ scale: 0.95 }}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-500 shadow-2xl ${
              phase === "listening"
                ? "bg-gradient-to-br from-teal-400 to-emerald-500 shadow-teal-500/40"
                : phase === "processing" || phase === "booking"
                ? "bg-gradient-to-br from-amber-400 to-orange-500 shadow-amber-500/40 cursor-wait"
                : phase === "error"
                ? "bg-gradient-to-br from-red-400 to-rose-500 shadow-red-500/40"
                : "bg-gradient-to-br from-slate-600 to-slate-700 shadow-slate-500/20 hover:from-teal-500 hover:to-emerald-600"
            }`}
            disabled={phase === "processing" || phase === "booking"}
          >
            {phase === "processing" || phase === "booking" ? (
              <Loader2 size={36} className="text-white animate-spin" />
            ) : phase === "listening" ? (
              <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>
                <Mic size={36} className="text-white" />
              </motion.div>
            ) : phase === "error" ? (
              <AlertCircle size={36} className="text-white" />
            ) : (
              <MicOff size={36} className="text-white/80" />
            )}
          </motion.button>
        )}

        {/* Success state */}
        {phase === "success" && bookedAppt && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/10 max-w-sm w-full text-center"
          >
            <div className="w-20 h-20 bg-teal-500/20 rounded-full flex items-center justify-center mx-auto mb-5">
              <CheckCircle2 size={40} className="text-teal-400" />
            </div>
            <h3 className="text-white text-xl font-black mb-2">Appointment Booked!</h3>
            <div className="space-y-2 text-sm mb-6">
              <p className="text-slate-300"><Stethoscope size={14} className="inline mr-2 text-teal-400" />{bookedAppt.doctorName}</p>
              <p className="text-slate-300"><Building2 size={14} className="inline mr-2 text-teal-400" />{bookedAppt.hospital}</p>
              <p className="text-slate-300"><Calendar size={14} className="inline mr-2 text-teal-400" />{formatDisplayDate(bookedAppt.date)}</p>
              <p className="text-slate-300"><Clock size={14} className="inline mr-2 text-teal-400" />{bookedAppt.timeSlot}</p>
            </div>
            <button
              onClick={() => { stopListening(); onClose(); }}
              className="w-full py-3 bg-teal-500 hover:bg-teal-600 text-white font-bold rounded-2xl transition-colors"
            >
              Done
            </button>
          </motion.div>
        )}

        {/* Status text */}
        <p className={`text-sm font-bold max-w-md text-center px-4 ${
          phase === "error" ? "text-red-400" : "text-slate-400"
        }`}>
          {phase === "error" ? errorMsg : statusText}
        </p>

        {/* Live transcript */}
        {transcript && phase !== "success" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/5 backdrop-blur rounded-2xl px-6 py-3 max-w-lg border border-white/10"
          >
            <p className="text-white/80 text-sm font-medium text-center italic">&ldquo;{transcript}&rdquo;</p>
          </motion.div>
        )}

        {/* Confirmation prompt */}
        {phase === "awaiting_confirmation" && confirmMsg && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white/10 backdrop-blur-xl rounded-3xl p-6 max-w-sm w-full border border-white/10 space-y-4"
          >
            <p className="text-white text-sm font-semibold text-center">{confirmMsg}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setPhase("idle"); setConfirmMsg(""); setStatusText("Cancelled."); }}
                className="flex-1 py-3 rounded-2xl border border-white/20 text-white font-bold hover:bg-white/10 transition-colors text-sm"
              >
                No
              </button>
              <button
                onClick={handleConfirmYes}
                className="flex-1 py-3 rounded-2xl bg-teal-500 text-white font-bold hover:bg-teal-600 transition-colors text-sm"
              >
                Yes, Book
              </button>
            </div>
            <p className="text-slate-500 text-[11px] text-center font-medium">Or say &ldquo;Yes&rdquo; / &ldquo;No&rdquo;</p>
          </motion.div>
        )}
      </div>

      {/* ── Manual Input Area (bottom) ── */}
      {phase === "awaiting_input" && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute bottom-0 left-0 right-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/10 px-6 py-6 max-h-[55vh] overflow-y-auto"
        >
          <div className="max-w-lg mx-auto space-y-5">
            {/* Doctor cards */}
            {doctors.length > 0 && (
              <div className="space-y-2">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Select a Doctor</p>
                <div className="grid gap-2 max-h-48 overflow-y-auto">
                  {doctors.map((doc) => (
                    <button
                      key={doc.doctorId}
                      onClick={() => onSelectDoctor(doc)}
                      className={`w-full text-left px-4 py-3 rounded-2xl border transition-all ${
                        selectedDoc?.doctorId === doc.doctorId
                          ? "border-teal-500 bg-teal-500/10"
                          : "border-white/10 bg-white/5 hover:border-teal-500/50"
                      }`}
                    >
                      <p className="font-bold text-white text-sm">{doc.name}</p>
                      <p className="text-xs text-slate-400">{doc.specialization} · {doc.hospital}{doc.experience ? ` · ${doc.experience}yrs` : ""}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Date picker */}
            {selectedDoc && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Select Date</p>
                <input
                  type="date"
                  value={selectedDate}
                  min={today}
                  onChange={(e) => onDateChange(e.target.value)}
                  className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-2xl text-white text-sm font-medium outline-none focus:border-teal-500 transition-colors"
                />
              </div>
            )}

            {/* Time slots */}
            {selectedDoc && selectedDate && (
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Available Slots</p>
                {slotsLoading ? (
                  <div className="flex items-center gap-2 text-slate-500 text-sm py-3">
                    <Loader2 size={14} className="animate-spin" /> Loading slots...
                  </div>
                ) : availableSlots.length === 0 ? (
                  <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 font-medium">
                    No slots available — doctor may be on leave or fully booked.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        onClick={() => onSelectSlot(slot)}
                        className={`px-3 py-2.5 rounded-xl border text-xs font-bold transition-all ${
                          selectedSlot === slot
                            ? "border-teal-500 bg-teal-500/20 text-teal-400"
                            : "border-white/10 text-slate-300 hover:border-teal-500/50"
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* Retry button on error */}
      {phase === "error" && (
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          onClick={() => { setPhase("idle"); setErrorMsg(""); setStatusText("Tap the mic to start"); }}
          className="mt-4 px-6 py-2.5 bg-white/10 hover:bg-white/20 rounded-2xl text-white text-sm font-bold transition-colors"
        >
          Try Again
        </motion.button>
      )}

      {/* Hint bar */}
      {(phase === "idle" || phase === "listening") && (
        <div className="absolute bottom-8 left-0 right-0 px-6">
          <div className="max-w-lg mx-auto bg-white/5 backdrop-blur rounded-2xl px-5 py-3 border border-white/10">
            <p className="text-[11px] text-slate-500 font-semibold text-center leading-relaxed">
              Try: &ldquo;Book appointment with Dr Sairoop&rdquo; · &ldquo;Who are the cardiologists?&rdquo; · &ldquo;Check if Dr Sanjay is available tomorrow at 5 PM&rdquo;
            </p>
          </div>
        </div>
      )}
    </motion.div>
  );
}
