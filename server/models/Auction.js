const mongoose = require("mongoose")

const auctionSchema = new mongoose.Schema({

  title: String,

  image: String,

  description: String,

  sellerName: String,

  sellerEmail: String,

  category: {
    type: String,
    default: "Other",
  },

  paymentStatus: {
    type: String,
    default: "unpaid",
  },

  currentBid: {
    type: Number,
    default: 0,
  },

  highestBidder: {
    type: String,
    default: "",
  },

  endTime: Date,

  status: {
    type: String,
    default: "open",
  },

  bids: [
    {
      bidder: String,
      amount: Number,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

  comments: [
    {
      user: String,
      avatar: String,
      text: String,
      createdAt: {
        type: Date,
        default: Date.now,
      },
    },
  ],

})

module.exports = mongoose.model(
  "Auction",
  auctionSchema
)