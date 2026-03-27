"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, UserRound, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || "Login failed");
      
      localStorage.setItem("user", JSON.stringify(data));
      if (role === "patient") {
        router.push("/patient/dashboard");
      } else {
        router.push("/doctor/dashboard");
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-200/40 rounded-full blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="max-w-md w-full bg-white/80 backdrop-blur-xl rounded-3xl shadow-2xl shadow-slate-200/50 overflow-hidden border border-white z-10 p-8"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-blue-600 p-3.5 rounded-2xl text-white shadow-xl shadow-blue-600/30">
              <Stethoscope size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">HealthSphere</h1>
          <p className="text-slate-500 mt-2 font-medium">Your Health, Centralized.</p>
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

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
              placeholder="name@example.com"
            />
          </div>
          
          <div className="relative">
            <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
            <div className="relative">
              <input 
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-white/50 focus:bg-white focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none transition-all font-medium placeholder:text-slate-400"
                placeholder="••••••••"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          {error && <p className="text-red-500 text-sm font-medium text-center">{error}</p>}

          <motion.button 
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-semibold py-3.5 rounded-xl transition-all shadow-lg shadow-blue-600/30 mt-2"
          >
            {loading ? "Signing In..." : `Sign In as ${role === "patient" ? "Patient" : "Doctor"}`}
          </motion.button>
        </form>

        <p className="text-center text-slate-500 font-medium text-sm mt-8">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:text-blue-700 transition-colors">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}
