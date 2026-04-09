"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, UserRound, ArrowRight, Eye, EyeOff, Activity } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [formData, setFormData] = useState({
    name: "", email: "", password: "", contactNumber: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const payload = {
        name:          formData.name,
        email:         formData.email,
        password:      formData.password,
        contactNumber: formData.contactNumber,
      };

      const res = await fetch(`http://localhost:5000/api/auth/${role}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Registration failed");

      // Save user to localStorage
      localStorage.setItem("user", JSON.stringify({ ...data, role }));
      localStorage.setItem("isLoggedIn", "true");

      // After registration always redirect to profile setup (first login)
      router.push(`/${role}/setup-profile`);
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
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center p-6 relative overflow-hidden">
      {/* Background blobs */}
      <div className="absolute top-[-15%] right-[-10%] w-[55%] h-[55%] bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-15%] left-[-10%] w-[55%] h-[55%] bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white/5 backdrop-blur-2xl rounded-3xl shadow-2xl border border-white/10 p-8 z-10"
      >
        {/* Logo */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="bg-teal-500 p-2 rounded-xl shadow-lg shadow-teal-500/30">
            <Activity size={20} className="text-white" />
          </div>
          <span className="text-xl font-black text-white tracking-tight">HealthSphere</span>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold text-white">Create Account</h1>
          <p className="text-slate-400 mt-1.5 text-sm">
            You'll complete your profile on the next step.
          </p>
        </div>

        {/* Role Toggle */}
        <div className="flex bg-white/10 p-1.5 rounded-2xl mb-8">
          <button
            type="button"
            onClick={() => setRole("patient")}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              role === "patient"
                ? "bg-teal-500 text-white shadow-lg shadow-teal-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <UserRound size={16} /> Patient
          </button>
          <button
            type="button"
            onClick={() => setRole("doctor")}
            className={`flex items-center justify-center gap-2 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300 ${
              role === "doctor"
                ? "bg-blue-500 text-white shadow-lg shadow-blue-500/30"
                : "text-slate-400 hover:text-white"
            }`}
          >
            <Stethoscope size={16} /> Doctor
          </button>
        </div>

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Full Name *</label>
            <input
              type="text" name="name" required onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 text-white placeholder-slate-500 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Email *</label>
            <input
              type="email" name="email" required onChange={handleChange}
              placeholder="name@email.com"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 text-white placeholder-slate-500 font-medium transition-all"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Password *</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} name="password" required onChange={handleChange}
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 text-white placeholder-slate-500 font-medium transition-all"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-slate-300 mb-1.5">Phone Number *</label>
            <input
              type="tel" name="contactNumber" required onChange={handleChange}
              placeholder="+91 98765 43210"
              className="w-full px-4 py-3 bg-white/10 border border-white/10 rounded-xl outline-none focus:ring-2 focus:ring-teal-400/50 focus:border-teal-400/50 text-white placeholder-slate-500 font-medium transition-all"
            />
          </div>

          {error && (
            <p className="text-red-400 text-sm font-medium text-center bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2.5">
              {error}
            </p>
          )}

          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3.5 rounded-xl transition-all shadow-lg flex justify-center items-center gap-2 mt-2 ${
              role === "patient"
                ? "bg-teal-500 hover:bg-teal-600 text-white shadow-teal-500/30 disabled:bg-teal-800"
                : "bg-blue-500 hover:bg-blue-600 text-white shadow-blue-500/30 disabled:bg-blue-800"
            }`}
          >
            {loading ? "Creating Account..." : "Create Account"} <ArrowRight size={18} />
          </motion.button>
        </form>

        <p className="text-center text-slate-400 font-medium text-sm mt-6">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors font-semibold">
            Sign in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
