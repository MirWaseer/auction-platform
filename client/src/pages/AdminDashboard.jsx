import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import api from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import toast from "react-hot-toast"

function AdminDashboard() {
  const navigate = useNavigate()
  const user = JSON.parse(localStorage.getItem("user"))

  const [metrics, setMetrics] = useState({ usersCount: 0, activeAuctionsCount: 0, totalRevenue: 0 })
  const [users, setUsers] = useState([])
  const [auctions, setAuctions] = useState([])
  const [activeTab, setActiveTab] = useState("users")

  useEffect(() => {
    if (user?.role !== "admin") {
      navigate("/")
      return
    }
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [metricsRes, usersRes, auctionsRes] = await Promise.all([
        api.get("/admin/metrics"),
        api.get("/admin/users"),
        api.get("/auction")
      ])
      setMetrics(metricsRes.data)
      setUsers(usersRes.data)
      setAuctions(auctionsRes.data)
    } catch (error) {
      console.error(error)
      toast.error("Failed to fetch admin data")
    }
  }

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user?")) return
    try {
      await api.delete(`/admin/users/${id}`)
      toast.success("User deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete user")
    }
  }

  const deleteAuction = async (id) => {
    if (!window.confirm("Delete this auction?")) return
    try {
      await api.delete(`/auction/${id}`)
      toast.success("Auction deleted")
      fetchData()
    } catch (error) {
      toast.error("Failed to delete auction")
    }
  }

  if (user?.role !== "admin") return null

  return (
    <div className="bg-[#fafaf9] text-stone-900 min-h-screen font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-4xl font-extrabold text-stone-900 mb-8">
          Admin <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700">Dashboard</span>
        </h1>

        {/* METRICS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium mb-2 uppercase tracking-wider text-sm">Total Users</p>
            <h3 className="text-4xl font-extrabold text-stone-900">{metrics.usersCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium mb-2 uppercase tracking-wider text-sm">Active Auctions</p>
            <h3 className="text-4xl font-extrabold text-stone-900">{metrics.activeAuctionsCount}</h3>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm">
            <p className="text-stone-500 font-medium mb-2 uppercase tracking-wider text-sm">Platform Volume</p>
            <h3 className="text-4xl font-extrabold text-indigo-600">₹ {metrics.totalRevenue}</h3>
          </div>
        </div>

        {/* TABS */}
        <div className="flex gap-4 mb-8">
          <button 
            onClick={() => setActiveTab("users")}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === "users" ? "bg-indigo-600 text-white border border-indigo-700" : "bg-white text-stone-500 hover:text-stone-900 border border-stone-200"}`}
          >
            Manage Users
          </button>
          <button 
            onClick={() => setActiveTab("auctions")}
            className={`px-6 py-3 rounded-xl font-bold transition-all shadow-sm ${activeTab === "auctions" ? "bg-indigo-600 text-white border border-indigo-700" : "bg-white text-stone-500 hover:text-stone-900 border border-stone-200"}`}
          >
            Manage Auctions
          </button>
        </div>

        {/* TABLES */}
        <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-sm">
          {activeTab === "users" && (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-stone-50 text-stone-500 text-sm uppercase border-b border-stone-200">
                  <tr>
                    <th className="px-6 py-4 font-bold">User</th>
                    <th className="px-6 py-4 font-bold">Email</th>
                    <th className="px-6 py-4 font-bold">Role</th>
                    <th className="px-6 py-4 font-bold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {users.map(u => (
                    <tr key={u._id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-4 font-medium text-stone-900 flex items-center gap-3">
                        {u.avatar ? (
                          <img src={u.avatar} alt="Avatar" className="w-8 h-8 rounded-full object-cover border border-stone-200" />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-indigo-100 flex items-center justify-center text-xs font-bold text-indigo-700">{u.name.charAt(0).toUpperCase()}</div>
                        )}
                        {u.name}
                      </td>
                      <td className="px-6 py-4 text-stone-500">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-1 rounded-md text-xs font-bold border ${u.role === "admin" ? "bg-indigo-50 text-indigo-700 border-indigo-100" : "bg-stone-100 text-stone-600 border-stone-200"}`}>
                          {u.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {u.role !== "admin" && (
                          <button onClick={() => deleteUser(u._id)} className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100">Delete</button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "auctions" && (
             <div className="overflow-x-auto">
             <table className="w-full text-left">
               <thead className="bg-stone-50 text-stone-500 text-sm uppercase border-b border-stone-200">
                 <tr>
                   <th className="px-6 py-4 font-bold">Item</th>
                   <th className="px-6 py-4 font-bold">Seller</th>
                   <th className="px-6 py-4 font-bold">Current Bid</th>
                   <th className="px-6 py-4 font-bold">Status</th>
                   <th className="px-6 py-4 font-bold text-right">Actions</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-stone-100">
                 {auctions.map(a => (
                   <tr key={a._id} className="hover:bg-stone-50 transition-colors">
                     <td className="px-6 py-4 font-medium text-stone-900 flex items-center gap-3">
                       <img src={`${import.meta.env.VITE_API_URL}/uploads/${a.image}`} alt="Auction" className="w-10 h-10 rounded-lg object-cover border border-stone-200" />
                       <span className="line-clamp-1">{a.title}</span>
                     </td>
                     <td className="px-6 py-4 text-stone-500">{a.sellerName}</td>
                     <td className="px-6 py-4 font-bold text-indigo-600">₹{a.currentBid}</td>
                     <td className="px-6 py-4">
                       <span className={`px-2 py-1 rounded-md text-xs font-bold border ${a.status === "closed" ? "bg-stone-100 text-stone-500 border-stone-200" : "bg-emerald-50 text-emerald-600 border-emerald-100"}`}>
                         {a.status.toUpperCase()}
                       </span>
                     </td>
                     <td className="px-6 py-4 text-right">
                       <button onClick={() => deleteAuction(a._id)} className="text-red-500 hover:text-red-600 font-bold text-sm bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg transition-colors border border-red-100">Remove</button>
                     </td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
          )}
        </div>
      </div>
      
      <Footer />
    </div>
  )
}

export default AdminDashboard
