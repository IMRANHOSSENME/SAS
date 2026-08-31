"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Fingerprint, Lock, Mail, ArrowRight, Loader2 } from "lucide-react";
import axios from "axios";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("admin@smartbio.local");
  const [password, setPassword] = useState("12345678");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/login`, {
        email,
        password,
      });
      
      const { accessToken } = response.data;
      
      // Save token in cookie for Next.js middleware
      document.cookie = `smartbio_token=${accessToken}; path=/; max-age=${7 * 24 * 60 * 60}; SameSite=Lax`;
      
      // Redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center relative overflow-hidden">
      {/* Background Decorations */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-600/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-indigo-600/20 blur-[120px]" />
      
      <div className="relative z-10 w-full max-w-md p-8 sm:p-12 mx-4 bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl rounded-3xl">
        <div className="flex flex-col items-center mb-8">
          <div className="p-3 bg-blue-500/20 rounded-2xl mb-4 shadow-[0_0_15px_rgba(59,130,246,0.5)]">
            <Fingerprint className="w-10 h-10 text-blue-400" />
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">SmartBio</h1>
          <p className="text-slate-400 mt-2 text-sm text-center">Admin Portal Secure Login</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-xl text-red-400 text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                placeholder="admin@smartbio.local"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900/50 border border-slate-800 text-white pl-11 pr-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="rounded border-slate-700 bg-slate-900 text-blue-500 focus:ring-blue-500/50 focus:ring-offset-0" />
              <span className="text-slate-400">Remember me</span>
            </label>
            <a href="#" className="text-blue-400 hover:text-blue-300 transition-colors">Forgot password?</a>
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full relative group overflow-hidden bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-3.5 rounded-xl font-medium shadow-[0_0_20px_rgba(79,70,229,0.3)] hover:shadow-[0_0_25px_rgba(79,70,229,0.5)] transition-all disabled:opacity-70 disabled:cursor-not-allowed mt-2"
          >
            <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                <>
                  Sign In
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
