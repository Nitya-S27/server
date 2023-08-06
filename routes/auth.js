import express from "express";
import UserModel from "../models/User.js";
import CryptoJS from "crypto-js";
import jwt from "jsonwebtoken";

const router = express.Router();

// REGISTER
// TODO : Encrypt the password before using. Here we will use crypto.js. We can also use other libraries like bcrypt

router.post("/register", async (req, res) => {
  const newUser = new UserModel({
    username: req.body.username,
    email: req.body.email,
    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.PASS_KEY
    ).toString(),
    isAdmin: req.body.isAdmin,
  });
  try {
    const savedUser = await newUser.save();
    res.status(201).json(savedUser);
  } catch (err) {
    res.status(500).json("User already exists");
  }
});

// LOGIN
// TODO : on successful logging in, the client will be provided with a web token to authorize its activities on the application
router.post("/login", async (req, res) => {
  try {
    // Check for user existence
    const foundUser = await UserModel.findOne({ username: req.body.username });
    // !foundUser && res.status(401).json("Wrong Credentials");

    // Check for password equality
    const decryptedPassword = CryptoJS.AES.decrypt(
      foundUser.password,
      process.env.PASS_KEY
    );
    const orignalPassword = decryptedPassword.toString(CryptoJS.enc.Utf8);
    const enteredPassword = req.body.password;
    if (!foundUser || orignalPassword !== enteredPassword) {
      return res.status(401).json("Wrong Credentials");
    } else {
      // Generate JWT token
      const accessToken = jwt.sign(
        {
          id: foundUser._id,
          isAdmin: foundUser.isAdmin,
        },
        process.env.JWT_KEY,
        { expiresIn: "2d" }
      );
      // res.setHeader("token", `Bearer ${accessToken}`);

      // Return success if all good
      const { password, ...others } = foundUser._doc; // we will not send password along with the data
      res.status(200).json({ ...others, accessToken });
    }
  } catch (error) {
    res.status(500).json("Wrong Credentials!");
  }
});

export default router;
