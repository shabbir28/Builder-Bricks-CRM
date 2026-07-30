const mongoose = require("mongoose");
require("dotenv").config();

// ── Inline schemas (avoids import path issues) ───────────────────────────────

const propertySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["apartment", "house", "villa", "commercial", "land"],
      required: true,
    },
    
    status: {
      type: String,
      enum: ["available", "sold", "rented", "under-contract"],
      default: "available",
    },
    price: { type: Number, required: true, min: 0 },
    address: {
      street: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, trim: true },
      zipCode: { type: String, trim: true },
      country: { type: String, default: "Pakistan" },
    },
    features: {
      bedrooms: { type: Number, min: 0 },
      bathrooms: { type: Number, min: 0 },
      area: { type: Number, required: true, min: 0 },
      parking: { type: Number, min: 0, default: 0 },
    },
    images: [{ url: String, isMain: Boolean }],
    listedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    views: { type: Number, default: 0 },
    isFeatured: { type: Boolean, default: false },
  },
  { timestamps: true },
);

const leadSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    source: {
      type: String,
      enum: [
        "website",
        "facebook",
        "instagram",
        "referral",
        "social",
        "email",
        "phone",
        "walk-in",
        "other",
      ],
      default: "website",
    },
    status: {
      type: String,
      enum: ["new", "contacted", "visit", "negotiation", "closed", "lost"],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    budget: {
      min: { type: Number, default: 0 },
      max: { type: Number, default: 0 },
    },
    preferredPropertyType: {
      type: String,
      enum: ["apartment", "house", "villa", "commercial", "land", "other"],
      default: "apartment",
    },
    preferredLocation: { type: String, trim: true },
    assignedAgent: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    notes: { type: String, trim: true },
  },
  { timestamps: true },
);

const Property = mongoose.model("Property", propertySchema);
const Lead = mongoose.model("Lead", leadSchema);

// ── Seed Data ────────────────────────────────────────────────────────────────

const PROPERTIES = [
  {
    title: "3-Bed Luxury Apartment – DHA Phase 6",
    description:
      "Spacious corner apartment on 5th floor with panoramic city views, modern kitchen, and 24/7 security in DHA Phase 6.",
    type: "apartment",
    status: "available",
    price: 12500000,
    address: {
      street: "Main Boulevard",
      city: "Lahore",
      state: "Punjab",
      country: "Pakistan",
    },
    features: { bedrooms: 3, bathrooms: 3, area: 1850, parking: 1 },
  },
  {
    title: "5-Bed Villa – Bahria Town Phase 4",
    description:
      "Double storey furnished villa in gated community. Includes lawn, garage, and premium fixtures throughout.",
    type: "villa",
    status: "available",
    price: 28000000,
    address: {
      street: "Jasmine Block",
      city: "Lahore",
      state: "Punjab",
      country: "Pakistan",
    },
    features: { bedrooms: 5, bathrooms: 5, area: 4500, parking: 2 },
  },
  {
    title: "Commercial Office – Gulberg II",
    description:
      "Prime commercial space on ground floor of Business Hub Gulberg. Ideal for corporate offices, showrooms, or clinics.",
    type: "commercial",
    status: "available",
    price: 35000000,
    address: {
      street: "MM Alam Road",
      city: "Lahore",
      state: "Punjab",
      country: "Pakistan",
    },
    features: { bedrooms: 0, bathrooms: 2, area: 2800, parking: 3 },
  },
  {
    title: "2-Bed Apartment – E-11 Islamabad",
    description:
      "Brand new apartment in a premium high-rise in E-11. Close to F-10 Markaz, excellent views and modern amenities.",
    type: "apartment",
    status: "available",
    price: 8500000,
    address: {
      street: "E-11/4",
      city: "Islamabad",
      state: "ICT",
      country: "Pakistan",
    },
    features: { bedrooms: 2, bathrooms: 2, area: 1200, parking: 1 },
  },
  {
    title: "1-Kanal Plot – DHA Phase 8 Karachi",
    description:
      "Residential plot in DHA Phase 8 with clear title. Ideal for construction of custom villa. All utilities available.",
    type: "land",
    status: "available",
    price: 55000000,
    address: {
      street: "Bukhari Commercial",
      city: "Karachi",
      state: "Sindh",
      country: "Pakistan",
    },
    features: { bedrooms: 0, bathrooms: 0, area: 10000, parking: 0 },
  },
  {
    title: "4-Bed House – F-7 Markaz Islamabad",
    description:
      "Fully renovated single storey house in the heart of F-7. Walking distance from F-7 Markaz commercial area.",
    type: "house",
    status: "available",
    price: 42000000,
    address: {
      street: "Street 14",
      city: "Islamabad",
      state: "ICT",
      country: "Pakistan",
    },
    features: { bedrooms: 4, bathrooms: 4, area: 3200, parking: 2 },
  },
];

const LEADS = [
  {
    name: "Ahmed Raza",
    email: "ahmed.raza@gmail.com",
    phone: "0300-1234567",
    source: "referral",
    status: "new",
    priority: "high",
    budget: { min: 10000000, max: 15000000 },
    preferredPropertyType: "apartment",
    preferredLocation: "DHA Lahore",
    notes: "Looking for a 3-bed apartment. Can close quickly.",
  },
  {
    name: "Fatima Malik",
    email: "fatima.malik@outlook.com",
    phone: "0321-9876543",
    source: "website",
    status: "contacted",
    priority: "medium",
    budget: { min: 20000000, max: 35000000 },
    preferredPropertyType: "villa",
    preferredLocation: "Bahria Town Lahore",
    notes: "Prefers furnished. Needs guest room.",
  },
  {
    name: "Bilal Hussain",
    email: "bilal.h@business.pk",
    phone: "0333-4455667",
    source: "phone",
    status: "negotiation",
    priority: "high",
    budget: { min: 30000000, max: 50000000 },
    preferredPropertyType: "commercial",
    preferredLocation: "Gulberg Lahore",
    notes: "Wants to open a medical clinic. Ground floor essential.",
  },
  {
    name: "Zara Sheikh",
    email: "zara.sheikh@yahoo.com",
    phone: "0345-1122334",
    source: "social",
    status: "visit",
    priority: "medium",
    budget: { min: 6000000, max: 10000000 },
    preferredPropertyType: "apartment",
    preferredLocation: "Islamabad",
    notes: "Young professional, remote worker. Wants fiber internet.",
  },
  {
    name: "Hassan Nawaz",
    email: "hassan.nawaz@corp.com",
    phone: "0311-7788990",
    source: "referral",
    status: "new",
    priority: "high",
    budget: { min: 40000000, max: 60000000 },
    preferredPropertyType: "house",
    preferredLocation: "F-7 Islamabad",
    notes: "Cash buyer. Decision maker. Call mornings only.",
  },
  {
    name: "Sara Khan",
    email: "sara.khan@gmail.com",
    phone: "0312-6655443",
    source: "walk-in",
    status: "contacted",
    priority: "low",
    budget: { min: 5000000, max: 9000000 },
    preferredPropertyType: "apartment",
    preferredLocation: "Bahria Town",
    notes: "First time buyer. Needs guidance on process.",
  },
];

// ── Runner ──────────────────────────────────────────────────────────────────

async function seedAll() {
  try {
    console.log("─────────────────────────────────────────");
    console.log("🌱 CRM Data Seeder");
    console.log("─────────────────────────────────────────");
    console.log("📡 Connecting to MongoDB...");

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 10000,
    });
    console.log("✅ Connected!\n");

    // Get the admin user to link as listedBy
    const usersCol = mongoose.connection.collection("users");
    const admin = await usersCol.findOne({ role: "admin" });
    if (!admin) {
      console.error("❌ No admin user found. Run 'node seed_admin.js' first.");
      process.exit(1);
    }
    console.log(`👤 Using admin: ${admin.email}`);

    // ── Seed Properties ────────────────────────────────────────────────────
    console.log("\n📦 Seeding properties...");
    let propInserted = 0;
    let propSkipped = 0;
    for (const prop of PROPERTIES) {
      const exists = await Property.findOne({ title: prop.title });
      if (exists) {
        console.log(`   ⏭  Skip (already exists): ${prop.title}`);
        propSkipped++;
        continue;
      }
      await Property.create({ ...prop, listedBy: admin._id });
      console.log(`   ✅ Added: ${prop.title}`);
      propInserted++;
    }
    console.log(
      `\n   Properties: ${propInserted} added, ${propSkipped} skipped`,
    );

    // ── Seed Leads ─────────────────────────────────────────────────────────
    console.log("\n👥 Seeding leads...");
    let leadInserted = 0;
    let leadSkipped = 0;
    for (const lead of LEADS) {
      const exists = await Lead.findOne({ phone: lead.phone });
      if (exists) {
        console.log(`   ⏭  Skip (already exists): ${lead.name}`);
        leadSkipped++;
        continue;
      }
      await Lead.create({ ...lead, assignedAgent: admin._id });
      console.log(`   ✅ Added: ${lead.name}`);
      leadInserted++;
    }
    console.log(`\n   Leads: ${leadInserted} added, ${leadSkipped} skipped`);

    // ── Summary ────────────────────────────────────────────────────────────
    const totalProps = await Property.countDocuments();
    const totalLeads = await Lead.countDocuments();

    console.log("\n─────────────────────────────────────────");
    console.log("🎉 Seeding complete!");
    console.log(`   📦 Total Properties in DB : ${totalProps}`);
    console.log(`   👥 Total Leads in DB      : ${totalLeads}`);
    console.log("─────────────────────────────────────────");
    console.log("\n✅ You can now:");
    console.log("   • Open Properties module → see all 6 properties");
    console.log("   • Open Leads module → see all 6 leads");
    console.log("   • Click 'Create Deal' → pick from real leads & properties");
    console.log("");

    process.exit(0);
  } catch (err) {
    console.error("❌ Error:", err.message);
    process.exit(1);
  }
}

seedAll();
