// src/pages/AuctionDetails.jsx

import { useEffect, useState } from "react"
import { useParams } from "react-router-dom"
import api from "../services/api"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import { io } from "socket.io-client"
import toast from "react-hot-toast"

const socket = io(import.meta.env.VITE_API_URL)

function AuctionDetails() {
  const { id } = useParams()
  const user = JSON.parse(localStorage.getItem("user"))

  const [auction, setAuction] = useState(null)
  const [bid, setBid] = useState("")
  const [proxyBid, setProxyBidAmount] = useState("")
  const [timeLeft, setTimeLeft] = useState("")
  const [watchlisted, setWatchlisted] = useState(false)
  const [commentText, setCommentText] = useState("")

  /* FETCH AUCTION */
  const fetchAuction = async () => {
    try {
      const res = await api.get(`/auction/${id}`)
      setAuction(res.data)
      
      // Check if watchlisted
      const saved = JSON.parse(localStorage.getItem("watchlist")) || []
      if (saved.some(item => item._id === res.data._id)) {
        setWatchlisted(true)
      }
    } catch (error) {
      console.log(error)
    }
  }

  /* SOCKET */
  useEffect(() => {
    fetchAuction()

    socket.on("newBid", (data) => {
      if (data.auctionId === id) {
        toast.success(`🔥 New Highest Bid ₹${data.amount}`)
        setAuction(data)
      }
    })

    socket.on("newComment", (data) => {
      if (data._id === id) {
        setAuction(data)
      }
    })

    return () => {
      socket.off("newBid")
      socket.off("newComment")
    }
  }, [id])

  /* TIMER */
  useEffect(() => {
    if (!auction?.endTime) return

    const updateTimer = () => {
      const end = new Date(auction.endTime)
      const now = new Date()
      const diff = end.getTime() - now.getTime()

      if (diff <= 0) {
        setTimeLeft("Auction Ended")
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
      const seconds = Math.floor((diff % (1000 * 60)) / 1000)

      setTimeLeft(`${hours}h ${minutes}m ${seconds}s`)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 1000)
    return () => clearInterval(interval)
  }, [auction?.endTime])

  /* PLACE BID */
  const placeBid = async () => {
    if (!user) {
      toast.error("Please login to place a bid")
      return
    }

    if (auction.status === "closed") {
      toast.error("Auction has ended")
      return
    }

    if (Number(bid) <= auction.currentBid) {
      toast.error("Bid must be higher than current bid")
      return
    }

    try {
      await api.post("/bid", {
        auctionId: id,
        bidder: user?.name || "Guest",
        amount: bid,
      })

      socket.emit("placeBid", {
        auctionId: id,
        bidder: user?.name || "Guest",
        amount: bid,
      })

      toast.success("Bid placed successfully")
      setBid("")
    } catch (error) {
      console.log(error)
      toast.error("Failed to place bid")
    }
  }

  /* SET PROXY BID */
  const setProxyBid = async () => {
    if (!user) {
      toast.error("Please login to set an auto-bid")
      return
    }
    if (auction.status === "closed") {
      toast.error("Auction has ended")
      return
    }
    if (Number(proxyBid) <= auction.currentBid) {
      toast.error("Max bid must be higher than current bid")
      return
    }

    try {
      const res = await api.post("/bid/proxy", {
        auctionId: id,
        bidder: user?.name,
        maxAmount: Number(proxyBid),
      })
      
      // If the backend triggered an immediate auto-bid because this max amount was higher than current bid
      if (res.data.auction) {
         socket.emit("placeBid", {
           auctionId: id,
           bidder: user.name,
           amount: res.data.auction.currentBid
         })
      }
      
      toast.success(`Auto-bid limit set to ₹${proxyBid}!`)
      setProxyBidAmount("")
    } catch (error) {
      console.log(error)
      toast.error("Failed to set auto-bid")
    }
  }

  /* TOGGLE WATCHLIST */
  const toggleWatchlist = () => {
    let saved = JSON.parse(localStorage.getItem("watchlist")) || []
    if (watchlisted) {
      saved = saved.filter(item => item._id !== id)
      setWatchlisted(false)
      toast.success("Removed from Wishlist")
    } else {
      const auctionToSave = { ...auction, bids: [] }
      saved.push(auctionToSave)
      setWatchlisted(true)
      toast.success("Added to Watchlist")
    }
    localStorage.setItem("watchlist", JSON.stringify(saved))
  }

  /* POST COMMENT */
  const postComment = async (e) => {
    e.preventDefault()
    if (!user) {
      toast.error("Please login to comment")
      return
    }
    if (!commentText.trim()) return

    try {
      const res = await api.post(`/auction/comment/${id}`, {
        user: user.name,
        avatar: user.avatar || "",
        text: commentText
      })
      
      socket.emit("postComment", res.data)
      setCommentText("")
      toast.success("Comment posted")
    } catch (error) {
      console.log(error)
      toast.error("Failed to post comment")
    }
  }

  if (!auction) {
    return (
      <div className="min-h-screen bg-[#fafaf9] flex items-center justify-center">
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-indigo-600"></div>
      </div>
    )
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen pb-20 font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        
        {/* MAIN DETAILS CARD */}
        <div className="bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden mb-12">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            
            {/* IMAGE SECTION */}
            <div className="relative bg-stone-50 flex items-center justify-center p-8 lg:p-12 border-r border-stone-200">
              <img
                src={`${import.meta.env.VITE_API_URL}/uploads/${auction.image}`}
                alt={auction.title}
                className={`w-full max-h-[500px] object-contain rounded-2xl shadow-sm transition-all duration-700 ${auction.status === "closed" ? "grayscale opacity-70" : "hover:scale-[1.02]"}`}
              />
              {auction.status === "closed" && (
                <div className="absolute inset-0 flex items-center justify-center backdrop-blur-sm bg-stone-900/40">
                  <div className="bg-red-500 text-white px-10 py-5 rounded-3xl text-4xl font-extrabold shadow-2xl transform -rotate-12 border-4 border-white/20">
                    SOLD
                  </div>
                </div>
              )}
            </div>

            {/* CONTENT SECTION */}
            <div className="p-8 lg:p-12 flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap justify-between items-center gap-4 mb-6">
                  <span className={`px-4 py-2 rounded-full font-bold text-sm tracking-wider uppercase shadow-sm ${
                    auction.status === "closed" ? "bg-stone-100 text-stone-500 border border-stone-200" : "bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center gap-2"
                  }`}>
                    {auction.status !== "closed" && <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>}
                    {auction.status === "closed" ? "Auction Ended" : "Live Auction"}
                  </span>

                  <button
                    onClick={toggleWatchlist}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-full font-semibold transition-all duration-300 shadow-sm border hover:shadow-md ${
                      watchlisted ? "bg-indigo-50 text-indigo-700 border-indigo-200 hover:bg-indigo-100" : "bg-white text-stone-600 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
                    }`}
                  >
                    <svg className={`w-5 h-5 ${watchlisted ? "fill-current" : "fill-none"}`} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                    </svg>
                    {watchlisted ? "Watchlisted" : "Add to Watchlist"}
                  </button>
                </div>

                <h1 className="text-4xl lg:text-5xl font-extrabold text-stone-900 leading-tight mb-4">
                  {auction.title}
                </h1>
                
                <p className="text-stone-500 text-lg leading-relaxed mb-8">
                  {auction.description}
                </p>
                
                <div className="grid grid-cols-2 gap-6 mb-8">
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <p className="text-indigo-600 font-medium text-sm uppercase tracking-wider mb-2">Time Left</p>
                    <p className={`text-2xl lg:text-3xl font-bold ${auction.status === "closed" ? "text-stone-500" : "text-indigo-600 animate-pulse"}`}>
                      {timeLeft}
                    </p>
                  </div>
                  <div className="bg-stone-50 p-6 rounded-2xl border border-stone-200">
                    <p className="text-emerald-600 font-medium text-sm uppercase tracking-wider mb-2">Total Bids</p>
                    <p className="text-2xl lg:text-3xl font-bold text-emerald-600">
                      {auction.bids?.length || 0}
                    </p>
                  </div>
                </div>
              </div>

              {/* BIDDING SECTION */}
              <div className="bg-white p-6 lg:p-8 rounded-3xl border border-stone-200 shadow-sm">
                <div className="flex justify-between items-end mb-6">
                  <div>
                    <p className="text-stone-500 font-medium mb-1">Current Highest Bid</p>
                    <h2 className={`text-4xl font-extrabold ${auction.status === "closed" ? "text-stone-400" : "text-emerald-600"}`}>
                      ₹ {auction.currentBid}
                    </h2>
                  </div>
                  <div className="text-right">
                    <p className="text-stone-500 text-sm mb-1">Highest Bidder</p>
                    <p className="font-bold text-stone-700 bg-stone-100 px-3 py-1 rounded-lg border border-stone-200 shadow-sm">
                      {auction.highestBidder || "None"}
                    </p>
                  </div>
                </div>

                {auction.status !== "closed" && (
                  <>
                    <div className="flex flex-wrap gap-2 mb-6">
                      {[500, 1000, 5000].map((amount) => (
                        <button
                          key={amount}
                          onClick={() => setBid(auction.currentBid + amount)}
                          className="flex-1 bg-white border border-stone-200 hover:border-indigo-500 hover:text-indigo-600 text-stone-600 py-2.5 rounded-xl font-semibold transition-all shadow-sm hover:shadow-md"
                        >
                          +₹{amount}
                        </button>
                      ))}
                    </div>

                    <div className="flex gap-4">
                      <input
                        type="number"
                        placeholder="Enter amount"
                        value={bid}
                        onChange={(e) => setBid(e.target.value)}
                        className="flex-1 bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-stone-900 placeholder-stone-400 outline-none px-5 py-4 rounded-xl font-medium text-lg transition-all"
                      />
                      <button
                        onClick={placeBid}
                        className="px-8 bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white font-bold rounded-xl shadow-lg shadow-indigo-500/20 transition-all hover:-translate-y-0.5"
                      >
                        Place Bid
                      </button>
                    </div>

                    <div className="mt-8 pt-6 border-t border-stone-200">
                      <h3 className="font-bold text-stone-900 mb-2">Auto-Bidding (Proxy Bid)</h3>
                      <p className="text-sm text-stone-500 mb-4">Set your maximum limit. We'll automatically bid just enough to keep you in the lead.</p>
                      <div className="flex gap-4">
                        <input
                          type="number"
                          placeholder="Max amount"
                          value={proxyBid}
                          onChange={(e) => setProxyBidAmount(e.target.value)}
                          className="flex-1 bg-stone-50 border border-stone-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 text-stone-900 placeholder-stone-400 outline-none px-5 py-3 rounded-xl font-medium text-lg transition-all"
                        />
                        <button
                          onClick={setProxyBid}
                          className="px-6 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-xl transition-all border border-indigo-200 shadow-sm"
                        >
                          Set Max Bid
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* SELLER INFO */}
          <div className="lg:col-span-1 space-y-8">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200">
              <h2 className="text-xl font-bold text-stone-900 mb-6 flex items-center gap-3">
                <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Seller Information
              </h2>
              <div className="flex items-center gap-5">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-indigo-700 text-white flex items-center justify-center text-2xl font-bold shadow-lg shadow-indigo-500/20">
                  {auction?.sellerName?.charAt(0)?.toUpperCase()}
                </div>
                <div>
                  <h3 className="font-bold text-lg text-stone-900">{auction.sellerName}</h3>
                  <p className="text-stone-500 text-sm mb-2">{auction.sellerEmail}</p>
                  <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-600 px-2.5 py-1 rounded-md text-xs font-bold border border-emerald-200">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                    Verified
                  </span>
                </div>
              </div>
            </div>

            {auction.status === "closed" && (
              <div className="bg-gradient-to-br from-indigo-50 to-indigo-100 rounded-[2rem] p-8 shadow-sm border border-indigo-200 text-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <svg className="w-24 h-24 text-indigo-600" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5 2a1 1 0 011 1v1h1a1 1 0 010 2H6v1a1 1 0 01-2 0V6H3a1 1 0 010-2h1V3a1 1 0 011-1zm0 10a1 1 0 011 1v1h1a1 1 0 110 2H6v1a1 1 0 11-2 0v-1H3a1 1 0 110-2h1v-1a1 1 0 011-1zM12 2a1 1 0 01.967.744L14.146 7.2 17.5 9.134a1 1 0 010 1.732l-3.354 1.935-1.18 4.455a1 1 0 01-1.933 0L9.854 12.8 6.5 10.866a1 1 0 010-1.732l3.354-1.935 1.18-4.455A1 1 0 0112 2z" clipRule="evenodd" /></svg>
                </div>
                <h2 className="text-indigo-700 font-bold uppercase tracking-wider text-sm mb-2 relative z-10">Auction Winner</h2>
                <p className="text-3xl font-extrabold text-stone-900 mb-2 relative z-10">{auction.highestBidder || "No Winner"}</p>
                <p className="text-2xl font-bold text-indigo-600 relative z-10">₹ {auction.currentBid}</p>
              </div>
            )}
          </div>

          {/* BID HISTORY */}
          <div className="lg:col-span-2 bg-white rounded-[2rem] p-8 shadow-sm border border-stone-200 h-96 flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-stone-900 flex items-center gap-3">
                <svg className="w-6 h-6 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Live Bid History
              </h2>
              <span className="bg-stone-100 text-stone-600 px-3 py-1 rounded-lg text-sm font-bold border border-stone-200">
                {auction.bids?.length || 0} Total
              </span>
            </div>

            <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
              {auction.bids?.length > 0 ? (
                auction.bids.map((bidItem, index) => (
                  <div key={index} className="flex justify-between items-center p-4 rounded-2xl bg-stone-50 border border-stone-200 hover:border-indigo-200 hover:shadow-sm transition-all">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-sm border border-indigo-200">
                        {bidItem.bidder.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-bold text-stone-900">{bidItem.bidder}</p>
                        <p className="text-xs text-stone-500">Placed a bid</p>
                      </div>
                    </div>
                    <p className="text-xl font-bold text-emerald-600 bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-100">
                      ₹ {bidItem.amount}
                    </p>
                  </div>
                ))
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-stone-400">
                  <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  <p>No bids placed yet</p>
                  <p className="text-sm">Be the first to bid!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* COMMENTS / LIVE Q&A SECTION */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24 mt-12">
        <div className="bg-white rounded-[2rem] p-8 lg:p-12 shadow-sm border border-stone-200">
          <div className="flex items-center gap-4 mb-8 border-b border-stone-200 pb-6">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-xl flex items-center justify-center border border-indigo-100">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" /></svg>
            </div>
            <div>
              <h2 className="text-2xl font-extrabold text-stone-900">Live Q&A</h2>
              <p className="text-stone-500">Ask the seller questions or discuss the item</p>
            </div>
          </div>

          <div className="space-y-6 mb-8 max-h-96 overflow-y-auto pr-4 custom-scrollbar">
            {auction.comments && auction.comments.length > 0 ? (
              auction.comments.map((comment, index) => (
                <div key={index} className="flex gap-4 p-4 bg-stone-50 rounded-2xl border border-stone-200 animate-fadeIn">
                  {comment.avatar ? (
                    <img src={comment.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm border border-stone-200" />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white font-bold shrink-0">
                      {comment.user.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="font-bold text-stone-900">{comment.user}</h4>
                      <span className="text-xs text-stone-400 font-medium">
                        {new Date(comment.createdAt).toLocaleDateString()} {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="text-stone-600 leading-relaxed">{comment.text}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12 bg-stone-50 rounded-2xl border border-dashed border-stone-300">
                <p className="text-stone-500 font-medium">No questions yet. Be the first to ask!</p>
              </div>
            )}
          </div>

          <form onSubmit={postComment} className="flex gap-4 items-start">
            {user?.avatar ? (
               <img src={user.avatar} alt="Avatar" className="w-12 h-12 rounded-full object-cover shadow-sm hidden sm:block border border-stone-200" />
            ) : (
              <div className="w-12 h-12 rounded-full bg-stone-100 text-stone-500 flex items-center justify-center font-bold shrink-0 hidden sm:flex border border-stone-200">
                {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
              </div>
            )}
            <div className="flex-1 flex gap-2">
              <input 
                type="text" 
                placeholder={user ? "Write a comment..." : "Login to comment..."}
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                disabled={!user}
                className="flex-1 bg-white border border-stone-200 p-4 rounded-xl text-stone-900 placeholder-stone-400 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all font-medium shadow-sm"
              />
              <button 
                type="submit"
                disabled={!user || !commentText.trim()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-4 rounded-xl font-bold shadow-md shadow-indigo-500/20 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center min-w-[100px]"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      </div>

      <Footer />
    </div>
  )
}

export default AuctionDetails