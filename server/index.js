require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const Product = require("./models/product");
const User = require("./models/User");
const Employee = require("./models/Employee");

const app = express();
const PORT = process.env.PORT || 5000;

// =========================
// MIDDLEWARE
// =========================

app.use(cors());
app.use(express.json());

// =========================
// JWT AUTHENTICATION
// =========================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Please log in to access this resource.",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({
      message: "Your session is invalid or expired. Please log in again.",
    });
  }
}

// =========================
// TEST API
// =========================

app.get("/", (req, res) => {
  res.send("Pro Business API is running!");
});

// =========================
// USERS: REGISTER
// =========================

app.post("/api/auth/register", async (req, res) => {
  try {
    const { fullName, email, password } = req.body;

    if (
      typeof fullName !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !fullName.trim() ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please complete all required fields.",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        message: "Password must be at least 8 characters.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication is not configured.",
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
    });

    res.status(201).json({
      message: "Account created successfully!",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An account with this email already exists.",
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      message: "Registration failed. Please try again.",
    });
  }
});

// =========================
// USERS: LOGIN
// =========================

app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        message: "Please enter your email and password.",
      });
    }

    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        message: "Authentication is not configured.",
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase(),
    });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const passwordMatches = await bcrypt.compare(password, user.password);

    if (!passwordMatches) {
      return res.status(401).json({
        message: "Invalid email or password.",
      });
    }

    const token = jwt.sign(
      { userId: user._id.toString() },
      process.env.JWT_SECRET,
      { expiresIn: "1d" },
    );

    res.json({
      message: "Login successful!",
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
      },
    });
  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      message: "Login failed. Please try again.",
    });
  }
});

// =========================
// PRODUCTS: READ
// =========================

app.get("/api/products", authenticateToken, async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1,
    });

    res.json(products);
  } catch (error) {
    console.error("Product fetch error:", error.message);

    res.status(500).json({
      message: "Failed to fetch products.",
    });
  }
});

// =========================
// PRODUCTS: CREATE
// =========================

app.post("/api/products", authenticateToken, async (req, res) => {
  try {
    const { name, price, description, category, sku, rating, stockQuantity } =
      req.body;

    if (
      typeof name !== "string" ||
      !name.trim() ||
      price === undefined ||
      price === "" ||
      !Number.isFinite(Number(price)) ||
      Number(price) < 0
    ) {
      return res.status(400).json({
        message: "Please provide a valid product name and price.",
      });
    }

    const product = await Product.create({
      name: name.trim(),
      price: Number(price),
      description,
      category,
      sku: typeof sku === "string" && sku.trim() ? sku.trim() : undefined,
      rating,
      stockQuantity,
    });

    res.status(201).json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This product SKU already exists.",
      });
    }

    res.status(400).json({
      message: "Failed to create product.",
      error: error.message,
    });
  }
});

// =========================
// PRODUCTS: UPDATE
// =========================

app.put("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const { name, price, description, category, sku, rating, stockQuantity } =
      req.body;

    const updates = {};

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return res.status(400).json({
          message: "Product name cannot be empty.",
        });
      }

      updates.name = name.trim();
    }

    if (price !== undefined) {
      if (
        price === "" ||
        !Number.isFinite(Number(price)) ||
        Number(price) < 0
      ) {
        return res.status(400).json({
          message: "Please enter a valid price.",
        });
      }

      updates.price = Number(price);
    }

    if (description !== undefined) {
      updates.description = description;
    }

    if (category !== undefined) {
      updates.category = category;
    }

    if (sku !== undefined) {
      updates.sku =
        typeof sku === "string" && sku.trim() ? sku.trim() : undefined;
    }

    if (rating !== undefined) {
      updates.rating = rating;
    }

    if (stockQuantity !== undefined) {
      updates.stockQuantity = stockQuantity;
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json(product);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "This product SKU already exists.",
      });
    }

    res.status(400).json({
      message: "Failed to update product.",
      error: error.message,
    });
  }
});

// =========================
// PRODUCTS: DELETE
// =========================

app.delete("/api/products/:id", authenticateToken, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        message: "Product not found.",
      });
    }

    res.json({
      message: "Product deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete product.",
    });
  }
});

// =========================
// EMPLOYEES: READ AND SEARCH
// =========================

app.get("/api/employees", authenticateToken, async (req, res) => {
  try {
    const search = String(req.query.search || "").slice(0, 100);

    const employees = await Employee.find({
      $or: [
        { fullName: { $regex: search, $options: "i" } },
        { position: { $regex: search, $options: "i" } },
      ],
    }).sort({
      createdAt: -1,
    });

    res.json(employees);
  } catch (error) {
    console.error("Employee fetch error:", error.message);

    res.status(500).json({
      message: "Failed to fetch employees.",
    });
  }
});

// =========================
// EMPLOYEES: CREATE
// =========================

app.post("/api/employees", authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone, position, salary, status } = req.body;

    const employee = await Employee.create({
      fullName,
      email,
      phone,
      position,
      salary,
      status,
    });

    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this email already exists.",
      });
    }

    res.status(400).json({
      message: "Failed to create employee.",
      error: error.message,
    });
  }
});

// =========================
// EMPLOYEES: UPDATE
// =========================

app.put("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const { fullName, email, phone, position, salary, status } = req.body;

    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      {
        fullName,
        email,
        phone,
        position,
        salary,
        status,
      },
      {
        new: true,
        runValidators: true,
      },
    );

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    res.json(employee);
  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({
        message: "An employee with this email already exists.",
      });
    }

    res.status(400).json({
      message: "Failed to update employee.",
    });
  }
});

// =========================
// EMPLOYEES: DELETE
// =========================

app.delete("/api/employees/:id", authenticateToken, async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);

    if (!employee) {
      return res.status(404).json({
        message: "Employee not found.",
      });
    }

    res.json({
      message: "Employee deleted successfully.",
    });
  } catch (error) {
    res.status(400).json({
      message: "Failed to delete employee.",
    });
  }
});

// =========================
// START SERVER
// =========================

async function startServer() {
  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is missing from the .env file.");
    }

    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI is missing from the .env file.");
    }

    await mongoose.connect(process.env.MONGO_URI);

    console.log("MongoDB connected successfully");

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();
