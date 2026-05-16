const express = require("express");
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

// ================= HELPER FUNCTION =================
const getCart = async (userId, guestId) => {
  if (userId) {
    return await Cart.findOne({ user: userId });
  } else if (guestId) {
    return await Cart.findOne({ guestId });
  }
  return null;
};

// ================= GET ALL CARTS =================
router.get("/", async (req, res) => {
  try {
    const carts = await Cart.find();
    res.status(200).json(carts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= ADD PRODUCT TO CART =================
router.post("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    if (!quantity || quantity < 1) {
      return res.status(400).json({ message: "Invalid quantity" });
    }

    const qty = Number(quantity);
    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    let cart = await getCart(userId, guestId);

    if (cart) {
      const productIndex = cart.products.findIndex(
        (p) =>
          p.productId.toString() === productId &&
          p.size === size &&
          p.color === color
      );

      if (productIndex > -1) {
        cart.products[productIndex].quantity += qty;
      } else {
        cart.products.push({
          productId,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: product.price,
          size,
          color,
          quantity: qty,
        });
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    }

    const newCart = await Cart.create({
      user: userId ? userId : undefined,
      guestId: guestId ? guestId : "guest_" + new Date().getTime(),
      products: [
        {
          productId,
          name: product.name,
          image: product.images?.[0]?.url || "",
          price: product.price,
          size,
          color,
          quantity: qty,
        },
      ],
      totalPrice: product.price * qty,
    });

    return res.status(201).json(newCart);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
});

// ================= UPDATE PRODUCT IN CART =================
router.put("/", async (req, res) => {
  const { productId, quantity, size, color, guestId, userId } = req.body;

  try {
    let cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not Found" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      if (quantity > 0) {
        cart.products[productIndex].quantity = quantity;
      } else {
        cart.products.splice(productIndex, 1);
      }

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

// ================= DELETE PRODUCT FROM CART =================
router.delete("/", async (req, res) => {
  const { productId, size, color, guestId, userId } = req.body;

  try {
    let cart = await getCart(userId, guestId);

    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    const productIndex = cart.products.findIndex(
      (p) =>
        p.productId.toString() === productId &&
        p.size === size &&
        p.color === color
    );

    if (productIndex > -1) {
      cart.products.splice(productIndex, 1);

      cart.totalPrice = cart.products.reduce(
        (acc, item) => acc + item.price * item.quantity,
        0
      );

      await cart.save();
      return res.status(200).json(cart);
    } else {
      return res.status(404).json({ message: "Product not found in cart" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server Error" });
  }
});

// @route GET /api/cart
//@ desc GET logged-in  user's cart 
//@access Public
router.get("/", async (req, res) => {
    const {userId, guestId} = req.query;

    try{
        const cart = await getCart(userId, guestId);
        if(cart){
            res.json(cart);

        }else{
            res.status(404).json({message: "Cart not found"});
        }
    } catch (error){
        console.error(error);
        res.status(500).json({message: "Server Error"})
    }
});

// ================= MERGE GUEST CART INTO USER CART =================
// @route POST /api/cart/merge
// @desc Merge guest cart into user cart on login
// @access Private (needs authentication)

router.post("/merge", protect, async (req, res) => {
    const { guestId } = req.body;
  
    if (!req.user || !req.user._id) {
      return res.status(401).json({ message: "User not authenticated" });
    }
  
    try {
      const guestCart = await Cart.findOne({ guestId });
      const userCart = await Cart.findOne({ user: req.user._id });
  
      if (guestCart) {
        if (guestCart.products.length === 0) {
          return res.status(400).json({ message: "Guest cart is empty" });
        }
  
        if (userCart) {
          guestCart.products.forEach((guestItem) => {
            const productIndex = userCart.products.findIndex(
              (item) =>
                item.productId.toString() === guestItem.productId.toString() &&
                item.size === guestItem.size &&
                item.color === guestItem.color
            );
  
            if (productIndex > -1) {
              userCart.products[productIndex].quantity += guestItem.quantity;
            } else {
              userCart.products.push(guestItem);
            }
          });
  
          userCart.totalPrice = userCart.products.reduce(
            (acc, item) => acc + item.price * item.quantity,
            0
          );
  
          await userCart.save();
  
          try {
            await Cart.findOneAndDelete({ guestId });
          } catch (error) {
            console.error("Error deleting guest cart:", error);
          }
  
          return res.status(200).json(userCart);
        } else {
          guestCart.user = req.user._id;
          guestCart.guestId = undefined;
          await guestCart.save();
  
          return res.status(200).json(guestCart);
        }
      } else {
        if (userCart) {
          return res.status(200).json(userCart);
        }
        return res.status(404).json({ message: "Guest cart not found" });
      }
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Server Error" });
    }
  });
  
  module.exports = router;



module.exports = router;