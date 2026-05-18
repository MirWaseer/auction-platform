const Auction = require("../models/Auction")
const ProxyBid = require("../models/ProxyBid")

// Helper function to process auto-bids
const processAutoBids = async (auction) => {
  let hasNewAutoBid = true;
  // Keep looping while there are proxy bids pushing the price up
  while(hasNewAutoBid) {
    hasNewAutoBid = false;
    
    // Find all proxy bids for this auction that are higher than current bid
    const proxyBids = await ProxyBid.find({ 
      auctionId: auction._id, 
      bidder: { $ne: auction.highestBidder } // Don't bid against yourself
    }).sort({ maxAmount: 1 });

    for (const proxy of proxyBids) {
      if (proxy.maxAmount > auction.currentBid) {
        // Minimum increment
        const increment = 500;
        let newBidAmount = auction.currentBid + increment;
        
        // Cap the bid at their max amount
        if (newBidAmount > proxy.maxAmount) {
          newBidAmount = proxy.maxAmount;
        }

        auction.currentBid = newBidAmount;
        auction.highestBidder = proxy.bidder;
        auction.bids.unshift({
          bidder: proxy.bidder,
          amount: newBidAmount
        });
        hasNewAutoBid = true;
        
        // Break to re-evaluate all proxy bids since the highestBidder changed
        break; 
      }
    }
  }
  return auction;
}

exports.placeBid = async (req, res) => {
  try {
    const { auctionId, bidder, amount } = req.body;
    let auction = await Auction.findById(auctionId);

    if (!auction) return res.status(404).json({ message: "Auction not found" });
    if (auction.status !== "open") return res.status(400).json({ message: "Auction closed" });
    if (Number(amount) <= auction.currentBid) return res.status(400).json({ message: "Bid must be higher than current bid" });

    // Anti-Sniping: If bid is placed with less than 60 seconds remaining, extend by 2 minutes
    const now = new Date();
    const endTime = new Date(auction.endTime);
    if (endTime.getTime() - now.getTime() < 60000) { // 60 seconds
      auction.endTime = new Date(endTime.getTime() + 120000); // add 2 mins
    }

    const previousHighestBidder = auction.highestBidder;
    auction.currentBid = Number(amount);
    auction.highestBidder = bidder;
    auction.bids.unshift({ bidder, amount: Number(amount) });

    // Process Auto Bids
    auction = await processAutoBids(auction);
    await auction.save();

    res.json({
      auction,
      previousHighestBidder
    });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}

exports.setProxyBid = async (req, res) => {
  try {
    const { auctionId, bidder, maxAmount } = req.body;
    let proxy = await ProxyBid.findOne({ auctionId, bidder });
    
    if (proxy) {
      proxy.maxAmount = maxAmount;
      await proxy.save();
    } else {
      proxy = await ProxyBid.create({ auctionId, bidder, maxAmount });
    }

    let auction = await Auction.findById(auctionId);
    if (auction.highestBidder !== bidder && maxAmount > auction.currentBid) {
      const previousHighestBidder = auction.highestBidder;
      auction = await processAutoBids(auction);
      await auction.save();
      return res.json({ message: "Proxy bid set successfully", proxy, auction, previousHighestBidder });
    }

    res.json({ message: "Proxy bid set successfully", proxy, auction });
  } catch (error) {
    console.log(error);
    res.status(500).json(error);
  }
}