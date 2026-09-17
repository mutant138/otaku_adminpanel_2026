import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuthStore from "../store/useAuthStore.js";
import { toast } from "../store/useToastStore.js";
import {
  Shield,
  Lock,
  Mail,
  ArrowRight,
  Eye,
  EyeOff,
  AlertCircle,
} from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, loading, error, isAuthenticated } = useAuthStore();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // If already authenticated, redirect to dashboard
  React.useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error("Please enter both email and password.");
      return;
    }

    const res = await login(email, password);
    if (res.success) {
      toast.success("Welcome back to OtakuDuo Admin!");
      navigate("/dashboard");
    } else {
      toast.error(res.error || "Authentication failed");
    }
  };

  const handleFillDemo = () => {
    setEmail("admin@otakuduo.com");
    setPassword("Admin@123456");
  };

  const handleGoogleLogin = () => {
    toast.info(
      "Google OAuth is configured for admin scaffolding but currently inactive. Please sign in with email & password.",
    );
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center p-4 bg-[#08090f] relative overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo and Header */}
        <div className="text-center mb-8">
          <img
            src="/otakuLogo.jpg"
            alt="OtakuDuo"
            className="w-16 h-16 rounded-2xl object-cover border border-slate-700/80 shadow-2xl shadow-rose-950/60 mb-3.5 mx-auto"
          />
          <h1 className="text-2xl font-bold text-slate-100 tracking-tight">
            OtakuDuo Admin
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Authenticate to access the administrative control portal
          </p>
        </div>

        {/* Card */}
        <div className="glass-panel p-6 sm:p-8 rounded-3xl shadow-2xl border border-slate-800/90">
          {error && (
            <div className="mb-5 p-3 rounded-xl bg-rose-950/50 border border-rose-800/50 flex items-center gap-2.5 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@otakuduo.com"
                  required
                  className="w-full pl-10 pr-4 py-2.5 bg-[#141824] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
              </div>
            </div>

            {/* Password field */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full pl-10 pr-10 py-2.5 bg-[#141824] border border-slate-700/60 rounded-xl text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-rose-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4" />
                  ) : (
                    <Eye className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-2.5 px-4 bg-linear-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-rose-950/40 flex items-center justify-center gap-2 transition-all disabled:opacity-60"
            >
              <span>
                {loading ? "Authenticating..." : "Sign In to Admin Portal"}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-800" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121520] px-3 text-slate-500">
                Or continue with
              </span>
            </div>
          </div>

          {/* Google Auth Button (Inactive scaffolding as requested) */}
          <div className="relative group">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full py-2.5 px-4 bg-[#161a29]/80 border border-slate-700/60 rounded-xl text-sm font-medium text-slate-300 hover:text-slate-100 hover:border-slate-600 flex items-center justify-center gap-2.5 transition-colors cursor-pointer"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#EA4335"
                  d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
                />
                <path
                  fill="#4285F4"
                  d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.2C.7 9.6 0 12.3 0 15.2c0 2.9.7 5.6 1.9 8l3.7-2.9z"
                />
                <path
                  fill="#34A853"
                  d="M12 23.4c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16.3C3.7 20.1 7.5 23.4 12 23.4z"
                />
              </svg>
              <span>Sign in with Google</span>
              <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 bg-slate-800 text-slate-400 border border-slate-700 rounded ml-1">
                Inactive
              </span>
            </button>
          </div>

          {/* Quick Demo Credentials Hint */}
          <div className="mt-6 pt-5 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <div>
              Default:{" "}
              <span className="text-slate-300 font-mono">
                admin@otakuduo.com
              </span>
            </div>
            <button
              type="button"
              onClick={handleFillDemo}
              className="text-rose-400 hover:text-rose-300 font-semibold transition-colors"
            >
              Fill Credentials
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
