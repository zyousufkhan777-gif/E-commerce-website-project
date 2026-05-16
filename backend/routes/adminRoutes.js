const express = require("express");
const User = require("../models/User");
const { protect, admin } = require("../middleware/authMiddleware");

const router = express.Router();

// @route   GET /api/admin/users
// @desc    Get all users (Admin only)
// @access  Private/Admin

router.get("/", protect, admin, async (req, res) => {
  try {
    // Exclude password field
    const users = await User.find({}).select("-password");

    res.json(users);
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// @route   POST /api/admin/users
// @desc    Add a new user (Admin only)
// @access  Private/Admin

router.post("/", protect, admin, async (req, res) => {
  const { name, email, password, role } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Please fill all fields",
    });
  }

  try {
    // Check existing user
    let user = await User.findOne({ email });

    if (user) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // Create user
    user = new User({
      name,
      email,
      password,
      role: role || "customer",
    });

    await user.save();

    res.status(201).json({
      message: "User created successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// @route   PUT /api/admin/users/:id
// @desc    Update user info (Admin only)
// @access  Private/Admin

router.put("/:id", protect, admin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (user) {
      // Check duplicate email
      if (req.body.email) {
        const emailExists = await User.findOne({
          email: req.body.email,
          _id: { $ne: req.params.id },
        });

        if (emailExists) {
          return res.status(400).json({
            message: "Email already in use",
          });
        }
      }

      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.role = req.body.role || user.role;

      const updatedUser = await user.save();

      res.json({
        message: "User updated successfully",
        user: {
          _id: updatedUser._id,
          name: updatedUser.name,
          email: updatedUser.email,
          role: updatedUser.role,
        },
      });
    } else {
      res.status(404).json({
        message: "User not found",
      });
    }
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Server Error",
    });
  }
});

// @route   DELETE /api/admin/users/:id
// @desc    Delete user (Admin only)
// @access  Private/Admin

router.delete("/:id", protect, admin, async (req, res) => {
    try {
      const user = await User.findById(req.params.id);
  
      if (user) {
  
        // Prevent admin from deleting himself
        if (user._id.toString() === req.user._id.toString()) {
          return res.status(400).json({
            message: "Admin cannot delete himself",
          });
        }
  
        await user.deleteOne();
  
        res.json({
          message: "User removed successfully",
        });
  
      } else {
        res.status(404).json({
          message: "User not found",
        });
      }
    } catch (error) {
      console.error(error);
  
      res.status(500).json({
        message: "Server Error",
      });
    }
  });



module.exports = router;