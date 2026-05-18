// src/components/AuctionCard.jsx
import { Link } from "react-router-dom"

function AuctionCard({ auction }) {
  return (
    <div className="bg-white rounded-3xl shadow-sm border border-stone-200 overflow-hidden hover:shadow-xl hover:border-indigo-500/30 transition-all duration-300 hover:-translate-y-1 flex flex-col h-full group">
      <div className="relative h-56 bg-stone-100 overflow-hidden">
        <img
          src={auction?.image || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?q=80&w=600&auto=format&fit=crop"}
          alt={auction?.title || "Auction"}
          className={`w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 ${auction?.status === "closed" ? "grayscale opacity-80" : ""}`}
        />
        {auction?.status === "closed" && (
          <div className="absolute inset-0 bg-stone-900/40 flex items-center justify-center backdrop-blur-sm">
            <span className="bg-red-500 text-white px-6 py-2 rounded-full font-bold shadow-lg transform -rotate-12 border-2 border-white/20">SOLD</span>
          </div>
        )}
      </div>
      
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <h3 className="text-xl font-bold text-stone-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">{auction?.title || "Untitled"}</h3>
          <p className="text-stone-500 text-sm mb-4 line-clamp-2">{auction?.description || "No description provided."}</p>
        </div>
        
        <div>
          <div className="flex justify-between items-center mb-4 pb-4 border-b border-stone-100">
            <div>
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Current Bid</p>
              <p className={`text-xl font-extrabold ${auction?.status === "closed" ? "text-stone-400" : "text-emerald-600"}`}>
                ₹ {auction?.currentBid || 0}
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs text-stone-400 font-medium uppercase tracking-wider mb-1">Total Bids</p>
              <p className="font-bold text-stone-600 bg-stone-50 px-3 py-1 rounded-lg border border-stone-200">
                {auction?.bids?.length || 0}
              </p>
            </div>
          </div>
          
          <Link to={`/auction/${auction?._id}`}>
            <button className={`w-full py-3 rounded-xl font-bold transition-all ${
              auction?.status === "closed" 
                ? "bg-stone-100 text-stone-500 hover:bg-stone-200 hover:text-stone-700 border border-transparent" 
                : "bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white border border-indigo-100 hover:border-transparent shadow-sm hover:shadow-indigo-500/30"
            }`}>
              {auction?.status === "closed" ? "View Details" : "Place Bid"}
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default AuctionCard