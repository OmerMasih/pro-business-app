const express = require("express");

const app = express();

const PORT = 5000;

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

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
