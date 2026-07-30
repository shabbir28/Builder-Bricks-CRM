/**
 * Super Admin Seed Script
 * Usage: node src/seedSuperAdmin.js  (from backend/ directory)
 */
require("dotenv").config();
const sequelize = require("./config/database");
require("./models/index");
const { User } = require("./models/index");

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
    console.log("✅ Tables sync ho gayi (including new roles + installment_requests)!");

    const existing = await User.findOne({ where: { email: SUPER_ADMIN.email } });
    if (existing) {
      console.log(`⚠️  Super Admin already exists: ${SUPER_ADMIN.email}`);
      console.log("   Role:", existing.role);
      // Update role to super_admin if it's not already
      if (existing.role !== "super_admin") {
        await existing.update({ role: "super_admin" });
        console.log("✅ Role updated to super_admin");
      }
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
