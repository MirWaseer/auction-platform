import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import api from "../services/api"

function Login() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    email: "",
    password: "",
  })
  const [isLoading, setIsLoading] = useState(false)

  const handleLogin = async (e) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const res = await api.post("/auth/login", form)
      localStorage.setItem("user", JSON.stringify(res.data.user))
      localStorage.setItem("token", res.data.token)
      navigate("/home")
    } catch (error) {
      alert("Invalid Credentials")
      console.log(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-blue-500 selection:text-white relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-blue-400/20 blur-[100px]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-indigo-400/20 blur-[100px]"></div>
      </div>

      <div className="bg-white/80 backdrop-blur-xl w-full max-w-md rounded-[2.5rem] shadow-2xl border border-white/50 p-10 z-10 relative">
        <div className="text-center mb-10">
          <h1 className="text-5xl font-extrabold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent inline-block mb-2">
            LiveBid
          </h1>
          <p className="text-gray-500 font-medium">
            Welcome back! Please enter your details.
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">
              Email Address
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none px-5 py-4 rounded-2xl transition-all duration-300"
              required
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-gray-700">
                Password
              </label>
              <a href="#" className="text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">Forgot password?</a>
            </div>
            <input
              type="password"
              placeholder="Enter your password"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full bg-gray-50/50 border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none px-5 py-4 rounded-2xl transition-all duration-300"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={isLoading}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-blue-500/30 transition-all duration-300 hover:-translate-y-1 disabled:opacity-70 disabled:hover:translate-y-0 mt-4 flex justify-center items-center h-[60px]"
          >
            {isLoading ? (
              <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <p className="text-center text-gray-500 mt-8 font-medium">
          Don't have an account?
          <Link to="/register" className="text-blue-600 font-bold ml-2 hover:underline decoration-2 underline-offset-4">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  )
}

export default Login