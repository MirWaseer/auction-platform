// src/pages/Dashboard.jsx
import { useEffect, useState } from "react"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AuctionCard from "../components/AuctionCard"
import api from "../services/api"
import toast from "react-hot-toast"
import { Link } from "react-router-dom"

function Dashboard() {
  const user = JSON.parse(localStorage.getItem("user"))
  
  const [activeTab, setActiveTab] = useState("overview")
  const [allAuctions, setAllAuctions] = useState([])
  const [wishlist, setWishlist] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  
  // Checkout State
  const [showCheckout, setShowCheckout] = useState(false)
  const [checkoutAuction, setCheckoutAuction] = useState(null)
  const [isProcessing, setIsProcessing] = useState(false)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    setIsLoading(true)
    try {
      const res = await api.get("/auction")
      setAllAuctions(res.data)
      
      const savedWishlist = JSON.parse(localStorage.getItem("watchlist")) || []
      setWishlist(savedWishlist)
    } catch (error) {
      console.log(error)
      toast.error("Failed to load dashboard data")
    } finally {
      setIsLoading(false)
    }
  }

  // Filtered data
  const myAuctions = allAuctions.filter(a => a.sellerEmail === user?.email)
  const myBids = allAuctions.filter(a => a.bids?.some(bid => bid.bidder === user?.name))
  const activeBids = myBids.filter(a => a.status !== "closed")
  const wonAuctions = myBids.filter(a => a.status === "closed" && a.highestBidder === user?.name)

  /* ACTIONS FOR MY AUCTIONS */
  const deleteAuction = async (id) => {
    if (!window.confirm("Are you sure you want to delete this auction?")) return;
    try {
      await api.delete(`/auction/${id}`)
      toast.success("Auction Deleted")
      fetchData()
    } catch (error) {
      console.log(error)
      toast.error("Failed to delete auction")
    }
  }

  const closeAuction = async (id) => {
    if (!window.confirm("Are you sure you want to close this auction early?")) return;
    try {
      await api.put(`/auction/close/${id}`)
      toast.success("Auction Closed")
      fetchData()
    } catch (error) {
      console.log(error)
      toast.error("Failed to close auction")
    }
  }

  const removeWishlist = (id) => {
    const updated = wishlist.filter(item => item._id !== id)
    setWishlist(updated)
    localStorage.setItem("watchlist", JSON.stringify(updated))
    toast.success("Removed from Wishlist")
  }

  const handleCheckout = (auction) => {
    setCheckoutAuction(auction)
    setShowCheckout(true)
  }

  const processPayment = async (e) => {
    e.preventDefault()
    setIsProcessing(true)
    
    // Simulate network delay for mock checkout
    setTimeout(async () => {
      try {
        await api.put(`/auction/pay/${checkoutAuction._id}`)
        toast.success("Payment Successful! 🎉")
        setShowCheckout(false)
        fetchData()
      } catch (error) {
        console.log(error)
        toast.error("Payment failed")
      } finally {
        setIsProcessing(false)
      }
    }, 1500)
  }

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0]
    if (!file) return

    const formData = new FormData()
    formData.append("avatar", file)
    formData.append("email", user.email)

    try {
      const res = await api.put("/auth/profile-photo", formData, {
        headers: { "Content-Type": "multipart/form-data" }
      })
      localStorage.setItem("user", JSON.stringify(res.data))
      window.location.reload()
    } catch (error) {
      console.log(error)
      toast.error("Failed to upload photo")
    }
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        {/* HEADER */}
        <div className="bg-white rounded-3xl p-8 sm:p-12 shadow-sm border border-stone-200 flex flex-col md:flex-row items-center gap-8 mb-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>
          
          <label className="relative cursor-pointer group z-10">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" className="w-24 h-24 rounded-[2rem] object-cover shadow-lg transform rotate-3 transition-transform group-hover:scale-105 border border-stone-100" />
            ) : (
              <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-4xl font-extrabold shadow-lg shadow-indigo-500/20 transform rotate-3 transition-transform group-hover:scale-105">
                {user?.name?.charAt(0)?.toUpperCase()}
              </div>
            )}
            <div className="absolute inset-0 bg-stone-900/40 rounded-[2rem] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform rotate-3 backdrop-blur-sm">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
            </div>
            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
          </label>
          <div className="text-center md:text-left flex-1 z-10">
            <h1 className="text-4xl font-extrabold text-stone-900 mb-2">Welcome back, <span className="text-indigo-600">{user?.name}</span>!</h1>
            <p className="text-stone-500 text-lg">{user?.email}</p>
          </div>
          <Link to="/create" className="z-10">
            <button className="bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white px-8 py-4 rounded-2xl font-bold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 w-full md:w-auto">
              + Create Auction
            </button>
          </Link>
        </div>

        {/* NAVIGATION TABS */}
        <div className="flex overflow-x-auto hide-scrollbar gap-2 mb-8 bg-white p-2 rounded-2xl shadow-sm border border-stone-200">
          {[
            { id: "overview", label: "Overview", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
            { id: "auctions", label: "My Auctions", count: myAuctions.length, icon: "M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" },
            { id: "bids", label: "My Bids", count: myBids.length, icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" },
            { id: "wishlist", label: "Wishlist", count: wishlist.length, icon: "M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 px-6 py-3.5 rounded-xl font-bold transition-all whitespace-nowrap ${
                activeTab === tab.id
                  ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                  : "text-stone-500 hover:bg-stone-50 hover:text-stone-900 border border-transparent"
              }`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={tab.icon} />
              </svg>
              {tab.label}
              {tab.count !== undefined && (
                <span className={`px-2.5 py-0.5 rounded-lg text-sm ${
                  activeTab === tab.id ? "bg-indigo-100 text-indigo-800" : "bg-stone-100 text-stone-600"
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* TAB CONTENTS */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-indigo-600"></div>
          </div>
        ) : (
          <div className="min-h-[400px]">
            
            {/* OVERVIEW TAB */}
            {activeTab === "overview" && (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 font-medium mb-1 uppercase tracking-wider text-sm">Active Auctions</p>
                    <h3 className="text-4xl font-extrabold text-stone-900">{myAuctions.filter(a => a.status !== "closed").length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 font-medium mb-1 uppercase tracking-wider text-sm">Active Bids</p>
                    <h3 className="text-4xl font-extrabold text-indigo-600">{activeBids.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 font-medium mb-1 uppercase tracking-wider text-sm">Auctions Won</p>
                    <h3 className="text-4xl font-extrabold text-emerald-500">{wonAuctions.length}</h3>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-stone-200">
                    <p className="text-stone-500 font-medium mb-1 uppercase tracking-wider text-sm">Saved Items</p>
                    <h3 className="text-4xl font-extrabold text-pink-500">{wishlist.length}</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-bold text-stone-900 mb-6">Recent Bids</h2>
                    {myBids.length > 0 ? (
                      <div className="space-y-4">
                        {myBids.slice(0, 3).map(auction => (
                          <div key={auction._id} className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:border-stone-200 transition-colors">
                            <img src={auction.image} alt={auction.title} className="w-16 h-16 rounded-xl object-cover" />
                            <div className="flex-1">
                              <h4 className="font-bold text-stone-900 line-clamp-1">{auction.title}</h4>
                              <p className="text-sm text-stone-500">Current Bid: ₹{auction.currentBid}</p>
                            </div>
                            <Link to={`/auction/${auction._id}`}>
                              <button className="text-indigo-600 font-bold hover:bg-white px-4 py-2 rounded-lg transition-colors border border-indigo-100 hover:border-indigo-300">View</button>
                            </Link>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-500 text-center py-8">You haven't placed any bids yet.</p>
                    )}
                  </div>

                  <div className="bg-white rounded-3xl p-8 shadow-sm border border-stone-200">
                    <h2 className="text-xl font-bold text-stone-900 mb-6">Recently Won</h2>
                    {wonAuctions.length > 0 ? (
                      <div className="space-y-4">
                        {wonAuctions.slice(0, 3).map(auction => (
                          <div key={auction._id} className="flex items-center gap-4 p-4 rounded-2xl bg-emerald-50 border border-emerald-100">
                            <div className="w-16 h-16 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                              <svg className="w-8 h-8" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                            </div>
                            <div className="flex-1 flex justify-between items-center">
                              <div>
                                <h4 className="font-bold text-stone-900 line-clamp-1">{auction.title}</h4>
                                <p className="text-sm text-emerald-600 font-bold">Won for ₹{auction.currentBid}</p>
                              </div>
                              {auction.paymentStatus === "paid" ? (
                                <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-lg text-xs font-bold border border-emerald-200">
                                  PAID
                                </span>
                              ) : (
                                <button 
                                  onClick={() => handleCheckout(auction)}
                                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-bold shadow-md transition-all"
                                >
                                  Pay Now
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-stone-500 text-center py-8">No won auctions yet.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* MY AUCTIONS TAB */}
            {activeTab === "auctions" && (
              myAuctions.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {myAuctions.map((auction) => (
                    <div key={auction._id} className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden flex flex-col h-full group">
                      <div className="relative h-48 bg-stone-100 overflow-hidden">
                        <img src={auction.image} alt={auction.title} className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${auction.status === "closed" ? "grayscale opacity-80" : ""}`} />
                        <div className={`absolute top-4 left-4 px-3 py-1 rounded-full text-xs font-bold shadow-md ${auction.status === "closed" ? "bg-red-500 text-white" : "bg-emerald-500 text-white animate-pulse"}`}>
                          {auction.status === "closed" ? "ENDED" : "LIVE"}
                        </div>
                      </div>
                      <div className="p-6 flex-1 flex flex-col justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-stone-900 mb-1 line-clamp-1">{auction.title}</h3>
                          <h2 className="text-2xl font-extrabold text-indigo-600 mb-4">₹ {auction.currentBid}</h2>
                        </div>
                        <div className="flex gap-2">
                          {auction.status !== "closed" && (
                            <button onClick={() => closeAuction(auction._id)} className="flex-1 bg-amber-50 hover:bg-amber-100 text-amber-600 py-2.5 rounded-xl font-bold transition border border-amber-100">
                              Close
                            </button>
                          )}
                          <button onClick={() => deleteAuction(auction._id)} className="flex-1 bg-red-50 hover:bg-red-100 text-red-600 py-2.5 rounded-xl font-bold transition border border-red-100">
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-200">
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">No Auctions Found</h3>
                  <p className="text-stone-500 mb-6">You haven't created any auctions yet.</p>
                  <Link to="/create"><button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">Create One Now</button></Link>
                </div>
              )
            )}

            {/* MY BIDS TAB */}
            {activeTab === "bids" && (
              myBids.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {myBids.map(auction => (
                    <AuctionCard key={auction._id} auction={auction} />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-200">
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">No Bids Placed</h3>
                  <p className="text-stone-500 mb-6">You haven't participated in any auctions yet.</p>
                  <Link to="/home"><button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">Explore Auctions</button></Link>
                </div>
              )
            )}

            {/* WISHLIST TAB */}
            {activeTab === "wishlist" && (
              wishlist.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                  {wishlist.map(auction => (
                    <div key={auction._id} className="relative group">
                      <AuctionCard auction={auction} />
                      <button 
                        onClick={() => removeWishlist(auction._id)}
                        className="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 p-2.5 rounded-full shadow-lg border border-red-100 hover:bg-red-500 hover:text-white transition-all transform opacity-0 group-hover:opacity-100"
                        title="Remove from Wishlist"
                      >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-3xl p-16 text-center shadow-sm border border-stone-200">
                  <h3 className="text-2xl font-bold text-stone-800 mb-2">Wishlist is Empty</h3>
                  <p className="text-stone-500 mb-6">You haven't saved any items to your wishlist.</p>
                  <Link to="/home"><button className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-bold hover:bg-indigo-700 shadow-lg shadow-indigo-500/20">Discover Items</button></Link>
                </div>
              )
            )}

          </div>
        )}
      </div>

      {/* MOCK CHECKOUT MODAL */}
      {showCheckout && checkoutAuction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl relative animate-fadeIn border border-stone-100">
            <button 
              onClick={() => setShowCheckout(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-stone-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              </div>
              <h2 className="text-2xl font-bold text-stone-900">Secure Checkout</h2>
              <p className="text-stone-500 mt-1">Complete your purchase for {checkoutAuction.title}</p>
            </div>

            <div className="bg-stone-50 p-4 rounded-2xl mb-6 flex justify-between items-center border border-stone-200">
              <span className="text-stone-500 font-medium">Total Amount:</span>
              <span className="text-2xl font-extrabold text-indigo-600">₹{checkoutAuction.currentBid}</span>
            </div>

            <form onSubmit={processPayment} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 block">Card Number</label>
                <input type="text" placeholder="**** **** **** 4242" required className="w-full bg-white text-stone-900 placeholder-stone-400 border border-stone-200 p-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 block">Expiry</label>
                  <input type="text" placeholder="MM/YY" required className="w-full bg-white text-stone-900 placeholder-stone-400 border border-stone-200 p-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                </div>
                <div>
                  <label className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-1 block">CVC</label>
                  <input type="text" placeholder="***" required className="w-full bg-white text-stone-900 placeholder-stone-400 border border-stone-200 p-3 rounded-xl focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all" />
                </div>
              </div>
              
              <button 
                type="submit" 
                disabled={isProcessing}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all mt-4 disabled:opacity-70 flex justify-center items-center"
              >
                {isProcessing ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  `Pay ₹${checkoutAuction.currentBid}`
                )}
              </button>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  )
}

export default Dashboard
