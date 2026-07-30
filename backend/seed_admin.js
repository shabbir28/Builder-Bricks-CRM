const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

async function seedAdmin() {
  try {
    console.log("📡 Connecting to MongoDB...");
    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected to MongoDB Atlas");

    const usersCollection = mongoose.connection.collection("users");

    // Check if admin already exists
    const existing = await usersCollection.findOne({
      email: "admin@estatecrm.pk",
    });
    if (existing) {
      console.log("⚠️  Admin user already exists. Updating password...");
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("admin123@password", salt);
      await usersCollection.updateOne(
        { email: "admin@estatecrm.pk" },
        { $set: { password: hashedPassword, isActive: true, role: "admin" } },
      );
      console.log("✅ Admin password updated successfully!");
    } else {
      console.log("➕ Creating admin user...");
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash("admin123@password", salt);

      await usersCollection.insertOne({
        name: "Admin User",
        email: "admin@estatecrm.pk",
        password: hashedPassword,
        role: "admin",
        phone: "",
        avatar: "",
        isActive: true,
        commission: 2.5,
        totalDeals: 0,
        totalRevenue: 0,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      console.log("✅ Admin user created successfully!");
    }

    console.log("");
    console.log("🎉 Done! You can now log in with:");
    console.log("   Email:    admin@estatecrm.pk");
    console.log("   Password: admin123@password");
    console.log("");
    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedAdmin();
