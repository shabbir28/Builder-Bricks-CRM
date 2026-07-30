const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function resetAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB.");

    const usersCollection = mongoose.connection.collection("users");
    const user = await usersCollection.findOne({ email: "admin@estatecrm.pk" });

    if (!user) {
      console.log("User admin@estatecrm.pk NOT FOUND. Creating it...");
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("admin123@password", salt);
      await usersCollection.insertOne({
        name: "Admin User",
        email: "admin@estatecrm.pk",
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("Admin user created.");
    } else {
      console.log("User found. Resetting password...");
      const salt = await bcrypt.genSalt(12);
      const newHashedPassword = await bcrypt.hash("admin123@password", salt);

      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { password: newHashedPassword, isActive: true } },
      );

      console.log("Password successfully reset to: admin123@password");
    }
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

resetAdmin();
