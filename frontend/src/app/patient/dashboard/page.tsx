"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { UserRound, Calendar as CalendarIcon, CreditCard, FileText, Pill, Settings, LogOut, Search, Bell, Mail, Eye, Edit2, Trash2, Activity, CheckCircle2, X, QrCode, MapPin, Building2, User, Clock, AlertCircle, Smartphone, Landmark, Wallet } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_BILLS = [
  { date: "10/25/2026", amount: "₹120.00", status: "Paid", desc: "Consultation - Dr. Jenkins" },
  { date: "09/14/2026", amount: "₹45.00",  status: "Paid", desc: "Lab Report - CBC" },
  { date: "08/02/2026", amount: "₹210.00", status: "Pending", desc: "X-Ray Imaging" }
];

const MOCK_MEDS = [
  { name: "Amoxicillin 500mg", dose: "1 pill every 8 hours", condition: "Infection" },
  { name: "Vitamin D3 2000IU", dose: "1 capsule daily", condition: "Deficiency" },
  { name: "Paracetamol 650mg", dose: "As needed (max 4/day)", condition: "Pain relief" }
];

const MOCK_APPTS = [
  { type: "Urgent",      date: "11/02/2026", provider: "Dr. Aditi Verma", status: "Scheduled" },
  { type: "Follow-Up",  date: "10/25/2026", provider: "Dr. Neha Reddy",   status: "Completed" },
  { type: "Follow-Up",  date: "09/12/2026", provider: "Dr. Manoj Pillai",     status: "Completed" },
  { type: "Chronic Care",date: "08/07/2026", provider: "Dr. Pooja Bose",   status: "Completed" }
];

const CITY_DATA: Record<string, { hospitals: string[]; doctors: string[]; slots: {label: string; day: number}[] }> = {
  "Mumbai": {
    hospitals: ["Lilavati Hospital", "Hinduja Hospital", "Kokilaben Hospital", "Breach Candy"],
    doctors: ["Dr. Aditi Verma (Cardiology)", "Dr. Sameer Deshmukh (General)", "Dr. Rohan Malhotra (Orthopedics)", "Dr. Priya Iyer (Radiology)", "Dr. Arjun Kapoor (Neurology)"],
    slots: [{label:"09:00 AM - Nov 2",day:2},{label:"11:30 AM - Nov 2",day:2},{label:"03:00 PM - Nov 5",day:5}]
  },
  "Delhi": {
    hospitals: ["AIIMS Delhi", "Fortis Hospital", "Apollo Delhi", "Max Healthcare"],
    doctors: ["Dr. Neha Reddy (Pediatrics)", "Dr. Vikram Singh (Internal)", "Dr. Kavita Joshi (Gynecology)", "Dr. Rahul Saxena (Cardiology)", "Dr. Swati Kulkarni (ENT)"],
    slots: [{label:"10:00 AM - Nov 3",day:3},{label:"02:00 PM - Nov 4",day:4}]
  },
  "Bengaluru": {
    hospitals: ["Manipal Hospital", "Aster CMI", "Fortis Bengaluru", "Narayana Health"],
    doctors: ["Dr. Manoj Pillai (General)", "Dr. Anjali Nair (Pediatrics)", "Dr. Suresh Menon (Orthopedics)", "Dr. Divya Agarwal (Endocrinology)", "Dr. Manish Pandey (Ophthalmology)"],
    slots: [{label:"09:00 AM - Nov 10",day:10},{label:"12:00 PM - Nov 11",day:11}]
  },
  "Chennai": {
    hospitals: ["Apollo Chennai", "Fortis Malar", "MIOT International", "Global Hospital"],
    doctors: ["Dr. Pooja Bose (Oncology)", "Dr. Nitin Gadgil (Gastro)", "Dr. Ritu Sharma (Dermatology)", "Dr. Sandeep Rao (Urology)", "Dr. Isha Bhatt (Psychiatry)"],
    slots: [{label:"08:30 AM - Nov 6",day:6},{label:"01:00 PM - Nov 7",day:7}]
  },
  "Hyderabad": {
    hospitals: ["Apollo Hyderabad", "Yashoda Hospital", "CARE Hospitals", "KIMS"],
    doctors: ["Dr. Vishal Deshpande (Neurosurgery)", "Dr. Sunita Hegde (Pulmonary)", "Dr. Karthik Subramanian (Cardiac)", "Dr. Lakshmi Narayanan (Nephrology)", "Dr. Pradeep Chawla (General)"],
    slots: [{label:"09:00 AM - Nov 12",day:12},{label:"02:00 PM - Nov 13",day:13}]
  },
  "Kolkata": {
    hospitals: ["AMRI Hospital", "Apollo Gleneagles", "Fortis Kolkata", "Woodlands"],
    doctors: ["Dr. Meghna Sen (Rheumatology)", "Dr. Ravi Teja (Orthopedics)", "Dr. Shruti Iyer (Obstetrics)", "Dr. Akshay Patil (General Surgery)", "Dr. Sneha Rao (General Medicine)"],
    slots: [{label:"10:00 AM - Nov 14",day:14},{label:"03:00 PM - Nov 15",day:15}]
  },
  "Pune": {
    hospitals: ["Ruby Hall Clinic", "Jehangir Hospital", "Sahyadri Hospital", "Inlaks & Budhrani"],
    doctors: ["Dr. Harish Kumar (Cardiology)", "Dr. Jyoti Malhotra (Pathology)", "Dr. Varun Khanna (Pediatrics)", "Dr. Tanya Singhal (ENT)", "Dr. Abhishek Mehra (General)"],
    slots: [{label:"11:00 AM - Nov 16",day:16},{label:"04:00 PM - Nov 17",day:17}]
  },
  "Ahmedabad": {
    hospitals: ["Zydus Hospital", "Shalby Hospital", "Sterling Hospital", "HCG Hospital"],
    doctors: ["Dr. Karishma Shah (Dermatology)", "Dr. Sanjay Mehta (Cardiology)", "Dr. Rajeshwari Patel (Gynecology)", "Dr. Devang Jani (Orthopedics)", "Dr. Bhavesh Joshi (General)"],
    slots: [{label:"09:30 AM - Nov 18",day:18},{label:"01:30 PM - Nov 19",day:19}]
  }
};

export default function PatientDashboard() {
  const router = useRouter();
  const [activeTab, setActiveTab]           = useState("Profile");
  const [profile,   setProfile]             = useState<any>({ name:"Loading...", id:"...", bloodGroup:"-", age:"-", gender:"-", email:"...", contactNumber:"-", address: "...", emergencyContactName: "...", emergencyContactPhone: "..." });
  const [timeline,  setTimeline]            = useState<any[]>([]);
  const [messages,  setMessages]            = useState<any[]>([]);
  const [showMessages, setShowMessages]     = useState(false);

  // Modals
  const [showSettings,  setShowSettings]    = useState(false);
  const [showAppt,      setShowAppt]        = useState(false);
  const [showCalendar,  setShowCalendar]    = useState(false);
  const [showRecord,    setShowRecord]      = useState<any>(null);
  const [apptStep,      setApptStep]        = useState(1);
  const [payBill,       setPayBill]         = useState<any>(null);
  const [payStep,       setPayStep]         = useState(1);
  const [payMethod,     setPayMethod]       = useState("");
  const [bills,         setBills]           = useState(MOCK_BILLS);

  // Appointment form (live)
  const [city,          setCity]         = useState("");
  const [hospital,      setHospital]     = useState("");
  const [doctor,        setDoctor]       = useState("");
  const [slot,          setSlot]         = useState<{label:string;day:number}|null>(null);
  const [scheduled,     setScheduled]    = useState<number[]>([]);
  const [liveDoctors,   setLiveDoctors]  = useState<any[]>([]);
  const [selectedDoc,   setSelectedDoc]  = useState<any>(null);
  const [apptDate,      setApptDate]     = useState("");
  const [availableSlots,setAvailableSlots] = useState<string[]>([]);
  const [selectedSlot,  setSelectedSlot] = useState("");
  const [bookingLoading,setBookingLoading] = useState(false);
  const [bookingError,  setBookingError] = useState("");
  const [slotLoading,   setSlotLoading]  = useState(false);

  // Edit profile
  const [editName,  setEditName]  = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editEmergencyName, setEditEmergencyName] = useState("");
  const [editEmergencyPhone, setEditEmergencyPhone] = useState("");

  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (!userStr) { router.push("/login"); return; }
    const user = JSON.parse(userStr);
    const patientId = user.id || user.patientId;
    setEditName(user.name || "");
    fetch(`http://localhost:5000/api/patients/${patientId}/dashboard`)
      .then(r => r.json())
      .then(data => {
        if (data.profile) {
          setProfile({ ...data.profile, id: data.profile.patientId });
          setEditName(data.profile.name);
          setEditPhone(data.profile.contactNumber || "");
          setEditEmail(data.profile.email || "");
          setEditAddress(data.profile.address || "");
          setEditEmergencyName(data.profile.emergencyContactName || "");
          setEditEmergencyPhone(data.profile.emergencyContactPhone || "");
        }
        setTimeline(data.timeline?.length ? data.timeline : []);

        // Load appointments into schedule
        if (data.appointments?.length) {
          setScheduled(data.appointments.map((a:any) => new Date(a.date).getDate()));
        }
        
        // Generate notifications from real data
        const newMsgs: any[] = [];
        if (data.appointments?.length) {
          data.appointments.slice(0,2).forEach((a:any, i:number) => {
            newMsgs.push({ id:`ap-${i}`, type:"appointment", text:`Reminder: Appointment with ${a.doctorName} on ${a.date} at ${a.timeSlot}`, date: a.date, isNew: true });
          });
        }
        if (data.timeline?.length) {
          data.timeline.slice(0,2).forEach((t:any, i:number) => {
            if (t.type === 'prescription') newMsgs.push({ id:`pr-${i}`, type:'prescription', text:`New Prescription: ${t.title}`, date: t.date?.slice(0,10), isNew: false });
          });
        }
        newMsgs.push({ id:"bill1", type:"bill", text:"New Bill: Consultation (₹120.00) is due.", date:"Oct 25", isNew: newMsgs.length < 2 });
        setMessages(newMsgs);
      })
      .catch(() => {
        setProfile({ name:user.name||"Patient", id:patientId, email:user.email, bloodGroup:"N/A", age:"N/A", gender:"N/A", contactNumber:"N/A", address: "N/A", emergencyContactName: "N/A", emergencyContactPhone: "N/A" });
        setEditName(user.name||"");
        setEditEmail(user.email||"");
        setMessages([
          { id: 1, type: "appointment", text: "Reminder: Your upcoming appointment.", date: "Oct 31", isNew: true },
          { id: 2, type: "bill", text: "New Bill: Consultation (₹120.00) is due.", date: "Oct 25", isNew: true }
        ]);
      });

    // Fetch doctors for booking
    fetch("http://localhost:5000/api/doctor/all")
      .then(r => r.json())
      .then(data => { if (Array.isArray(data)) setLiveDoctors(data); })
      .catch(() => {});
  }, [router]);

  const handleLogout = () => { localStorage.removeItem("user"); router.push("/login"); };

  const cityOptions = [...new Set(liveDoctors.map((d: any) => d.hospital).filter(Boolean))];

  const openAppt = () => {
    setApptStep(1); setCity(""); setHospital(""); setDoctor(""); setSlot(null);
    setSelectedDoc(null); setApptDate(""); setAvailableSlots([]); setSelectedSlot("");
    setBookingError("");
    setShowAppt(true);
  };

  const fetchSlots = async (docId: string, date: string) => {
    if (!docId || !date) return;
    setSlotLoading(true);
    try {
      const res = await fetch(`http://localhost:5000/api/doctor/slots?doctorId=${docId}&date=${date}`);
      const data = await res.json();
      setAvailableSlots(data.blocked ? [] : (data.slots || []));
    } catch { setAvailableSlots([]); }
    finally { setSlotLoading(false); }
  };

  const confirmAppt = async () => {
    if (!selectedDoc || !apptDate || !selectedSlot) return;
    const userStr = localStorage.getItem("user");
    if (!userStr) return;
    const user = JSON.parse(userStr);
    setBookingLoading(true); setBookingError("");
    try {
      const res = await fetch("http://localhost:5000/api/doctor/book", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          patientId:   user.id,
          patientName: user.name,
          doctorId:    selectedDoc.doctorId,
          doctorName:  selectedDoc.name,
          hospital:    selectedDoc.hospital,
          date:        apptDate,
          timeSlot:    selectedSlot
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setScheduled(prev => [...prev, new Date(apptDate).getDate()]);
      // Add timeline entry locally immediately
      setTimeline(prev => [{ _id: Date.now(), type:"consultation", title:`Appointment with ${selectedDoc.name}`, description:`${selectedSlot} at ${selectedDoc.hospital} on ${apptDate}.`, date: apptDate }, ...prev]);
      // Add message notification
      setMessages(prev => [{ id: Date.now(), type:"appointment", text:`Appointment booked with ${selectedDoc.name} on ${apptDate} at ${selectedSlot}`, date:"Just Now", isNew:true }, ...prev]);
      setApptStep(2);
    } catch (err: any) { setBookingError(err.message); }
    finally { setBookingLoading(false); }
  };

  const NAV = [
    { name:"Profile",        icon:UserRound },
    { name:"Appointments",   icon:CalendarIcon },
    { name:"Medical Bills",  icon:CreditCard },
    { name:"Medical Records",icon:FileText },
    { name:"Medications",    icon:Pill },
    { name:"Timeline",       icon:Activity },
    { name:"Messages",       icon:Mail }
  ];

  const navBtn = (item: {name:string;icon:any}) => {
    const isNewCount = item.name === "Messages" ? messages.filter(m => m.isNew).length : 0;
    return (
      <button key={item.name} onClick={() => setActiveTab(item.name)}
        className={`w-full flex items-center gap-4 px-4 py-3.5 rounded-2xl transition-all font-semibold text-left
          ${activeTab===item.name ? "bg-teal-50 text-teal-600 shadow-sm" : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"}`}>
        <div className="relative">
          <item.icon size={20} className={activeTab===item.name ? "text-teal-500" : "text-slate-400"} />
          {isNewCount > 0 && <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-orange-500 border-2 border-white rounded-full text-[8px] font-black flex items-center justify-center text-white">{isNewCount}</span>}
        </div>
        <span className="flex-1">{item.name}</span>
      </button>
    );
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden" style={{fontFamily:"'Inter',sans-serif"}}>

      {/* ── Sidebar ── */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0">
        <div className="p-6 flex items-center gap-2 border-b border-slate-100">
          <Activity className="text-teal-500" size={22}/>
          <span className="text-xl font-black text-teal-500 tracking-tight">HealthSphere</span>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
          {NAV.map(navBtn)}
        </nav>
        <div className="p-4 border-t border-slate-100">
          <div className="bg-slate-50 rounded-3xl p-3 border border-slate-100 flex flex-col gap-3">
            <div className="flex items-center gap-3 px-1">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-500 to-emerald-600 flex items-center justify-center text-white text-sm font-black shadow-inner">
                {profile.name?.[0]?.toUpperCase() || "P"}
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

      {/* ── Main ── */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden">

        {/* Topbar */}
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
                <Mail size={18}/><span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-orange-400 border-2 border-white rounded-full text-[8px] font-bold flex items-center justify-center text-white">{messages.filter(m => m.isNew).length}</span>
              </button>
              
              <AnimatePresence>
                {showMessages && (
                  <motion.div initial={{opacity:0, y:10}} animate={{opacity:1, y:0}} exit={{opacity:0, y:10}}
                    className="absolute right-0 mt-3 w-80 bg-white rounded-3xl shadow-2xl border border-slate-100 p-4 z-50">
                    <div className="flex items-center justify-between mb-4 px-2">
                      <h4 className="font-bold text-slate-800">Messages & Notifications</h4>
                      <button onClick={() => setMessages(messages.map(m => ({...m, isNew: false})))} className="text-[10px] font-bold text-teal-600 uppercase tracking-widest">Mark All Read</button>
                    </div>
                    <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                      {messages.map(m => (
                        <div key={m.id} className={`p-3 rounded-2xl border transition-all ${m.isNew ? "bg-teal-50/50 border-teal-100" : "bg-slate-50 border-slate-100"}`}>
                          <div className="flex items-start gap-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                              m.type === "appointment" ? "bg-teal-100 text-teal-600" :
                              m.type === "bill" ? "bg-orange-100 text-orange-600" :
                              m.type === "bill_paid" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
                            }`}>
                              {m.type === "appointment" ? <CalendarIcon size={14}/> : m.type === "bill" ? <CreditCard size={14}/> : m.type === "bill_paid" ? <CheckCircle2 size={14}/> : <Pill size={14}/>}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-xs font-semibold text-slate-800 leading-normal">{m.text}</p>
                              <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">{m.date}</span>
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
            <button onClick={() => setShowSettings(true)} className="w-10 h-10 rounded-full bg-gradient-to-br from-teal-400 to-emerald-600 border-2 border-white shadow-sm ml-1 flex items-center justify-center text-white font-bold text-sm hover:scale-110 transition-transform">
              {profile.name?.[0]?.toUpperCase() || "P"}
            </button>
          </div>
        </header>

        {/* Scrollable page */}
        <div className="flex-1 overflow-y-auto px-8 py-8">
          <h2 className="text-3xl font-black text-slate-800 mb-8 tracking-tight">{activeTab}</h2>

          {/* ═══════════ PROFILE TAB ═══════════ */}
          {activeTab === "Profile" && (
            <div className="space-y-8 max-w-[1400px]">
              <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Profile Card */}
                <div className="xl:col-span-5 bg-white rounded-3xl p-8 border border-slate-100 shadow-sm flex flex-col sm:flex-row items-center sm:items-start gap-8">
                  <div className="relative shrink-0">
                    <div className="w-32 h-32 rounded-full bg-gradient-to-br from-teal-50 to-teal-100 border-4 border-white shadow-lg flex items-center justify-center">
                      <UserRound size={54} className="text-teal-300"/>
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
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 text-sm mt-4">
                      <div className="col-span-2"><span className="text-slate-500">Residential Address</span><p className="font-semibold text-slate-800">{profile.address || "Not provided"}</p></div>
                      <div><span className="text-slate-500">Emergency Contact</span><p className="font-semibold text-slate-800">{profile.emergencyContactName || "N/A"}</p></div>
                      <div><span className="text-slate-500">Emergency Phone</span><p className="font-semibold text-teal-600">{profile.emergencyContactPhone || "N/A"}</p></div>
                    </div>
                    <div className="pt-4 border-t border-slate-100 grid grid-cols-2 gap-3 text-sm">
                      <div><span className="text-teal-500 font-bold">Chart ID: </span><span className="text-slate-700 font-semibold">{profile.id}</span></div>
                      <div><span className="text-teal-500 font-bold">Blood Group: </span><span className="text-slate-700 font-semibold">{profile.bloodGroup}</span></div>
                    </div>
                  </div>
                </div>

                {/* QR + Appointments mini split */}
                <div className="xl:col-span-7 flex flex-col gap-8">
                  {/* QR Code */}
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

                  {/* Appointments preview */}
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
                        {timeline.filter(t => t.type==='consultation').slice(0,3).map((a,i)=>(
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                            <td className="py-3">Visit</td><td className="py-3">{a.date?.slice(0,10)}</td><td className="py-3 truncate max-w-[130px]">{a.title?.replace('Appointment with ','')}</td>
                            <td className="py-3"><span className="px-2 py-0.5 rounded-full text-xs font-bold bg-teal-50 text-teal-600">Scheduled</span></td>
                          </tr>
                        ))}
                        {timeline.filter(t=>t.type==='consultation').length===0 && (
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
                    <button onClick={() => setActiveTab("Medical Records")} className="bg-teal-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">Browse All</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Name</th>
                    </tr></thead>
                    <tbody className="font-semibold text-slate-700">
                        {timeline.slice(0,4).map((r,i)=>(
                          <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50 cursor-pointer" onClick={()=>setShowRecord(r)}>
                            <td className="py-3 text-slate-500 whitespace-nowrap">{r.date?.slice(0,10)}</td>
                            <td className="py-3 truncate max-w-[180px]">{r.title}</td>
                          </tr>
                        ))}
                        {timeline.length===0 && <tr><td colSpan={2} className="py-4 text-center text-slate-400 text-xs">No records yet</td></tr>}
                      </tbody>
                    </table>
                </div>

                {/* Medical Bills */}
                <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-slate-800">Medical Bills</h3>
                    <button onClick={() => setActiveTab("Medical Bills")} className="bg-teal-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">Pay All</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 font-bold">Date</th><th className="pb-3 font-bold">Amount</th><th className="pb-3 font-bold">Status</th>
                    </tr></thead>
                    <tbody className="font-semibold text-slate-700">
                      {MOCK_BILLS.map((b,i)=>(
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="py-3 text-slate-500">{b.date}</td><td className="py-3">{b.amount}</td>
                          <td className="py-3"><span className={`flex items-center gap-1.5 text-xs font-bold ${b.status==="Paid"?"text-teal-500":"text-orange-500"}`}><CheckCircle2 size={13}/>{b.status}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Medications */}
                <div className="bg-white rounded-3xl p-7 border border-slate-100 shadow-sm">
                  <div className="flex items-center justify-between mb-5">
                    <h3 className="text-xl font-bold text-slate-800">Medications</h3>
                    <button onClick={() => setActiveTab("Medications")} className="bg-teal-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">Refill</button>
                  </div>
                  <table className="w-full text-left text-sm">
                    <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b border-slate-100">
                      <th className="pb-3 font-bold">Name</th><th className="pb-3 font-bold">Dose</th>
                    </tr></thead>
                    <tbody className="font-semibold text-slate-700">
                      {MOCK_MEDS.map((m,i)=>(
                        <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                          <td className="py-3 truncate max-w-[140px]">{m.name}</td>
                          <td className="py-3 text-slate-500">{m.dose}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ═══════════ APPOINTMENTS TAB ═══════════ */}
          {activeTab === "Appointments" && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-[1400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">All Appointments</h3>
                <div className="flex gap-3">
                  <button onClick={() => setShowCalendar(true)} className="bg-slate-100 text-slate-700 px-5 py-2 rounded-xl text-sm font-bold hover:bg-slate-200 transition-colors flex items-center gap-2"><CalendarIcon size={16}/> Calendar</button>
                  <button onClick={openAppt} className="bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-teal-600 transition-colors">+ Book New</button>
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b-2 border-slate-100">
                    <th className="pb-4 font-bold px-2">Visit Type</th><th className="pb-4 font-bold px-2">Date</th>
                    <th className="pb-4 font-bold px-2">Provider</th><th className="pb-4 font-bold px-2">Status</th>
                    <th className="pb-4 font-bold px-2 text-center">Actions</th>
                  </tr></thead>
                  <tbody className="text-sm font-semibold text-slate-700">
                    {MOCK_APPTS.map((a,i)=>(
                      <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                        <td className="py-5 px-2">{a.type}</td><td className="py-5 px-2">{a.date}</td>
                        <td className="py-5 px-2">{a.provider}</td>
                        <td className="py-5 px-2"><span className={`px-2 py-1 rounded-full text-xs font-bold ${a.status==="Scheduled"?"bg-teal-50 text-teal-600":"bg-slate-100 text-slate-500"}`}>{a.status}</span></td>
                        <td className="py-5 px-2"><div className="flex items-center justify-center gap-4 text-slate-400">
                          <button className="hover:text-teal-500 transition-colors"><Eye size={16}/></button>
                          <button className="hover:text-teal-500 transition-colors"><Edit2 size={16}/></button>
                          <button className="hover:text-red-500 transition-colors"><Trash2 size={16}/></button>
                        </div></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ═══════════ MEDICAL BILLS TAB ═══════════ */}
          {activeTab === "Medical Bills" && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-[1400px] space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-bold text-slate-800">All Medical Bills</h3>
                <button className="bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-teal-600 transition-colors">Pay All Outstanding</button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                <div className="bg-teal-50 rounded-2xl p-5 border border-teal-100"><p className="text-teal-500 text-sm font-semibold">Total Paid</p><p className="text-3xl font-black text-teal-700 mt-1">₹165.00</p></div>
                <div className="bg-orange-50 rounded-2xl p-5 border border-orange-100"><p className="text-orange-500 text-sm font-semibold">Outstanding</p><p className="text-3xl font-black text-orange-600 mt-1">₹210.00</p></div>
                <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100"><p className="text-slate-500 text-sm font-semibold">Total Bills</p><p className="text-3xl font-black text-slate-700 mt-1">{MOCK_BILLS.length}</p></div>
              </div>
              <table className="w-full text-left text-sm min-w-[500px]">
                <thead><tr className="text-slate-400 text-xs uppercase tracking-wider border-b-2 border-slate-100">
                  <th className="pb-4 font-bold px-2">Date</th><th className="pb-4 font-bold px-2">Description</th>
                  <th className="pb-4 font-bold px-2">Amount</th><th className="pb-4 font-bold px-2">Status</th>
                  <th className="pb-4 font-bold px-2 text-center">Action</th>
                </tr></thead>
                <tbody className="font-semibold text-slate-700">
                  {MOCK_BILLS.map((b,i)=>(
                    <tr key={i} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                      <td className="py-5 px-2 text-slate-500">{b.date}</td>
                      <td className="py-5 px-2">{b.desc}</td>
                      <td className="py-5 px-2">{b.amount}</td>
                      <td className="py-5 px-2"><span className={`px-3 py-1 rounded-full text-xs font-bold ${b.status==="Paid"?"bg-teal-50 text-teal-600":"bg-orange-50 text-orange-600"}`}>{b.status}</span></td>
                      <td className="py-5 px-2 text-center">
                         {b.status==="Pending"
                           ? <button onClick={()=>{setPayBill(b);setPayStep(1);setPayMethod("");}} className="bg-teal-500 text-white px-4 py-1.5 rounded-xl text-xs font-bold hover:bg-teal-600 transition-colors">Pay Now</button>
                           : <span className="text-slate-400 text-xs font-medium">Settled</span>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* ═══════════ MEDICAL RECORDS TAB ═══════════ */}
          {activeTab === "Medical Records" && (
            <div className="space-y-4 max-w-[1400px]">
              {timeline.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center border border-slate-100">
                  <FileText size={48} className="mx-auto text-slate-200 mb-4"/>
                  <p className="text-slate-400 font-semibold">No medical records yet. Records will appear after doctor visits and prescriptions.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {timeline.map((rec,i) => (
                    <div key={i} className="bg-white rounded-2xl p-5 border border-slate-100 shadow-sm hover:shadow-md transition-shadow flex items-start gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        rec.type==="xray"?"bg-blue-100 text-blue-600":
                        rec.type==="prescription"?"bg-purple-100 text-purple-600":
                        rec.type==="lab_report"?"bg-red-100 text-red-600":"bg-teal-100 text-teal-600"
                      }`}>
                        <FileText size={18}/>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="font-bold text-slate-800 text-sm truncate">{rec.title}</h4>
                          <span className={`shrink-0 px-2 py-0.5 rounded-full text-[10px] font-black capitalize ${
                            rec.type==="xray"?"bg-blue-50 text-blue-600":
                            rec.type==="prescription"?"bg-purple-50 text-purple-600":
                            rec.type==="lab_report"?"bg-red-50 text-red-600":"bg-teal-50 text-teal-600"
                          }`}>{rec.type?.replace("_"," ")}</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">{rec.date?.slice(0,10)} {rec.doctorId ? `· Dr (${rec.doctorId})` : ""}</p>
                        <p className="text-xs text-slate-600 mt-1.5 line-clamp-2">{rec.description || rec.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ MEDICATIONS TAB ═══════════ */}
          {activeTab === "Medications" && (
            <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm max-w-[1400px]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-800">Prescribed Medications</h3>
                <button className="bg-teal-500 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-teal-600 transition-colors">+ Request Refill</button>
              </div>
              {timeline.filter(t=>t.type==="prescription").length === 0 ? (
                <div className="text-center py-10">
                  <Pill size={40} className="mx-auto text-slate-200 mb-3"/>
                  <p className="text-slate-400 font-medium text-sm">No prescriptions yet. Your doctor will add them here after your visit.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {timeline.filter(t=>t.type==="prescription").map((rx,i)=>(
                    <div key={`rx-${i}`} className="border border-purple-100 rounded-2xl p-6 hover:border-purple-200 hover:bg-purple-50/30 transition-all">
                      <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center mb-4"><Pill size={18} className="text-purple-600"/></div>
                      <h4 className="font-bold text-slate-800 text-lg mb-1">{rx.title}</h4>
                      <p className="text-slate-500 text-sm mb-2">{rx.description || rx.notes}</p>
                      <p className="text-slate-400 text-xs">{rx.date?.slice(0,10)}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ═══════════ TIMELINE TAB ═══════════ */}
          {activeTab === "Timeline" && (
            <div className="max-w-2xl mx-auto">
              <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm mb-4">
                <h3 className="text-xl font-bold text-slate-800 mb-1">My Health Timeline</h3>
                <p className="text-slate-400 text-sm">A chronological summary of all your medical events.</p>
              </div>
              {timeline.length === 0 ? (
                <div className="bg-white rounded-3xl p-14 text-center border border-slate-100">
                  <Activity size={48} className="mx-auto text-slate-200 mb-4"/>
                  <p className="text-slate-400 font-semibold">No health events recorded yet.</p>
                  <p className="text-slate-400 text-sm mt-1">Book an appointment or visit your doctor to get started.</p>
                </div>
              ) : (
                <div className="relative pl-10">
                  {/* Vertical line */}
                  <div className="absolute left-[19px] top-0 bottom-0 w-0.5 bg-gradient-to-b from-teal-200 via-slate-200 to-slate-100"/>
                  <div className="space-y-4">
                    {timeline.map((r: any, i: number) => {
                      const typeColors: Record<string,string> = {
                        consultation:  "bg-teal-500",
                        prescription:  "bg-purple-500",
                        lab_report:    "bg-red-500",
                        xray:          "bg-blue-500",
                        vaccination:   "bg-green-500",
                      };
                      const typeLabels: Record<string,string> = {
                        consultation: "Appointment",
                        prescription: "Prescription",
                        lab_report:   "Lab Report",
                        xray:         "X-Ray / Scan",
                        vaccination:  "Vaccination",
                      };
                      const color = typeColors[r.type] || "bg-slate-400";
                      const label = typeLabels[r.type] || r.type;
                      return (
                        <div key={r._id || i} className="flex gap-5 relative group">
                          {/* Dot */}
                          <div className={`w-9 h-9 ${color} rounded-xl flex items-center justify-center shrink-0 -ml-10 relative z-10 shadow-md`}>
                            {r.type === "prescription" ? <Pill size={16} className="text-white"/> :
                             r.type === "xray"         ? <Eye size={16} className="text-white"/> :
                             r.type === "lab_report"   ? <FileText size={16} className="text-white"/> :
                             r.type === "vaccination"  ? <CheckCircle2 size={16} className="text-white"/> :
                             <CalendarIcon size={16} className="text-white"/>}
                          </div>
                          {/* Card */}
                          <div className="flex-1 bg-white rounded-2xl border border-slate-100 p-5 shadow-sm hover:shadow-md hover:border-teal-100 transition-all group-hover:-translate-y-0.5">
                            <div className="flex items-start justify-between gap-2 mb-1">
                              <p className="font-bold text-slate-800">{r.title}</p>
                              <span className={`shrink-0 px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${color.replace("bg-","bg-").replace("500","100")} ${color.replace("bg-","text-")}`}>
                                {label}
                              </span>
                            </div>
                            <p className="text-xs text-slate-400 font-medium mb-2">
                              {new Date(r.date).toLocaleDateString("en-IN", { day:"numeric", month:"long", year:"numeric" })}
                              {r.doctorId && ` · Doctor ID: ${r.doctorId}`}
                            </p>
                            <p className="text-sm text-slate-600 leading-relaxed">{r.description || r.notes}</p>
                            {/* Image attachments */}
                            {r.attachments?.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {r.attachments.map((url: string, j: number) => (
                                  url.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                    <a key={j} href={url} target="_blank" rel="noreferrer">
                                      <img src={url} alt="attachment" className="h-20 w-28 object-cover rounded-xl border border-slate-200 hover:opacity-80 transition-opacity"/>
                                    </a>
                                  ) : (
                                    <a key={j} href={url} target="_blank" rel="noreferrer"
                                      className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-blue-600 hover:bg-blue-50">
                                      <FileText size={12}/> Download Report
                                    </a>
                                  )
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══════════ MESSAGES TAB ═══════════ */}
          {activeTab === "Messages" && (
            <div className="max-w-[1000px] mx-auto space-y-4">
              <div className="flex items-center justify-between bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                <div>
                  <h3 className="text-xl font-bold text-slate-800">Messages & Inbox</h3>
                  <p className="text-slate-500 text-sm">Manage your specialist communications and medical alerts.</p>
                </div>
                <button onClick={() => setMessages(messages.map(m => ({...m, isNew: false})))} className="bg-teal-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-teal-600 transition-colors">Mark All as Read</button>
              </div>
              <div className="grid gap-3">
                {messages.length > 0 ? messages.map(m => (
                  <div key={m.id} className={`p-5 rounded-3xl border transition-all ${m.isNew ? "bg-white border-teal-200 shadow-xl shadow-teal-500/5 ring-1 ring-teal-50" : "bg-white border-slate-100 opacity-80"}`}>
                    <div className="flex items-start gap-5">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                        m.type === "appointment" ? "bg-teal-100 text-teal-600" :
                        m.type === "bill" ? "bg-orange-100 text-orange-600" :
                        m.type === "bill_paid" ? "bg-green-100 text-green-600" : "bg-purple-100 text-purple-600"
                      }`}>
                        {m.type === "appointment" ? <CalendarIcon size={20}/> : m.type === "bill" ? <CreditCard size={20}/> : m.type === "bill_paid" ? <CheckCircle2 size={20}/> : <Pill size={20}/>}
                      </div>
                      <div className="flex-1 min-w-0 py-1">
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest ${
                            m.type === "appointment" ? "text-teal-500" :
                            m.type === "bill" ? "text-orange-500" :
                            m.type === "bill_paid" ? "text-green-500" : "text-purple-500"
                          }`}>{m.type.replace('_',' ')}</span>
                          <span className="text-xs text-slate-400 font-bold">{m.date}</span>
                        </div>
                        <p className={`text-base font-semibold leading-snug ${m.isNew ? "text-slate-800" : "text-slate-600"}`}>{m.text}</p>
                      </div>
                      {m.isNew && <div className="w-3 h-3 bg-orange-500 rounded-full mt-2 shadow-lg shadow-orange-500/50"></div>}
                    </div>
                  </div>
                )) : (
                  <div className="py-20 text-center bg-white rounded-3xl border border-dashed border-slate-200">
                    <Mail size={48} className="text-slate-200 mx-auto mb-4"/>
                    <p className="text-slate-400 font-bold">No messages yet</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ═══════════ MODALS ═══════════ */}
      <AnimatePresence>

        {/* Settings Modal */}
        {showSettings && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button onClick={()=>setShowSettings(false)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500 transition-colors"><X size={18}/></button>
              <div className="flex items-center gap-3 mb-7">
                <div className="w-12 h-12 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center"><Settings size={24}/></div>
                <h2 className="text-xl font-bold text-slate-800">Edit Profile Settings</h2>
              </div>
              <div className="space-y-4 mb-6 overflow-y-auto max-h-[60vh] pr-2">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
                    <input type="text" value={editName} onChange={e=>setEditName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
                    <input type="email" value={editEmail} onChange={e=>setEditEmail(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50 transition-all"/>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Mobile Number</label>
                    <input type="tel" value={editPhone} onChange={e=>setEditPhone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50 transition-all"/>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Residential Address</label>
                  <textarea value={editAddress} onChange={e=>setEditAddress(e.target.value)} rows={3} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50 transition-all"></textarea>
                </div>
                <div className="border-t border-slate-100 pt-4 mt-4">
                  <p className="text-sm font-bold text-slate-800 mb-3">Emergency Contact Info</p>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Name</label>
                      <input type="text" value={editEmergencyName} onChange={e=>setEditEmergencyName(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50 transition-all"/>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact Phone</label>
                      <input type="tel" value={editEmergencyPhone} onChange={e=>setEditEmergencyPhone(e.target.value)} className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50 transition-all"/>
                    </div>
                  </div>
                </div>
                <p className="text-xs text-slate-400 font-medium">Blood group, age, and medical history are locked and can only be updated by authorized medical staff.</p>
              </div>
              <button onClick={()=>{
                setProfile((p:any)=>({...p,
                  name:editName,
                  contactNumber:editPhone,
                  email:editEmail,
                  address:editAddress,
                  emergencyContactName:editEmergencyName,
                  emergencyContactPhone:editEmergencyPhone
                }));
                const u=JSON.parse(localStorage.getItem("user")||"{}");
                localStorage.setItem("user",JSON.stringify({...u,name:editName, email:editEmail}));
                setShowSettings(false);
              }} className="w-full bg-teal-500 text-white font-bold py-3.5 rounded-xl hover:bg-teal-600 transition-colors shadow-sm">Save Profile Changes</button>
            </motion.div>
          </div>
        )}

        {/* Book Appointment Modal */}
        {showAppt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative max-h-[90vh] overflow-y-auto">
              <button onClick={()=>setShowAppt(false)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500 transition-colors"><X size={18}/></button>

              {apptStep===1 && (
                <div className="space-y-5">
                  <h2 className="text-2xl font-bold text-slate-800">Book Appointment</h2>

                  {/* Doctor Selection */}
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><User size={15}/> Select Doctor</label>
                    {liveDoctors.length === 0 ? (
                      <p className="text-slate-400 text-sm bg-slate-50 p-4 rounded-xl">No doctors registered yet. Ask a doctor to sign up first.</p>
                    ) : (
                      <div className="grid gap-2 max-h-48 overflow-y-auto pr-1">
                        {liveDoctors.map((d: any) => (
                          <button key={d.doctorId} onClick={() => { setSelectedDoc(d); setApptDate(""); setAvailableSlots([]); setSelectedSlot(""); }}
                            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${selectedDoc?.doctorId === d.doctorId ? "border-teal-500 bg-teal-50" : "border-slate-200 hover:border-teal-300 bg-slate-50"}`}>
                            <p className="font-bold text-slate-800 text-sm">{d.name}</p>
                            <p className="text-xs text-slate-500">{d.specialization} · {d.hospital} · {d.experience}yrs exp</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Date picker */}
                  {selectedDoc && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><CalendarIcon size={15}/> Select Date</label>
                      <input type="date" value={apptDate}
                        min={new Date().toISOString().slice(0,10)}
                        onChange={e => { setApptDate(e.target.value); setSelectedSlot(""); fetchSlots(selectedDoc.doctorId, e.target.value); }}
                        className="w-full px-4 py-3 border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/30 focus:border-teal-400 font-medium text-slate-700 bg-slate-50"/>
                    </div>
                  )}

                  {/* Slot picker */}
                  {apptDate && selectedDoc && (
                    <div>
                      <label className="block text-sm font-semibold text-slate-700 mb-2 flex items-center gap-2"><Clock size={15}/> Available Slots</label>
                      {slotLoading ? (
                        <p className="text-slate-400 text-sm text-center py-4">Loading slots...</p>
                      ) : availableSlots.length === 0 ? (
                        <p className="text-red-400 text-sm bg-red-50 p-3 rounded-xl font-medium">
                          No slots available — doctor may be on leave or fully booked.
                        </p>
                      ) : (
                        <div className="grid grid-cols-3 gap-2">
                          {availableSlots.map(s => (
                            <button key={s} onClick={() => setSelectedSlot(s)}
                              className={`px-3 py-2.5 rounded-xl border-2 text-xs font-bold transition-all ${selectedSlot===s ? "border-teal-500 bg-teal-50 text-teal-700" : "border-slate-200 hover:border-teal-300 text-slate-700"}`}>
                              {s}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}

                  {bookingError && <p className="text-red-500 text-sm font-medium">{bookingError}</p>}

                  <button onClick={confirmAppt}
                    disabled={!selectedDoc || !apptDate || !selectedSlot || bookingLoading}
                    className="w-full bg-teal-500 disabled:bg-teal-200 text-white font-bold py-4 rounded-xl hover:bg-teal-600 transition-colors shadow-sm mt-2">
                    {bookingLoading ? "Booking..." : "Confirm Appointment"}
                  </button>
                </div>
              )}

              {apptStep===2 && (
                <div className="text-center py-6">
                  <motion.div initial={{scale:0}} animate={{scale:1}} className="w-20 h-20 bg-teal-100 text-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={40}/>
                  </motion.div>
                  <h2 className="text-2xl font-bold text-slate-800 mb-2">Appointment Confirmed!</h2>
                  <p className="text-slate-500 font-medium px-4 mb-2"><strong>{selectedDoc?.name}</strong> at <strong>{selectedDoc?.hospital}</strong></p>
                  <p className="text-teal-600 font-bold mb-8">{apptDate} · {selectedSlot}</p>
                  <div className="flex gap-3">
                    <button onClick={()=>{setShowAppt(false);setShowCalendar(true);}} className="flex-1 border-2 border-teal-500 text-teal-600 font-bold py-3 rounded-xl hover:bg-teal-50 transition-colors">View Calendar</button>
                    <button onClick={()=>setShowAppt(false)} className="flex-1 bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition-colors">Done</button>
                  </div>
                </div>
              )}
            </motion.div>
          </div>
        )}


        {/* Calendar Modal */}
        {showCalendar && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative">
              <button onClick={()=>setShowCalendar(false)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500"><X size={18}/></button>
              <h2 className="text-2xl font-black text-slate-800 mb-1">November 2026</h2>
              <p className="text-slate-500 text-sm mb-6 font-medium">Your upcoming appointments</p>
              <div className="grid grid-cols-7 gap-1 text-center mb-2">
                {["Su","Mo","Tu","We","Th","Fr","Sa"].map(d=><div key={d} className="text-xs font-bold text-slate-400 py-2">{d}</div>)}
              </div>
              <div className="grid grid-cols-7 gap-1 text-center mb-6">
                {/* Nov 1 2026 = Sunday, offset=0 */}
                {Array.from({length:30},(_,i)=>i+1).map(day=>{
                  const hasAppt=scheduled.includes(day);
                  const isToday=day===24;
                  return (
                    <div key={day} className={`relative flex flex-col items-center justify-center h-10 w-full rounded-xl transition-all cursor-default
                      ${hasAppt?"bg-teal-500 text-white font-black shadow-sm shadow-teal-400/30":isToday?"bg-slate-900 text-white font-bold":"hover:bg-slate-50 text-slate-700 font-semibold"}`}>
                      <span className="text-sm leading-none">{day}</span>
                      {hasAppt && <span className="absolute -bottom-0.5 w-1.5 h-1.5 rounded-full bg-green-300 ring-2 ring-teal-500"></span>}
                    </div>
                  );
                })}
              </div>
              <div className="bg-teal-50 rounded-2xl p-4 border border-teal-100 flex items-center gap-3">
                <AlertCircle size={18} className="text-teal-500 shrink-0"/>
                <p className="text-sm font-medium text-teal-700">You have <span className="font-black">{scheduled.length}</span> appointment(s) this month. Teal dates = appointment days.</p>
              </div>
            </motion.div>
          </div>
        )}

        {/* View Medical Record Modal */}
        {showRecord && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95}} animate={{opacity:1,scale:1}} exit={{opacity:0,scale:0.95}}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative">
              <button onClick={()=>setShowRecord(null)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500"><X size={18}/></button>
              <span className={`text-xs font-bold px-3 py-1 rounded-full capitalize mb-4 inline-block ${
                showRecord.type==="xray"?"bg-blue-50 text-blue-600":
                showRecord.type==="prescription"?"bg-purple-50 text-purple-600":
                "bg-teal-50 text-teal-600"}`}>{showRecord.type.replace("_"," ")}</span>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">{showRecord.title}</h2>
              <p className="text-slate-500 text-sm mb-5">{showRecord.doctor} · {showRecord.date}</p>
              {showRecord.imageUrl && <img src={showRecord.imageUrl} alt="Medical Record" className="w-full h-56 object-cover rounded-2xl mb-5 border border-slate-100"/>}
              {showRecord.notes && <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-700 border border-slate-100">{showRecord.notes}</div>}
            </motion.div>
          </div>
        )}

        {/* ─── Payment Modal ─── */}
        {payBill && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
            <motion.div initial={{opacity:0,scale:0.95,y:20}} animate={{opacity:1,scale:1,y:0}} exit={{opacity:0,scale:0.95}}
              className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-teal-50 rounded-full blur-3xl -z-10 -translate-y-1/2 translate-x-1/2 pointer-events-none"/>
              <button onClick={()=>setPayBill(null)} className="absolute top-4 right-4 bg-slate-100 hover:bg-slate-200 p-2 rounded-full text-slate-500"><X size={18}/></button>

              {payStep===1 && (
                <div className="space-y-6">
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Pay Bill</h2>
                    <p className="text-slate-500 text-sm mt-1">{payBill.desc} · {payBill.date}</p>
                  </div>

                  {/* Amount banner */}
                  <div className="bg-teal-50 border border-teal-100 rounded-2xl px-6 py-4 flex items-center justify-between">
                    <span className="text-teal-600 font-semibold text-sm">Amount Due</span>
                    <span className="text-3xl font-black text-teal-700">{payBill.amount}</span>
                  </div>

                  {/* QR Section */}
                  <div className="border-2 border-dashed border-teal-200 rounded-2xl p-6 flex flex-col items-center gap-3 bg-teal-50/30">
                    <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Scan & Pay via UPI</p>
                    {/* Inline SVG QR pattern */}
                    <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="rounded-xl border border-teal-100 bg-white p-2">
                      <rect x="10" y="10" width="40" height="40" rx="4" fill="#0d9488"/>
                      <rect x="16" y="16" width="28" height="28" rx="2" fill="white"/>
                      <rect x="22" y="22" width="16" height="16" rx="1" fill="#0d9488"/>
                      <rect x="90" y="10" width="40" height="40" rx="4" fill="#0d9488"/>
                      <rect x="96" y="16" width="28" height="28" rx="2" fill="white"/>
                      <rect x="102" y="22" width="16" height="16" rx="1" fill="#0d9488"/>
                      <rect x="10" y="90" width="40" height="40" rx="4" fill="#0d9488"/>
                      <rect x="16" y="96" width="28" height="28" rx="2" fill="white"/>
                      <rect x="22" y="102" width="16" height="16" rx="1" fill="#0d9488"/>
                      {[60,68,76,84,92,100,108].map((x,i)=> x%14===4 ? null : <rect key={i} x={x} y="60" width="6" height="6" fill="#0d9488"/>)}
                      {[10,20,30,50,60,70,80,90,110,120,130].map((y,i)=><rect key={i} x="60" y={y} width="6" height="6" fill={i%3===0?"#0d9488":"transparent"}/>)}
                      {[10,18,26,50,58,66,74,90,98,106,114,122].map((x,i)=><rect key={i} x={x} y="58" width="6" height="6" fill={i%2===0?"#0d9488":"transparent"}/>)}
                    </svg>
                    <p className="text-xs font-bold text-teal-600">healthsphere@upi</p>
                    <p className="text-xs text-slate-400 font-medium">Open any UPI app, scan and pay</p>
                  </div>

                  <p className="text-center text-sm font-semibold text-slate-400">— or choose a payment method —</p>

                  {/* Payment methods */}
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { id:"upi",   label:"UPI / GPay", icon: Smartphone, color:"text-green-600",  bg:"bg-green-50",  border:"border-green-200" },
                      { id:"card",  label:"Credit/Debit",icon: CreditCard,  color:"text-blue-600",  bg:"bg-blue-50",   border:"border-blue-200"  },
                      { id:"net",   label:"Net Banking", icon: Landmark,   color:"text-purple-600",bg:"bg-purple-50", border:"border-purple-200" },
                    ].map(m=>(
                      <button key={m.id} onClick={()=>setPayMethod(m.id)}
                        className={`flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all font-semibold text-sm
                          ${payMethod===m.id ? `${m.border} ${m.bg} ${m.color} shadow-sm` : "border-slate-200 text-slate-600 hover:border-slate-300 bg-slate-50"}`}>
                        <m.icon size={22} className={payMethod===m.id ? m.color : "text-slate-400"}/>
                        <span className="text-xs leading-tight text-center">{m.label}</span>
                      </button>
                    ))}
                  </div>

                  <button onClick={()=>setPayStep(2)} disabled={!payMethod}
                    className="w-full bg-teal-500 disabled:bg-teal-200 text-white font-bold py-4 rounded-xl hover:bg-teal-600 transition-colors shadow-sm">
                    Proceed to Pay {payBill.amount}
                  </button>
                </div>
              )}

              {payStep===2 && (
                <div className="text-center py-4 space-y-6">
                  <motion.div initial={{scale:0}} animate={{scale:1}} transition={{type:"spring",stiffness:200}}
                    className="w-24 h-24 bg-teal-100 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 size={48} className="text-teal-500"/>
                  </motion.div>
                  <div>
                    <h2 className="text-2xl font-bold text-slate-800">Payment Successful!</h2>
                    <p className="text-slate-500 font-medium mt-2">{payBill.desc}</p>
                    <p className="text-3xl font-black text-teal-600 mt-3">{payBill.amount}</p>
                  </div>
                  <div className="bg-slate-50 rounded-2xl p-4 text-left space-y-2 border border-slate-100">
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Transaction ID</span><span className="font-bold text-slate-800">TXN{Date.now().toString().slice(-8)}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Date</span><span className="font-bold text-slate-800">{new Date().toLocaleDateString()}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Method</span><span className="font-bold text-slate-800 capitalize">{payMethod=="upi"?"UPI / GPay":payMethod=="card"?"Credit/Debit Card":"Net Banking"}</span></div>
                    <div className="flex justify-between text-sm"><span className="text-slate-500 font-medium">Status</span><span className="font-bold text-teal-600">✓ Paid</span></div>
                  </div>
                  <button onClick={()=>{
                    setPayBill(null);
                    // Add success message
                    setMessages(prev => [{
                      id: Date.now(),
                      type: "bill_paid",
                      text: `Bill Paid: ${payBill.desc} (${payBill.amount}) was successful.`,
                      date: "Just Now",
                      isNew: true
                    }, ...prev]);
                  }} className="w-full bg-slate-900 text-white font-bold py-4 rounded-xl hover:bg-slate-800 transition-colors">Done</button>
                </div>
              )}
            </motion.div>
          </div>
        )}

      </AnimatePresence>
    </div>
  );
}
