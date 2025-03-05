const express = require("express");
const { logIn, refreshToken } = require("../controllers/login");
const { signUp, sendOTP } = require("../controllers/register");
const { auth } = require("../middleware/auth");
const { createOrder, getOrderDetails } = require("../controllers/order");
const { createProduct, updateProduct, deleteProduct } = require("../controllers/product");
const Router = express.Router();

// authentication
Router.post("/auth/login",logIn);
Router.post("/auth/register",signUp);
Router.post("/auth/emailVerify",sendOTP);
Router.post("/auth/refresh",refreshToken);

// order management
Router.post("/orders", auth, createOrder);
Router.get("/orders/:id", auth, getOrderDetails); 

// product
Router.post("/products", createProduct);
Router.put("/products/:id", updateProduct);
Router.delete("/products/:id", deleteProduct);

module.exports = Router;