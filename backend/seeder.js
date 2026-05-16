const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/User");
const Product = require("./models/Product");
const products = require("./data/products");
const Cart = require("./models/Cart")

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    await Product.deleteMany();
    await User.deleteMany();
    await Cart.deleteMany();


    const createdUser = await User.create({
      name: "Admin User",
      email: "newsers123@gmail.com",
      password: "123456",
      role: "admin",
    });

    const userID = createdUser._id;

    const sampleProducts = products.map((product) => {
      return { ...product, user: userID };
    });

    await Product.insertMany(sampleProducts);

    console.log("✅ Product data seeded successfully!");

    await mongoose.connection.close();
    process.exit();

  } catch (error) {
    console.error("❌ Error seeding the data:", error);
    process.exit(1);
  }
};

seedData();