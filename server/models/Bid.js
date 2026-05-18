const mongoose = require("mongoose")

const bidSchema = new mongoose.Schema({
  auctionId: String,
  bidder: String,
  amount: Number,
  createdAt: {
    type: Date,
    default: Date.now,
  },
})

module.exports = mongoose.model("Bid", bidSchema)