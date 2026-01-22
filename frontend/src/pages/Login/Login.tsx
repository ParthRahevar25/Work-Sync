import api from "../../api/axios";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: any) => {
    e.preventDefault();

    const email = e.target.email.value;
    const password = e.target.password.value;

    const res = await api.post("/auth/login", { email, password });

    login(res.data.token, res.data.user);
    navigate("/dashboard");
  };

  return (
    <div className="h-screen flex items-center justify-center bg-gray-100">
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded w-96 shadow">
        <h2 className="text-xl font-bold mb-4">Admin Login</h2>

        <input name="email" placeholder="Email" className="input" />
        <input name="password" type="password" placeholder="Password" className="input mt-2" />

        <button className="mt-4 bg-blue-600 text-white w-full py-2 rounded">
          Login
        </button>
      </form>
    </div>
  );
}
