const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./src/models/User");
const Property = require("./src/models/Property");
const Lead = require("./src/models/Lead");
const Deal = require("./src/models/Deal");

dotenv.config();

const seedData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB for seeding...");

    // Clear existing data
    await User.deleteMany({});
    await Property.deleteMany({});
    await Lead.deleteMany({});
    await Deal.deleteMany({});

    console.log("Cleared existing data.");

    // Create Admin User
    const admin = await User.create({
      name: "Shabbir Ali",
      email: "admin@estatecrm.pk",
      password: "admin123@password",
      role: "admin",
      phone: "0300-1234567",
    });

    const agent = await User.create({
      name: "Sarah Khan",
      email: "sarah@estatecrm.pk",
      password: "agent123@password",
      role: "agent",
      phone: "0321-7654321",
    });

    console.log("Created Users.");

    // Create Properties (Pakistan Specific)
    const properties = await Property.insertMany([
      {
        title: "Emaar Panorama Penthouse",
        description: "Luxury sea-facing penthouse in Phase 8, DHA Karachi.",
        type: "apartment",
        status: "available",
        price: 85000000,
        address: {
          street: "Phase 8, DHA",
          city: "Karachi",
          state: "Sindh",
          country: "Pakistan",
        },
        features: {
          bedrooms: 4,
          bathrooms: 4,
          area: 4500,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80",
            isMain: true,
          },
        ],
        listedBy: admin._id,
        isFeatured: true,
      },
      {
        title: "Gulberg Modern Villa",
        description:
          "Modern architecture villa with swimming pool in Gulberg, Lahore.",
        type: "villa",
        status: "available",
        price: 125000000,
        address: {
          street: "Gulberg III",
          city: "Lahore",
          state: "Punjab",
          country: "Pakistan",
        },
        features: {
          bedrooms: 5,
          bathrooms: 6,
          area: 5400,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1613490493576-7fde63acd811?auto=format&fit=crop&w=800&q=80",
            isMain: true,
          },
        ],
        listedBy: agent._id,
        isFeatured: true,
      },
      {
        title: "Bahria Town House",
        description: "Corner plot double story house in Bahria Town Phase 7.",
        type: "house",
        status: "under-contract",
        price: 45000000,
        address: {
          street: "Phase 7, Bahria Town",
          city: "Islamabad",
          state: "Federal",
          country: "Pakistan",
        },
        features: {
          bedrooms: 4,
          bathrooms: 4,
          area: 2700,
        },
        images: [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
            isMain: true,
          },
        ],
        listedBy: admin._id,
      },
    ]);

    console.log("Inserted Properties.");

    // Create Leads
    const leads = await Lead.insertMany([
      {
        name: "Zubair Ahmed",
        email: "zubair@gmail.com",
        phone: "0333-5556677",
        status: "new",
        source: "website",
        budget: { min: 40000000, max: 60000000 },
        preferredPropertyType: "house",
        preferredLocation: "DHA Lahore",
        assignedAgent: admin._id,
      },
      {
        name: "Fatima Sheikh",
        email: "fatima.s@outlook.com",
        phone: "0312-9988776",
        status: "negotiation",
        source: "referral",
        budget: { min: 70000000, max: 100000000 },
        preferredPropertyType: "apartment",
        preferredLocation: "Karachi South",
        assignedAgent: agent._id,
      },
    ]);

    console.log("Inserted Leads.");

    // Create a Deal
    await Deal.create({
      title: "DHA Phase 8 Sale Protocol",
      lead: leads[1]._id,
      property: properties[0]._id,
      agent: agent._id,
      status: "negotiation",
      dealValue: 82000000,
      commissionRate: 2.5,
      commissionAmount: 2050000,
      expectedClosingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      pipelineStage: "negotiation",
    });

    console.log("Inserted Deal.");
    console.log("Seeding completed successfully!");
    process.exit();
  } catch (error) {
    console.error("Error seeding data:", error);
    process.exit(1);
  }
};

seedData();
