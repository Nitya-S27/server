import CartModel from "../models/Cart.js";
import UserModel from "../models/User.js";
import express from "express";
import {
  verifyToken,
  verifyTokenAndAuthorization,
  verifyTokenAndAdmin,
} from "./verifyToken.js";
import ProductModel from "../models/Product.js";

const router = express.Router();

//CREATE
router.post("/", verifyToken, async (req, res) => {
  const newCart = new CartModel(req.body);

  try {
    const savedCart = await newCart.save();
    res.status(200).json(savedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

// ADD TO CART
router.post("/add", verifyToken, async (req, res) => {
  try {
    const { productID, quantity = 1, color, size } = req.body;
    const foundUser = await UserModel.findOne({ _id: req.user.id });
    if (!foundUser) res.status(404).json("User does not exist!");
    const cart = await CartModel.findOne({ userID: foundUser._id });
    // console.log(req.user);
    if (!cart) {
      const newCart = new CartModel({
        userID: foundUser._id,
        username: foundUser.username,
        products: [{ productID, color, size }],
      });
      await newCart.save();
      return res.status(200).json(newCart);
    }

    const existingProduct = cart.products.find(
      (product) =>
        product.productID === productID &&
        product.color === color &&
        product.size === size
    );

    if (existingProduct) {
      existingProduct.quantity += quantity;
    } else {
      cart.products.push({ productID, color, size });
    }
    await cart.save();
    res.status(200).json(cart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// FETCH CART PRODUCTS BASED ON PRODUCT ID
router.get("/find/:id", verifyToken, async (req, res) => {
  try {
    const foundUser = await UserModel.findOne({ _id: req.params.id });
    if (!foundUser) res.status(404).json("User does not exist!");
    const cart = await CartModel.findOne({ userID: foundUser._id }).populate(
      "products.productID"
    );
    if (!cart) {
      const newCart = new CartModel({
        userID: foundUser._id,
        username: foundUser.username,
        products: [],
      });
      await newCart.save();
      return res.status(200).json(newCart);
    }
    const productDetails = await Promise.all(
      cart.products.map(async (product) => {
        const productDoc = await ProductModel.findById(product.productID);
        return {
          quantity: product.quantity,
          details: productDoc,
        };
      })
    );

    res.json(productDetails);
  } catch (error) {
    console.error("Error fetching cart:", error);
    res.status(500).json({ message: "Internal server error" });
  }
});

//UPDATE
router.put("/:id", verifyToken, async (req, res) => {
  try {
    const userid = req.params.id;
    const updatedCartData = req.body;
    const updatedCart = await CartModel.findByIdAndUpdate(
      userid,
      updatedCartData,
      { new: true }
    );
    if (!updatedCart) {
      return res.status(404).json({ message: "Cart not found" });
    }
    res.status(200).json(updatedCart);
  } catch (err) {
    res.status(500).json(err);
  }
});

//DELETE
router.delete("/:id", verifyTokenAndAuthorization, async (req, res) => {
  try {
    await Cart.findByIdAndDelete(req.params.id);
    res.status(200).json("Cart has been deleted...");
  } catch (err) {
    res.status(500).json(err);
  }
});

//GET ALL
router.get("/", verifyTokenAndAdmin, async (req, res) => {
  try {
    const carts = await CartModel.find();
    res.status(200).json(carts);
  } catch (err) {
    res.status(500).json(err);
  }
});

export default router;
