"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, UserRound, ArrowRight, Eye, EyeOff } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [formData, setFormData] = useState({
    name: "", email: "", password: "",
    bloodGroup: "", age: "", gender: "", contactNumber: "",
    emergencyName: "", emergencyRelation: "", emergencyNumber: "",
    specialization: "", hospital: "",
    qualification: "", designation: "", experience: ""
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      let payload: any = {
        name: formData.name, email: formData.email, password: formData.password, contactNumber: formData.contactNumber
      };

      if (role === "patient") {
        payload = { ...payload, bloodGroup: formData.bloodGroup, age: Number(formData.age), gender: formData.gender, emergencyContact: { name: formData.emergencyName, relation: formData.emergencyRelation, number: formData.emergencyNumber } };
      } else {
        payload = { ...payload,
          specialization: formData.specialization,
          hospital:       formData.hospital,
          qualification:  formData.qualification,
          designation:    formData.designation,
          experience:     Number(formData.experience),
          age:            Number(formData.age)
        };
      }

      const res = await fetch(`http://localhost:5000/api/auth/${role}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Registration failed");
      
      localStorage.setItem("user", JSON.stringify(data));
      router.push(`/${role}/dashboard`);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-xl w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-white z-10 p-8"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">Create Account</h1>
          <p className="text-slate-500 mt-2 font-medium">Join HealthSphere to manage your health.</p>
        </div>

        <div className="flex bg-slate-100 p-1.5 rounded-2xl mb-8">
          <button 
            type="button"
            onClick={() => setRole("patient")}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${role === "patient" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <UserRound size={16} /> Patient
          </button>
          <button 
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${role === "doctor" ? "bg-white text-blue-600 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            <Stethoscope size={16} /> Doctor
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Full Name</label>
              <input type="text" name="name" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="John Doe" />
            </div>
             <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email</label>
              <input type="email" name="email" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="name@email.com" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="relative">
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? "text" : "password"} 
                  name="password" 
                  required 
                  onChange={handleChange} 
                  className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" 
                  placeholder="••••••••" 
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1.5">Contact</label>
              <input type="tel" name="contactNumber" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="+1234567890" />
            </div>
          </div>

          {role === "patient" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input type="number" name="age" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="35" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Gender</label>
                  <select name="gender" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium">
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Blood Group</label>
                  <select name="bloodGroup" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium">
                    <option value="">Select</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>
              
              <div className="p-5 border-2 border-dashed border-red-200 bg-red-50/50 rounded-2xl space-y-4">
                <h3 className="text-sm font-bold text-red-600 mb-2 flex items-center gap-2">Emergency Contact Details</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Contact Name</label>
                    <input type="text" name="emergencyName" required onChange={handleChange} className="w-full px-4 py-3 border border-red-100 bg-white/80 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium" placeholder="Jane Doe" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Relation</label>
                    <input type="text" name="emergencyRelation" required onChange={handleChange} className="w-full px-4 py-3 border border-red-100 bg-white/80 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium" placeholder="Spouse" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5">Phone Number</label>
                  <input type="tel" name="emergencyNumber" required onChange={handleChange} className="w-full px-4 py-3 border border-red-100 bg-white/80 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-medium" placeholder="+1234567890" />
                </div>
              </div>
            </>
          )}

          {role === "doctor" && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Specialization</label>
                  <input type="text" name="specialization" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="e.g. Cardiology" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Hospital / Clinic</label>
                  <input type="text" name="hospital" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="City General" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Qualification</label>
                  <input type="text" name="qualification" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="e.g. MBBS, MD" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Designation</label>
                  <input type="text" name="designation" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="e.g. Senior Consultant" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Experience (years)</label>
                  <input type="number" name="experience" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="8" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Age</label>
                  <input type="number" name="age" required onChange={handleChange} className="w-full px-4 py-3 border border-slate-200 bg-white/50 focus:bg-white rounded-xl outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium" placeholder="38" />
                </div>
              </div>
            </div>
          )}

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 flex justify-center items-center gap-2 mt-4"
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
          </motion.button>
        </form>

        <p className="text-center text-slate-500 font-medium text-sm mt-8">
          Already have an account? <Link href="/login" className="text-blue-600 hover:text-blue-700 transition-colors">Sign in</Link>
        </p>
      </motion.div>
    </div>
  );
}
