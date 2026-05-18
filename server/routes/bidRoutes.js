const express = require("express")

const router = express.Router()

const {
  placeBid,
  setProxyBid
} = require(
  "../controllers/bidController"
)

router.post(
  "/",
  placeBid
)

router.post(
  "/proxy",
  setProxyBid
)

module.exports = router