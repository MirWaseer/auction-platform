import { useState } from "react"
import { Link, useNavigate } from "react-router-dom"

function Navbar() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")

  const handleSearch = (e) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/home?search=${encodeURIComponent(searchQuery)}`)
    } else {
      navigate(`/home`)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    localStorage.removeItem("token")
    window.location.href = "/"
  }

  return (
    <nav className="bg-white/90 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          
          {/* LOGO */}
          <Link to="/home" className="shrink-0">
            <h1 className="text-3xl font-extrabold text-stone-900 cursor-pointer hover:scale-105 transition-transform duration-300 tracking-tight">
              Live<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700">Bid</span>
            </h1>
          </Link>

          {/* SEARCH DESKTOP */}
          <div className="hidden md:flex flex-1 max-w-xl mx-4">
            <form onSubmit={handleSearch} className="w-full flex items-center bg-stone-50 rounded-2xl overflow-hidden border border-stone-200 focus-within:border-indigo-500/50 focus-within:ring-2 focus-within:ring-indigo-500/20 transition-all duration-300 shadow-inner">
              <input
                type="text"
                placeholder="Search premium auctions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent px-5 py-2.5 outline-none text-stone-900 placeholder-stone-400"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 transition duration-300 font-bold"
              >
                Search
              </button>
            </form>
          </div>

          {/* DESKTOP NAVIGATION */}
          <div className="hidden lg:flex items-center gap-2">
            <Link to="/home">
              <button className="px-4 py-2 rounded-xl hover:bg-stone-100 transition duration-300 font-medium text-stone-600 hover:text-stone-900">
                Home
              </button>
            </Link>
            <Link to="/dashboard">
              <button className="px-4 py-2 rounded-xl hover:bg-stone-100 transition duration-300 font-medium text-stone-600 hover:text-stone-900">
                Dashboard
              </button>
            </Link>
            <Link to="/create">
              <button className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-5 py-2 rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all duration-300 hover:-translate-y-0.5 ml-2">
                + Sell Product
              </button>
            </Link>
            
            <div className="h-8 w-px bg-stone-200 mx-2"></div>

            {/* PROFILE DESKTOP */}
            <div className="flex items-center gap-3 bg-stone-50 px-3 py-1.5 rounded-xl border border-stone-200 hover:border-stone-300 transition-colors cursor-pointer group relative">
              {user?.avatar ? (
                <img src={user.avatar} alt="Avatar" className="w-9 h-9 rounded-full object-cover border border-stone-200 shadow-sm" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200">
                  {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
              )}
              <div className="hidden xl:block pr-2">
                <h1 className="font-semibold text-sm text-stone-800 leading-tight">
                  {user?.name || "Guest"}
                </h1>
                <p className="text-stone-500 text-xs">
                  {user?.email || "No Email"}
                </p>
              </div>
              {/* Tooltip / Logout dropdown on hover */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-stone-100 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform translate-y-2 group-hover:translate-y-0 overflow-hidden z-50">
                {user?.role === "admin" && (
                  <Link to="/admin" className="block w-full text-left px-4 py-3 text-indigo-600 hover:bg-stone-50 font-bold transition-colors border-b border-stone-100">
                    Admin Portal
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="w-full text-left px-4 py-3 text-red-600 hover:bg-stone-50 font-medium transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>

          {/* MOBILE MENU TOGGLE */}
          <div className="lg:hidden flex items-center gap-4">
            <button 
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-stone-500 hover:text-indigo-600 focus:outline-none p-2"
            >
              <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                {isMobileMenuOpen ? (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* MOBILE MENU EXPANDABLE */}
        <div className={`lg:hidden transition-all duration-300 overflow-hidden ${isMobileMenuOpen ? "max-h-screen opacity-100 mt-4 pb-4" : "max-h-0 opacity-0"}`}>
          
          {/* SEARCH MOBILE */}
          <form onSubmit={handleSearch} className="flex items-center bg-stone-50 rounded-xl overflow-hidden border border-stone-200 mb-4">
            <input
              type="text"
              placeholder="Search premium auctions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent px-4 py-3 outline-none text-stone-900 placeholder-stone-400"
            />
            <button type="submit" className="bg-indigo-600 text-white px-5 py-3 font-bold">
              Go
            </button>
          </form>

          <div className="flex flex-col gap-2">
            <Link to="/home" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-medium border border-transparent hover:border-stone-200 transition-colors">Home</div>
            </Link>
            <Link to="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="px-4 py-3 rounded-xl hover:bg-stone-50 text-stone-700 font-medium border border-transparent hover:border-stone-200 transition-colors">Dashboard</div>
            </Link>
            {user?.role === "admin" && (
              <Link to="/admin" onClick={() => setIsMobileMenuOpen(false)}>
                <div className="px-4 py-3 rounded-xl hover:bg-stone-50 text-indigo-600 font-bold border border-transparent hover:border-stone-200 transition-colors">Admin Portal</div>
              </Link>
            )}
            <Link to="/create" onClick={() => setIsMobileMenuOpen(false)}>
              <div className="px-4 py-3 rounded-xl bg-indigo-50 text-indigo-700 font-bold border border-indigo-100 transition-colors mt-2 text-center">
                + Sell Product
              </div>
            </Link>
            
            <div className="h-px bg-stone-200 my-2"></div>
            
            <div className="flex items-center justify-between px-4 py-2">
              <div className="flex items-center gap-3">
                {user?.avatar ? (
                  <img src={user.avatar} alt="Avatar" className="w-10 h-10 rounded-full object-cover shadow-sm border border-stone-200" />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg border border-indigo-200">
                    {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
                  </div>
                )}
                <div>
                  <h1 className="font-semibold text-stone-800">{user?.name || "Guest"}</h1>
                  <p className="text-stone-500 text-xs">{user?.email || "No Email"}</p>
                </div>
              </div>
              <button 
                onClick={handleLogout}
                className="bg-red-50 text-red-600 px-4 py-2 rounded-lg font-bold border border-red-100"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar