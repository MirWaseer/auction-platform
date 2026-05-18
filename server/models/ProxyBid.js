const mongoose = require("mongoose")

const proxyBidSchema = new mongoose.Schema({
  auctionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Auction",
    required: true,
  },
  bidder: {
    type: String,
    required: true,
  },
  maxAmount: {
    type: Number,
    required: true,
  },
}, { timestamps: true })

module.exports = mongoose.model("ProxyBid", proxyBidSchema)
