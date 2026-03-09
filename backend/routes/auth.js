const express = require("express")
const bcrypt = require("bcrypt")
const User = require("../models/User")

const router = express.Router()

router.post("/signup", async (req,res)=>{

 const { email, password } = req.body

 const hashedPassword = await bcrypt.hash(password,10)

 const user = new User({
  email,
  password: hashedPassword
 })

 await user.save()

 res.json({message:"User created"})
})

module.exports = router