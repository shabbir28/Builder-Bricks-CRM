/**
 * Super Admin Seed Script
 * Usage: node backend/seed_super_admin.js
 * 
 * Yeh script ek Super Admin account create karta hai.
 * Pehle .env file check karo ke database credentials sahi hain.
 */
require("dotenv").config({ path: "./backend/.env" });
const sequelize = require("./backend/src/config/database");
require("./backend/src/models/index");
const { User } = require("./backend/src/models/index");

const SUPER_ADMIN = {
  name: "Super Admin",
  email: "superadmin@builderbrick.com",
  password: "SuperAdmin@123",
  role: "super_admin",
  phone: "",
  isActive: true,
};

async function seedSuperAdmin() {
  try {
    console.log("📡 Database se connect ho raha hai...");
    await sequelize.authenticate();
    console.log("✅ Connected!");

    await sequelize.sync({ alter: true });
    console.log("✅ Tables sync ho gayi!");

    const existing = await User.findOne({ where: { email: SUPER_ADMIN.email } });
    if (existing) {
      console.log(`⚠️  Super Admin already exists: ${SUPER_ADMIN.email}`);
      console.log("   Agar role update karna hai to manually DB mein update karo ya existing account delete karo.");
      process.exit(0);
    }

    const user = await User.create(SUPER_ADMIN);
    console.log("✅ Super Admin created successfully!");
    console.log(`   Email: ${SUPER_ADMIN.email}`);
    console.log(`   Password: ${SUPER_ADMIN.password}`);
    console.log(`   Role: super_admin`);
    console.log("\n⚠️  IMPORTANT: Login ke baad password zaroor change karein!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error:", error.message);
    process.exit(1);
  }
}

seedSuperAdmin();
