const express = require("express")

const mongoose = require("mongoose")

const cors = require("cors")

const dotenv = require("dotenv")

const path = require("path")

const http = require("http")

const { Server } = require("socket.io")

const Auction = require("./models/Auction")

dotenv.config()

const app = express()

const server = http.createServer(app)

const io = new Server(server, {

  cors: {
    origin: "*",
  },

})

/* MIDDLEWARE */

app.use(cors())

app.use(express.json())

app.use("/uploads", express.static(path.join(__dirname, "uploads")))

/* DATABASE */

mongoose
  .connect(process.env.MONGO_URI)

  .then(() => {

    console.log("MongoDB Connected")
  })

  .catch((error) => {

    console.log(error)
  })

/* ROUTES */

app.use(
  "/api/auth",
  require("./routes/authRoutes")
)

app.use(
  "/api/auction",
  require("./routes/auctionRoutes")
)

app.use(
  "/api/bid",
  require("./routes/bidRoutes")
)

app.use(
  "/api/admin",
  require("./routes/adminRoutes")
)

/* SOCKET.IO */

io.on("connection", (socket) => {

  console.log("User Connected")

  socket.on("placeBid", (data) => {
    io.emit("newBid", data)
  })

  socket.on("postComment", (data) => {
    io.emit("newComment", data)
  })

  socket.on("disconnect", () => {
    console.log("User Disconnected")
  })
})

/* AUTO CLOSE AUCTIONS */

setInterval(async () => {

  try {

    const now = new Date()

    const auctions =
      await Auction.find({
        status: "open",
      })

    auctions.forEach(async (auction) => {

      if (auction.endTime < now) {

        auction.status = "closed"
        await auction.save()

        io.emit("auctionClosed", {
          auctionId: auction._id,
          title: auction.title,
          highestBidder: auction.highestBidder
        })

        console.log(
          `${auction.title} Auction Ended`
        )
      }
    })

  } catch (error) {

    console.log(error)
  }

}, 10000)

/* SERVER */

const PORT =
  process.env.PORT || 5000

server.listen(PORT, () => {

  console.log(
    `Server running on port ${PORT}`
  )
})