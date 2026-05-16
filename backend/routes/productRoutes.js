const express = require("express");
const mongoose = require("mongoose");
const Product = require("../models/Product");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();


// ================= CREATE PRODUCT =================
router.post("/", protect, admin, async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collection,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
    } = req.body;

    if (!name || price === undefined) {
      return res.status(400).json({ message: "Name and price are required" });
    }

    const product = new Product({
      name,
      description,
      price,
      discountPrice,
      countInStock,
      category,
      brand,
      sizes,
      colors,
      collection,
      material,
      gender,
      images,
      isFeatured,
      isPublished,
      tags,
      dimensions,
      weight,
      sku,
      user: req.user._id,
    });

    const createdProduct = await product.save();
    res.status(201).json(createdProduct);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= UPDATE PRODUCT =================
router.put("/:id", protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const fields = req.body;

    Object.keys(fields).forEach((key) => {
      if (fields[key] !== undefined) {
        product[key] = fields[key];
      }
    });

    const updatedProduct = await product.save();
    res.json(updatedProduct);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= DELETE PRODUCT =================
router.delete("/:id", protect, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    await product.deleteOne();
    res.json({ message: "Product removed" });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= BEST SELLER =================
router.get("/best-seller", async (req, res) => {
  try {
    const product = await Product.findOne().sort({ rating: -1 });

    if (!product) {
      return res.status(404).json({ message: "No product found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= NEW ARRIVALS =================
router.get("/new-arrivals", async (req, res) => {
  try {
    const products = await Product.find()
      .sort({ createdAt: -1 })
      .limit(8);

    res.json(products);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= SIMILAR PRODUCTS =================
router.get("/similar/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const similarProducts = await Product.find({
      _id: { $ne: id },
      category: product.category,
      gender: product.gender,
    }).limit(4);

    res.json(similarProducts);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= GET ALL PRODUCTS =================
router.get("/", async (req, res) => {
  try {
    const {
      collection,
      size,
      colors,
      gender,
      minPrice,
      maxPrice,
      sortBy,
      search,
      category,
      material,
      brand,
      page = 1,
      limit = 10,
    } = req.query;

    let query = {};
    let sort = {};

    if (collection && collection !== "all") query.collection = collection;
    if (category && category !== "all") query.category = category;
    if (material) query.material = { $in: material.split(",") };
    if (brand) query.brand = { $in: brand.split(",") };
    if (size) query.sizes = { $in: size.split(",") };
    if (colors) query.colors = { $in: colors.split(",") };
    if (gender) query.gender = gender;

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    if (sortBy === "priceAsc") sort.price = 1;
    if (sortBy === "priceDesc") sort.price = -1;
    if (sortBy === "popularity") sort.rating = -1;

    const pageNumber = Number(page);
    const pageSize = Number(limit);

    const total = await Product.countDocuments(query);

    const products = await Product.find(query)
      .sort(sort)
      .skip((pageNumber - 1) * pageSize)
      .limit(pageSize);

    res.json({
      products,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      total,
    });

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


// ================= GET PRODUCT BY ID =================
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(req.params.id).populate("user", "name email");

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    res.json(product);

  } catch (error) {
    res.status(500).json({ message: "Server Error", error: error.message });
  }
});


module.exports = router;