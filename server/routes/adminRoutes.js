const express = require("express")
const router = express.Router()

const {
  getMetrics,
  getAllUsers,
  deleteUser
} = require("../controllers/adminController")

router.get("/metrics", getMetrics)
router.get("/users", getAllUsers)
router.delete("/users/:id", deleteUser)

module.exports = router
