const mongoose = require("mongoose");
const Property = require("./src/models/Property");
require("dotenv").config();

mongoose
  .connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log("Connected to MongoDB");

    // Fetch all properties to see what we have
    const properties = await Property.find({}).limit(10);
    console.log(`Found ${properties.length} properties.`);

    properties.forEach((p) => {
      console.log(
        `- ${p.title} | Price: ${p.price} | Type: ${p.type} | City: ${p.address?.city} | Status: ${p.status}`,
      );
    });

    mongoose.disconnect();
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB", err);
    process.exit(1);
  });
