import mongoose from "mongoose";

const CartSchema = new mongoose.Schema(
  {
    userID: {
      type: String,
      required: true,
      unique: true,
    },
    products: [
      {
        productID: {
          type: String,
        },
        quantity: {
          type: Number,
          default: 1,
        },
        color: {
          type: Array,
        },
        size: {
          type: Array,
        },
      },
    ],
  },
  { timestamps: true }
);

const CartModel = mongoose.model("Cart", CartSchema);
export default CartModel;
