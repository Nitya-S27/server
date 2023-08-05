// importing packages using type "module"
import express from "express";
import serverless from "serverless-http";
import mongoose from "mongoose";
import dotenv from "dotenv";
import userRoute from "./routes/user.js";
import authRoute from "./routes/auth.js";
import productRoute from "./routes/product.js";
import cartRoute from "./routes/cart.js";
import orderRoute from "./routes/order.js";
import paymentRoute from "./routes/stripe.js";
import cors from "cors";

// Configure dotenv to use the .env file
dotenv.config();

// create app
const app = express();

// Connect with mongoDB cluster
mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING, {
    useNewUrlParser: "true",
    useUnifiedTopology: "true",
  })
  .then(() => {
    console.log("Succesfully connected to mongoDB");
  })
  .catch((err) => {
    console.log(err);
  });

// CREATE THE REST API ROUTES
// It is not a good practice to write the requests for all the routes in one file so we create a seperate file for routes

// Import the route function and use it
app.use(cors());
app.use(express.json());
app.use("/api/users", userRoute);
app.use("/api/auth", authRoute);
app.use("/api/products", productRoute);
app.use("/api/cart", cartRoute);
app.use("/api/orders", orderRoute);
app.use("/api/checkout", paymentRoute);

// Listen to port
app.listen(process.env.PORT || 5000, () => {
  console.log("Server is up and running on port 5000");
});

// module.exports.handler = serverless(app);
