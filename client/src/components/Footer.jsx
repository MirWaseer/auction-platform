function Footer() {
  return (
    <div className="bg-white border-t border-stone-200 mt-20">
      <div className="max-w-7xl mx-auto py-10 px-6">
        
        <h1 className="text-3xl font-extrabold text-stone-900 tracking-tight">
          Live<span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-indigo-700">Bid</span>
        </h1>

        <p className="text-stone-500 mt-4 max-w-md">
          Premium real-time online auction platform built using the MERN Stack & Socket.IO.
        </p>

        <div className="h-px bg-stone-100 my-6"></div>

        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-stone-400">
          <p>© 2026 LiveBid. All rights reserved.</p>
          <div className="flex gap-6">
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Terms of Service</span>
            <span className="hover:text-indigo-600 cursor-pointer transition-colors">Contact Support</span>
          </div>
        </div>

      </div>
    </div>
  )
}

export default Footer