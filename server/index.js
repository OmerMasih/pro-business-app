const express = require("express");
const cors = require("cors");

const app = express();

const PORT = 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("Pro Business API is running!");
});

app.get("/api/products", (req, res) => {
  const products = [
    {
      id: 1,
      name: "Laptop",
      price: 899.99,
    },
    {
      id: 2,
      name: "Office Chair",
      price: 249.99,
    },
    {
      id: 3,
      name: "Desk",
      price: 399.99,
    },
  ];

  res.json(products);
});

app.post("/api/products", (req, res) => {
  const { name, price } = req.body;

  res.json({
    message: "Product received successfully",
    product: {
      name: name,
      price: price,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
