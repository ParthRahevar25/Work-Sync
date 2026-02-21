import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";
import { useState } from "react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      // 🔒 The cookie is set automatically by the browser here
      const res = await api.post("/auth/login", { email, password });
      
      // ✅ We only pass user data now, no token!
      login(res.data.user); 
      
      navigate("/dashboard");
    } catch (err: any) {
      alert(err.response?.data?.error || "Invalid credentials. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
     {/* Left Side: Visual Panel */}
      <div className="hidden lg:flex w-1/2 bg-[#0F172A] justify-center items-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-white max-w-md">
          <div className="h-1 w-12 bg-blue-500 mb-6 rounded-full"></div>
          <h1 className="text-6xl font-black mb-6 tracking-tighter uppercase">
            Work<span className="text-blue-500">Sync</span>
          </h1>
          <p className="text-slate-400 text-lg font-medium leading-relaxed uppercase tracking-widest opacity-70">
            Enterprise Human Resource Management System
          </p>
        </div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-blue-600/10 to-transparent"></div>
        <div className="absolute -bottom-24 -right-24 w-96 h-96 bg-blue-600 rounded-full filter blur-[120px] opacity-20"></div>
      </div>

      {/* Right Side: Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-white">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center lg:text-left">
            <h2 className="text-3xl font-bold text-gray-900">Welcome Back</h2>
            <p className="mt-2 text-gray-500">Please enter your details to sign in</p>
          </div>

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div className="space-y-4">
              {/* Email Field */}
              <div className="relative">
                <label className="text-sm font-semibold text-gray-700 block mb-1">Work Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="email"
                    type="email"
                    required
                    placeholder="user@worksync.com"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div className="relative">
                <div className="flex justify-between mb-1">
                  <label className="text-sm font-semibold text-gray-700">Password</label>
                  <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-500">Forgot?</a>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                  <input
                    name="password"
                    type="password"
                    required
                    placeholder="••••••••"
                    className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <button className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200 transition-all transform active:scale-[0.98]">
              Sign In
            </button>
          </form>

          <p className="text-center text-sm text-gray-400">
            &copy; 2026 WorkSync HR Solutions. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}