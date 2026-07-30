const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function checkDetailed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const usersCollection = mongoose.connection.collection("users");

    // Find all users to see what's there
    const allUsers = await usersCollection.find({}).toArray();
    console.log("Found", allUsers.length, "users.");

    allUsers.forEach((u) => {
      console.log(
        `Email: [${u.email}], Role: ${u.role}, Active: ${u.isActive}`,
      );
    });

    const email = "admin@estatecrm.pk";
    const user = await usersCollection.findOne({ email });

    if (user) {
      console.log("Admin user found.");
      const isMatch = await bcrypt.compare("admin123@password", user.password);
      console.log("Password 'admin123@password' match result:", isMatch);
    } else {
      console.log("Admin user NOT found by email:", email);
    }

    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkDetailed();
