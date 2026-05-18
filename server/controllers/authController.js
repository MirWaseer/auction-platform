const User = require("../models/User")

const bcrypt = require("bcryptjs")

const jwt = require("jsonwebtoken")

exports.register = async (req, res) => {

  try {

    const {
      name,
      email,
      password,
    } = req.body

    const existingUser =
      await User.findOne({ email })

    if (existingUser) {

      return res.status(400).json({
        message: "User already exists",
      })
    }

    const hashedPassword =
      await bcrypt.hash(password, 10)

    const user = await User.create({

      name,

      email,

      password: hashedPassword,
    })

    res.status(201).json(user)

  } catch (error) {

    res.status(500).json(error)
  }
}

exports.login = async (req, res) => {

  try {

    const {
      email,
      password,
    } = req.body

    const user =
      await User.findOne({ email })

    if (!user) {

      return res.status(400).json({
        message: "Invalid Credentials",
      })
    }

    const isMatch =
      await bcrypt.compare(
        password,
        user.password
      )

    if (!isMatch) {

      return res.status(400).json({
        message: "Invalid Credentials",
      })
    }

    const token = jwt.sign(

      {
        id: user._id,
      },

      process.env.JWT_SECRET,

      {
        expiresIn: "7d",
      }
    )

    res.json({

      token,

      user,
    })

  } catch (error) {
    res.status(500).json(error)
  }
}

exports.updateProfilePhoto = async (req, res) => {
  try {
    const { email } = req.body
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" })
    }

    const protocol = req.protocol
    const host = req.get("host")
    const avatarUrl = `${protocol}://${host}/uploads/${req.file.filename}`

    const user = await User.findOneAndUpdate(
      { email },
      { avatar: avatarUrl },
      { new: true }
    )

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error(error)
    res.status(500).json(error)
  }
}