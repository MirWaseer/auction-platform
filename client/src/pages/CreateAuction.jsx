// src/pages/CreateAuction.jsx
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import Navbar from "../components/Navbar"
import api from "../services/api"
import toast from "react-hot-toast"

function CreateAuction() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    title: "",
    category: "Electronics",
    description: "",
    currentBid: "",
    endTime: "",
  })
  const [imageFile, setImageFile] = useState(null)
  const [imagePreview, setImagePreview] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setImageFile(file)
      setImagePreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const user = JSON.parse(localStorage.getItem("user"))

      const formData = new FormData()
      formData.append("title", form.title)
      formData.append("category", form.category)
      formData.append("description", form.description)
      formData.append("currentBid", form.currentBid)
      formData.append("endTime", form.endTime)
      formData.append("sellerName", user?.name || "")
      formData.append("sellerEmail", user?.email || "")
      
      if (imageFile) {
        formData.append("image", imageFile)
      } else {
        toast.error("Please select an image for your auction")
        setIsLoading(false)
        return
      }

      await api.post("/auction", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      })

      toast.success("Auction Created Successfully!")
      navigate("/dashboard")
    } catch (error) {
      console.log(error)
      toast.error("Failed to create auction")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-[#fafaf9] min-h-screen font-sans selection:bg-indigo-600 selection:text-white">
      <Navbar />

      <div className="flex items-center justify-center px-4 py-12">
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-xl rounded-[2.5rem] p-8 sm:p-12 w-full max-w-3xl border border-stone-200 relative overflow-hidden"
        >
          {/* Decorative glow */}
          <div className="absolute -top-32 -right-32 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl"></div>

          <div className="text-center mb-10 relative z-10">
            <h1 className="text-4xl font-extrabold text-stone-900 mb-2">Create Auction</h1>
            <p className="text-stone-500">List your premium item for bidding</p>
          </div>

          <div className="space-y-6 relative z-10">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* TITLE */}
              <div>
                <label className="text-sm font-bold text-stone-600 block mb-2 uppercase tracking-wider">Product Title</label>
                <input
                  type="text"
                  placeholder="e.g. Vintage Rolex Submariner"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-stone-900 placeholder-stone-400"
                  required
                />
              </div>

              {/* CATEGORY */}
              <div>
                <label className="text-sm font-bold text-stone-600 block mb-2 uppercase tracking-wider">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm({ ...form, category: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-stone-900"
                >
                  <option value="Electronics">Electronics</option>
                  <option value="Vehicles">Vehicles</option>
                  <option value="Art">Art & Collectibles</option>
                  <option value="Fashion">Fashion & Jewelry</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            {/* IMAGE UPLOAD */}
            <div>
              <label className="text-sm font-bold text-stone-600 block mb-2 uppercase tracking-wider">Product Photo</label>
              <div className="flex flex-col items-center justify-center w-full">
                <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-stone-300 border-dashed rounded-3xl cursor-pointer bg-stone-50 hover:bg-stone-100 hover:border-indigo-500/50 transition-all relative overflow-hidden group">
                  {imagePreview ? (
                    <>
                      <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity backdrop-blur-sm">
                        <p className="text-white font-bold flex items-center gap-2">
                          <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                          Change Photo
                        </p>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <div className="w-16 h-16 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center mb-4 border border-indigo-200">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                      </div>
                      <p className="mb-2 text-sm text-stone-500 font-medium"><span className="font-bold text-indigo-600">Click to upload</span> or take a picture</p>
                      <p className="text-xs text-stone-400">PNG, JPG, JPEG up to 10MB</p>
                    </div>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    capture="environment"
                    onChange={handleImageChange}
                  />
                </label>
              </div>
            </div>

            {/* DESCRIPTION */}
            <div>
              <label className="text-sm font-bold text-stone-600 block mb-2 uppercase tracking-wider">Description</label>
              <textarea
                placeholder="Describe your item in detail..."
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
                className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all h-32 font-medium custom-scrollbar text-stone-900 placeholder-stone-400"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* STARTING BID */}
              <div>
                <label className="text-sm font-bold text-stone-600 block mb-2 uppercase tracking-wider">Starting Bid (₹)</label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 font-bold">₹</span>
                  <input
                    type="number"
                    placeholder="0.00"
                    value={form.currentBid}
                    onChange={(e) => setForm({ ...form, currentBid: e.target.value })}
                    className="w-full bg-stone-50 border border-stone-200 py-4 pl-10 pr-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-bold text-lg text-stone-900 placeholder-stone-400"
                    required
                    min="1"
                  />
                </div>
              </div>

              {/* END TIME */}
              <div>
                <label className="text-sm font-bold text-stone-600 block mb-2 uppercase tracking-wider">End Date & Time</label>
                <input
                  type="datetime-local"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full bg-stone-50 border border-stone-200 p-4 rounded-2xl outline-none focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/20 transition-all font-medium text-stone-900"
                  required
                />
              </div>
            </div>

            {/* SUBMIT BUTTON */}
            <button 
              type="submit" 
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-indigo-600 to-indigo-800 hover:from-indigo-700 hover:to-indigo-900 text-white py-4 rounded-2xl text-lg font-bold shadow-lg shadow-indigo-500/30 transition-all duration-300 hover:-translate-y-1 mt-6 disabled:opacity-70 disabled:hover:translate-y-0 flex justify-center items-center h-[60px]"
            >
              {isLoading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                "List Product"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreateAuction