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
    cb(null, "avatar-" + uniqueSuffix + path.extname(file.originalname))
  },
})
const upload = multer({ storage: storage })

const {
  register,
  login,
  updateProfilePhoto
} = require(
  "../controllers/authController"
)

router.post(
  "/register",
  register
)

router.post(
  "/login",
  login
)

router.put(
  "/profile-photo",
  upload.single("avatar"),
  updateProfilePhoto
)

module.exports = router