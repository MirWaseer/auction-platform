// server/controllers/auctionController.js

const Auction = require("../models/Auction")

exports.createAuction = async (
  req,
  res
) => {

  try {
    const auctionData = { ...req.body }
    if (req.file) {
      const protocol = req.protocol
      const host = req.get("host")
      auctionData.image = req.file.filename
    }

    const auction =
      await Auction.create(auctionData)

    res.status(201).json(auction)

  } catch (error) {

    res.status(500).json(error)
  }
}

exports.getAuctions = async (
  req,
  res
) => {

  try {

    const auctions =
      await Auction.find()

    res.json(auctions)

  } catch (error) {

    res.status(500).json(error)
  }
}

exports.getAuctionById = async (
  req,
  res
) => {

  try {

    const auction =
      await Auction.findById(
        req.params.id
      )

    res.json(auction)

  } catch (error) {

    res.status(500).json(error)
  }
}

/* DELETE */

exports.deleteAuction = async (
  req,
  res
) => {

  try {

    await Auction.findByIdAndDelete(
      req.params.id
    )

    res.json({
      message: "Auction Deleted",
    })

  } catch (error) {

    res.status(500).json(error)
  }
}

/* CLOSE */

exports.closeAuction = async (
  req,
  res
) => {

  try {

    const auction =
      await Auction.findById(
        req.params.id
      )

    auction.status = "closed"

    await auction.save()

    res.json({
      message: "Auction Closed",
    })

  } catch (error) {

    res.status(500).json(error)
  }
}

/* PAY */
exports.markAuctionPaid = async (req, res) => {
  try {
    const auction = await Auction.findById(req.params.id)
    auction.paymentStatus = "paid"
    await auction.save()
    res.json({ message: "Payment successful", auction })
  } catch (error) {
    res.status(500).json(error)
  }
}

/* ADD COMMENT */
exports.postComment = async (req, res) => {
  try {
    const { user, avatar, text } = req.body;
    const auction = await Auction.findById(req.params.id);
    
    if (!auction) {
      return res.status(404).json({ message: "Auction not found" });
    }

    const comment = { user, avatar, text };
    auction.comments.push(comment);
    await auction.save();

    res.status(201).json(auction);
  } catch (error) {
    res.status(500).json(error);
  }
}