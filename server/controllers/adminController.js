const User = require("../models/User")
const Auction = require("../models/Auction")

exports.getMetrics = async (req, res) => {
  try {
    const usersCount = await User.countDocuments()
    const auctions = await Auction.find()
    const activeAuctionsCount = auctions.filter(a => a.status !== "closed").length
    const totalRevenue = auctions.filter(a => a.status === "closed").reduce((acc, curr) => acc + (curr.currentBid || 0), 0)

    res.json({
      usersCount,
      activeAuctionsCount,
      totalRevenue
    })
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password")
    res.json(users)
  } catch (error) {
    res.status(500).json(error)
  }
}

exports.deleteUser = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id)
    res.json({ message: "User deleted successfully" })
  } catch (error) {
    res.status(500).json(error)
  }
}
