// server/routes/auctionRoutes.js

const express = require("express")
const multer = require("multer")
const path = require("path")

const router = express.Router()

// Multer Config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/")
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9)
    cb(null, uniqueSuffix + path.extname(file.originalname))
  },
})

const upload = multer({ storage: storage })

const {

  createAuction,

  getAuctions,

  getAuctionById,

  deleteAuction,

  closeAuction,
  
  markAuctionPaid,

  postComment

} = require(
  "../controllers/auctionController"
)

router.post(
  "/",
  upload.single("image"),
  createAuction
)

router.get(
  "/",
  getAuctions
)

router.get(
  "/:id",
  getAuctionById
)

router.delete(
  "/:id",
  deleteAuction
)

router.put(
  "/close/:id",
  closeAuction
)

router.put(
  "/pay/:id",
  markAuctionPaid
)

router.post(
  "/comment/:id",
  postComment
)

module.exports = router