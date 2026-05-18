// client/src/App.jsx

import {
  BrowserRouter,
  Routes,
  Route,
} from "react-router-dom"

import Home from "./pages/Home"

import Login from "./pages/Login"

import Register from "./pages/Register"

import CreateAuction from "./pages/CreateAuction"

import AuctionDetails from "./pages/AuctionDetails"

import Dashboard from "./pages/Dashboard"
import AdminDashboard from "./pages/AdminDashboard"
import GlobalListener from "./components/GlobalListener"

function App() {

  return (

    <BrowserRouter>
      <GlobalListener />

      <Routes>

        {/* AUTH */}

        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/register"
          element={<Register />}
        />

        {/* HOME */}

        <Route
          path="/home"
          element={<Home />}
        />

        {/* CREATE AUCTION */}

        <Route
          path="/create"
          element={<CreateAuction />}
        />

        {/* AUCTION DETAILS */}

        <Route
          path="/auction/:id"
          element={<AuctionDetails />}
        />

        {/* DASHBOARD */}

        <Route
          path="/dashboard"
          element={<Dashboard />}
        />

        {/* ADMIN DASHBOARD */}

        <Route
          path="/admin"
          element={<AdminDashboard />}
        />

      </Routes>

    </BrowserRouter>
  )
}

export default App