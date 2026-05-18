// client/src/components/GlobalListener.jsx
import { useEffect, useState } from "react"
import { useSocket } from "../context/SocketContext"
import toast from "react-hot-toast"
import Confetti from "react-confetti"
import { useWindowSize } from "react-use"

function GlobalListener() {
  const socket = useSocket()
  const { width, height } = useWindowSize()
  const [showConfetti, setShowConfetti] = useState(false)
  const [winMessage, setWinMessage] = useState("")

  useEffect(() => {
    if (!socket) return

    const user = JSON.parse(localStorage.getItem("user"))

    // Outbid Notification
    socket.on("newBid", (data) => {
      // If someone else placed a bid, and we were the previous highest bidder
      if (user && data.bidder !== user.name && data.previousHighestBidder === user.name) {
        toast.error(`You've been outbid on an item!`, {
          icon: '⚠️',
          duration: 5000,
        })
      }
    })

    // Win Celebration
    socket.on("auctionClosed", (data) => {
      if (user && data.highestBidder === user.name) {
        setWinMessage(`Congratulations! You won the ${data.title}!`)
        setShowConfetti(true)
        toast.success(`You won an auction! Check your dashboard.`, { duration: 8000 })
        
        // Hide confetti after 10 seconds
        setTimeout(() => setShowConfetti(false), 10000)
      }
    })

    return () => {
      socket.off("newBid")
      socket.off("auctionClosed")
    }
  }, [socket])

  return (
    <>
      {showConfetti && (
        <div className="fixed inset-0 z-[100] pointer-events-none flex items-center justify-center">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />
          <div className="bg-white/90 backdrop-blur px-8 py-4 rounded-3xl shadow-2xl border border-green-200 animate-bounce mt-32">
            <h2 className="text-2xl font-extrabold text-green-600">🎉 {winMessage} 🎉</h2>
          </div>
        </div>
      )}
    </>
  )
}

export default GlobalListener
