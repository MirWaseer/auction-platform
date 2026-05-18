import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./index.css"
import { Toaster } from "react-hot-toast"
import { SocketProvider } from "./context/SocketContext"

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <Toaster
      position="top-right"
      reverseOrder={false}
    />

    <SocketProvider>
      <App />
    </SocketProvider>

  </React.StrictMode>
)