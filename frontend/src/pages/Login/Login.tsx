import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import { Lock, Mail } from "lucide-react";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    try {
      const res = await api.post("/auth/login", { email, password });
      login(res.data.token, res.data.user);
      navigate("/dashboard");
    } catch (err) {
      alert("Invalid credentials. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Side: Visual Panel (Industry Standard) */}
      <div className="hidden lg:flex w-1/2 bg-blue-600 justify-center items-center p-12 relative overflow-hidden">
        <div className="relative z-10 text-white max-w-md">
          <h1 className="text-5xl font-extrabold mb-6 tracking-tight">WorkSync HR</h1>
          <p className="text-blue-100 text-lg leading-relaxed">
            The all-in-one platform for attendance, leave management, and employee performance tracking.
          </p>
        </div>
        {/* Decorative Circles */}
        <div className="absolute top-0 left-0 w-64 h-64 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-30 -translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20 translate-x-1/4 translate-y-1/4"></div>
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