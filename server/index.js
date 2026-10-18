require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const Product = require("./models/Product");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// 1. TEST: Check whether the API is running
app.get("/", (req, res) => {
  res.send("Pro Business API is running!");
});

// 2. READ: Get all products
app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch products",
    });
  }
});

// 3. CREATE: Add a new product
app.post("/api/products", async (req, res) => {
  try {
    const { name, price } = req.body;

    const product = await Product.create({
      name,
      price,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(400).json({
      message: "Failed to create product",
      error: error.message,
    });
  }
});

// 4. UPDATE: Edit an existing product
app.put("/api/products/:id", async (req, res) => {
  try {
    const { name, price } = req.body;

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { name, price },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json(product);
  } catch (error) {
    res.status(400).json({
      message: "Failed to update product",
      error: error.message,
    });
  }
});

// 5. DELETE: Remove a product
app.delete("/api/products/:id", async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found",
      });
    }

    res.json({
      message: "Product deleted successfully",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product",
    });
  }
});

// Start the server after connecting to MongoDB
async function startServer() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
  }
}

startServer();
