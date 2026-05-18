// src/pages/Home.jsx
import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import Footer from "../components/Footer"
import AuctionCard from "../components/AuctionCard"
import api from "../services/api"

function Home() {
  const [auctions, setAuctions] = useState([])
  const location = useLocation()
  const navigate = useNavigate()
  const searchParams = new URLSearchParams(location.search)
  const searchQuery = searchParams.get("search")?.toLowerCase() || ""
  const [selectedCategory, setSelectedCategory] = useState("All")
  const [sortBy, setSortBy] = useState("Ending Soonest")
  const categories = ["All", "Electronics", "Vehicles", "Art & Collectibles", "Fashion & Jewelry", "Real Estate", "Other"]

  useEffect(() => {
    fetchAuctions()
  }, [])

  const fetchAuctions = async () => {
    try {
      const res = await api.get("/auction")
      setAuctions(res.data)
    } catch (error) {
      console.log(error)
    }
  }

  /* FILTERS */
  let filteredAuctions = auctions.filter((auction) => 
    (auction.title && auction.title.toLowerCase().includes(searchQuery)) ||
    (auction.description && auction.description.toLowerCase().includes(searchQuery))
  )

  if (selectedCategory !== "All") {
    filteredAuctions = filteredAuctions.filter(a => a.category === selectedCategory || (selectedCategory === "Art" && a.category === "Art & Collectibles") || (selectedCategory === "Fashion" && a.category === "Fashion & Jewelry"))
  }

  // SORTING
  filteredAuctions.sort((a, b) => {
    if (sortBy === "Ending Soonest") return new Date(a.endTime) - new Date(b.endTime)
    if (sortBy === "Highest Bid") return b.currentBid - a.currentBid
    if (sortBy === "Lowest Bid") return a.currentBid - b.currentBid
    return 0
  })

  const liveAuctions = filteredAuctions.filter(
    (auction) => auction.status !== "closed"
  )

  const endedAuctions = filteredAuctions.filter(
    (auction) => auction.status === "closed"
  )

  return (
    <div className="bg-[#fafaf9] min-h-screen font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      {/* HERO SECTION */}
      {!searchQuery && (
        <div className="relative overflow-hidden bg-white text-stone-900 border-b border-stone-200">
          <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
            <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-indigo-500/5 blur-3xl"></div>
            <div className="absolute bottom-0 right-0 w-full h-96 bg-gradient-to-t from-stone-50 to-transparent z-10"></div>
          </div>

          <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 py-24 lg:py-32 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold leading-tight tracking-tight text-stone-900">
                Bid Smart.
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-800">
                  Win Premium.
                </span>
              </h1>
              <p className="mt-6 text-xl text-stone-500 leading-relaxed max-w-2xl mx-auto lg:mx-0 font-light">
                Experience real-time live auctions with our modern bidding system. Discover exclusive products and place your winning bids today.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <button 
                  onClick={() => window.scrollTo({ top: 600, behavior: 'smooth' })}
                  className="px-8 py-4 bg-indigo-600 text-white rounded-2xl font-bold text-lg hover:bg-indigo-700 transition-all duration-300 shadow-lg shadow-indigo-500/20 hover:shadow-xl hover:-translate-y-1"
                >
                  Explore Auctions
                </button>
              </div>
            </div>

            <div className="relative hidden md:block">
              <div className="absolute inset-0 bg-gradient-to-tr from-indigo-200 to-indigo-100 rounded-[2.5rem] transform rotate-3 scale-105 opacity-40 blur-lg"></div>
              <img
                src="/hero.png"
                alt="Premium Auction"
                className="relative rounded-[2rem] shadow-2xl border border-stone-200 transform transition-transform duration-700 hover:scale-[1.02]"
              />
              
              <div className="absolute -bottom-6 -left-6 bg-white/90 backdrop-blur-md border border-stone-200 p-4 rounded-2xl shadow-xl flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center animate-pulse">
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                </div>
                <div>
                  <p className="text-stone-900 font-bold">Live Bidding</p>
                  <p className="text-indigo-600 text-sm">Real-time updates</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {searchQuery && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12">
          <div className="flex items-center justify-between mb-2">
             <h2 className="text-3xl font-bold text-stone-900">
               Search Results for "<span className="text-indigo-600">{searchQuery}</span>"
             </h2>
             <button onClick={() => navigate("/home")} className="text-stone-500 hover:text-stone-900 font-medium bg-stone-100 px-4 py-2 rounded-lg">Clear Search</button>
          </div>
          <p className="text-stone-500 mt-2">Found {filteredAuctions.length} matching auctions</p>
        </div>
      )}

      {/* CATEGORY & SORT BAR */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-4">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6 bg-white p-4 rounded-2xl shadow-sm border border-stone-200">
          
          <div className="flex overflow-x-auto hide-scrollbar gap-2 w-full md:w-auto pb-2 md:pb-0">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-5 py-2.5 rounded-xl font-bold whitespace-nowrap transition-all ${
                  selectedCategory === cat
                    ? "bg-indigo-50 text-indigo-700 shadow-sm border border-indigo-100"
                    : "bg-white text-stone-500 hover:bg-stone-50 hover:text-stone-900 border border-stone-200"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="w-full md:w-auto flex items-center gap-3">
            <span className="text-stone-500 font-medium text-sm whitespace-nowrap">Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-stone-200 text-stone-900 font-bold px-4 py-2.5 rounded-xl outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all w-full md:w-48"
            >
              <option value="Ending Soonest">Ending Soonest</option>
              <option value="Highest Bid">Highest Bid</option>
              <option value="Lowest Bid">Lowest Bid</option>
            </select>
          </div>
        </div>
      </div>

      {/* LIVE AUCTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 border-b border-stone-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
              <span className="bg-indigo-50 text-indigo-600 p-2 rounded-xl border border-indigo-100">
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" /></svg>
              </span>
              Live Auctions
            </h2>
            <p className="text-stone-500 mt-2 font-medium">Items currently accepting bids</p>
          </div>
          <span className="bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl font-bold border border-emerald-200">
            {liveAuctions.length} Active
          </span>
        </div>

        {liveAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {liveAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 flex flex-col items-center justify-center text-center shadow-sm border border-stone-200">
            <div className="w-24 h-24 bg-stone-50 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-stone-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 12H4M8 16l-4-4 4-4" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-stone-900 mb-2">No Live Auctions</h3>
            <p className="text-stone-500 max-w-md">There are currently no active auctions matching your criteria. Check back later or adjust your search.</p>
          </div>
        )}
      </div>

      {/* ENDED AUCTIONS */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-24">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-12 border-b border-stone-200 pb-6">
          <div>
            <h2 className="text-3xl font-extrabold text-stone-900 tracking-tight flex items-center gap-3">
              <span className="bg-stone-100 text-stone-500 p-2 rounded-xl">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" /></svg>
              </span>
              Past Auctions
            </h2>
            <p className="text-stone-500 mt-2 font-medium">Successfully completed bidding wars</p>
          </div>
          <span className="bg-stone-100 text-stone-600 px-4 py-2 rounded-xl font-bold border border-stone-200">
            {endedAuctions.length} Ended
          </span>
        </div>

        {endedAuctions.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {endedAuctions.map((auction) => (
              <AuctionCard key={auction._id} auction={auction} />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-stone-200 shadow-sm">
            <h3 className="text-xl font-bold text-stone-400">No Past Auctions</h3>
          </div>
        )}
      </div>

      <Footer />
    </div>
  )
}

export default Home