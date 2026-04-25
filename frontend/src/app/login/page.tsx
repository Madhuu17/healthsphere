"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Stethoscope, UserRound, Eye, EyeOff } from "lucide-react";
import { useEffect } from "react";
import { signInWithEmailAndPassword, signInWithPopup, signInWithRedirect, getRedirectResult, GoogleAuthProvider } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function LoginPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [role, setRole] = useState<"patient" | "doctor">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const handleRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth);
        if (result) {
          setLoading(true);
          await processGoogleLoginResult(result);
        }
      } catch (err: any) {
        setError("Sign-in cancelled or failed. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    handleRedirectResult();
  }, []);

  const processGoogleLoginResult = async (result: any) => {
    const storedRole = localStorage.getItem("pendingGoogleRole") || role;
    const payload = {
      name: result.user.displayName || "Google User",
      email: result.user.email,
      password: "google_login_dummy_password", 
      contactNumber: "0000000000",
      role: storedRole,
    };

    // Ensure user exists in backend
    await fetch(`http://localhost:5000/api/auth/${storedRole}/register`, {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: result.user.email, password: "google_login_dummy_password", role: storedRole })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || "Google Login failed");

    localStorage.setItem("user", JSON.stringify({ ...data, role: storedRole }));
    if (result.user.email) localStorage.setItem("userEmail", result.user.email);
    if (data.name) localStorage.setItem("userName", data.name);
    localStorage.setItem("isLoggedIn", "true");
    localStorage.removeItem("pendingGoogleRole");

    if (!data.isProfileCompleted) router.push(`/${storedRole}/setup-profile`);
    else if (storedRole === "patient") router.push("/patient/overview");
    else router.push("/doctor/overview");
  };

  const handleGoogleLogin = async () => {
    setError("");
    setLoading(true);
    localStorage.setItem("pendingGoogleRole", role);
    const provider = new GoogleAuthProvider();
    
    try {
      const result = await signInWithPopup(auth, provider);
      await processGoogleLoginResult(result);
      setLoading(false);
    } catch (err: any) {
      if (
        err.code === "auth/popup-closed-by-user" || 
        err.code === "auth/popup-blocked" || 
        err.message?.includes("Cross-Origin-Opener-Policy")
      ) {
        setError("Popup blocked or closed. Switching to secure redirect...");
        signInWithRedirect(auth, provider);
      } else {
        setError("Sign-in failed. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const res = await fetch("http://localhost:5000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role })
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.message || "Login failed");

      // Save user info (includes isProfileCompleted)
      localStorage.setItem("user", JSON.stringify({ ...data, role }));
      if (email) localStorage.setItem("userEmail", email);
      if (data.name) localStorage.setItem("userName", data.name);
      localStorage.setItem("isLoggedIn", "true");

      // 🔑 First-time login → go to profile setup; else go to dashboard
      if (!data.isProfileCompleted) {
        router.push(`/${role}/setup-profile`);
      } else if (role === "patient") {
        router.push("/patient/overview");
      } else {
        router.push("/doctor/overview");
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
          
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            className="w-full bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 font-semibold py-3.5 rounded-xl transition-all mt-2 flex justify-center items-center gap-2"
          >
            <svg width="18" height="18" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571.001-.001.002-.001.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
            Sign in with Google
          </button>
        </form>

        <p className="text-center text-slate-500 font-medium text-sm mt-8">
          Don't have an account? <Link href="/register" className="text-blue-600 hover:text-blue-700 transition-colors">Register here</Link>
        </p>
      </motion.div>
    </div>
  );
}
