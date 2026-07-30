const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

dotenv.config({ path: path.join(__dirname, "backend", ".env") });
const User = require(path.join(__dirname, "backend", "src", "models", "User"));

async function setupSarah() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    const email = "sarah@estatecrm.pk";

    let user = await User.findOne({ email });
    if (user) {
      user.password = "password123";
      await user.save();
      console.log("SUCCESS: Sarah Khan password reset to password123");
    } else {
      await User.create({
        name: "Sarah Khan",
        email: email,
        password: "password123",
        role: "agent",
      });
      console.log("SUCCESS: Sarah Khan account created with password123");
    }
    process.exit(0);
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  }
}

setupSarah();
