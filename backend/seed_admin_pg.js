const sequelize = require("./src/config/database");
const { User } = require("./src/models/index");

async function seedAdmin() {
  try {
    await sequelize.authenticate();
    await sequelize.sync(); // ensure tables exist

    const adminEmail = "admin@builderbrick.com";
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ where: { email: adminEmail } });
    
    if (existingAdmin) {
      console.log("Admin user already exists!");
      console.log(`Email: ${adminEmail}`);
      console.log(`Password: admin123`);
      process.exit(0);
    }

    const admin = await User.create({
      name: "Super Admin",
      email: adminEmail,
      password: "admin123", // Will be hashed by Sequelize hook
      role: "admin",
      phone: "03001234567",
      isActive: true
    });

    console.log("Admin user created successfully!");
    console.log(`Email: ${adminEmail}`);
    console.log(`Password: admin123`);
    process.exit(0);
  } catch (error) {
    console.error("Error creating admin user:", error);
    process.exit(1);
  }
}

seedAdmin();
