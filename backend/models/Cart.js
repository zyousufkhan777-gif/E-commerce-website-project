const mongoose = require("mongoose");

// ================= CART ITEM =================
const cartItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },

  name: {
    type: String,
    required: true,
  },

  image: {
    type: String,
  },

  price: {
    type: Number,
    required: true,
  },

  size: {
    type: String,
  },

  color: {
    type: String,
  },

  quantity: {
    type: Number,
    default: 1,
    min: 1,
  },
});

// ================= CART =================
const cartSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    guestId: {
      type: String,
    },

    products: [cartItemSchema],

    totalPrice: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Cart", cartSchema);