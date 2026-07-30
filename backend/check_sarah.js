const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function checkSarah() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const usersCollection = mongoose.connection.collection("users");
    const user = await usersCollection.findOne({ email: "sarah@estatecrm.pk" });

    if (user) {
      const isAgent123 = await bcrypt.compare(
        "agent123@password",
        user.password,
      );
      const isPass123 = await bcrypt.compare("password123", user.password);
      console.log("Sarah password matches 'agent123@password':", isAgent123);
      console.log("Sarah password matches 'password123':", isPass123);
    } else {
      console.log("Sarah not found");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

checkSarah();
