const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Load environment variables
dotenv.config({ path: path.join(__dirname, "backend", ".env") });

// Import User model using absolute path
const User = require(path.join(__dirname, "backend", "src", "models", "User"));

async function createAgent() {
  try {
    if (!process.env.MONGO_URI) {
      throw new Error("MONGO_URI not found in .env file");
    }

    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to Database...");

    const email = "agent@test.com";
    const existing = await User.findOne({ email });

    if (existing) {
      console.log(`Agent account already exists: ${email}`);
      process.exit(0);
    }

    await User.create({
      name: "Operational Agent",
      email: email,
      password: "password123",
      role: "agent",
    });

    console.log("SUCCESS: Agent account created successfully.");
    console.log(`Email: ${email}`);
    console.log("Password: password123");
    process.exit(0);
  } catch (error) {
    console.error("Error creating agent:", error.message);
    process.exit(1);
  }
}

createAgent();
