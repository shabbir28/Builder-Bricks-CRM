const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");

// Fix the path to .env
dotenv.config({ path: path.join(__dirname, ".env") });

async function setup() {
  try {
    const uri = process.env.MONGODB_URI;
    if (!uri)
      throw new Error(
        "MONGODB_URI not found in .env at " + path.join(__dirname, ".env"),
      );

    await mongoose.connect(uri);

    // Use raw collection to avoid model complexity
    const usersCollection = mongoose.connection.collection("users");
    const bcrypt = require("bcryptjs");
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password123", salt);

    // Update Sarah Khan
    const sarahEmail = "sarah@estatecrm.pk";
    await usersCollection.updateOne(
      { email: sarahEmail },
      {
        $set: {
          name: "Sarah Khan",
          password: hashedPassword,
          role: "agent",
          isActive: true,
          updatedAt: new Date(),
        },
      },
      { upsert: true },
    );
    console.log(`Sarah Khan (${sarahEmail}) reset/created with password123`);

    // Ensure we have an admin
    const adminExists = await usersCollection.findOne({ role: "admin" });
    if (!adminExists) {
      const adminEmail = "admin@estatecrm.pk";
      await usersCollection.insertOne({
        name: "System Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log(`Admin created: ${adminEmail} / password123`);
    } else {
      await usersCollection.updateOne(
        { email: adminExists.email },
        { $set: { password: hashedPassword, isActive: true } },
      );
      console.log(`Admin ${adminExists.email} password reset to password123`);
    }

    process.exit(0);
  } catch (error) {
    console.error("CRITICAL ERROR:", error);
    process.exit(1);
  }
}

setup();
