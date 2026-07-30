const mongoose = require("mongoose");
const Lead = require("./src/models/Lead");
const Property = require("./src/models/Property");
require("dotenv").config();

mongoose.connect(process.env.MONGODB_URI).then(async () => {
  try {
    // Find the Ahmer lead specifically
    const lead = await Lead.findOne({ name: /Ahmer/i });
    if (!lead) {
      console.log("No lead found named Ahmer");
      return process.exit(0);
    }

    console.log("--- LEAD ---");
    console.log(`Name: ${lead.name}`);
    console.log(`Budget: ${lead.budget}`);
    console.log(`Location: ${lead.preferredLocation}`);
    console.log(`Prop Type: ${lead.preferredPropertyType}`);

    // Setup base query mimicking our implementation
    let maxBudget = 30000000; // 3cr parsed
    let query = {
      status: "available",
      price: { $lte: maxBudget },
      type: "house",
    };

    console.log("--- EXPERIMENT 1: Strict City Match ---");
    query["address.city"] = { $regex: new RegExp("phase 2", "i") };
    let res1 = await Property.find(query);
    console.log(`Matched: ${res1.length}`);

    console.log("--- EXPERIMENT 2: Broad Text Search ---");
    delete query["address.city"];
    // Try searching both city AND street for the location
    query["$or"] = [
      { "address.city": { $regex: new RegExp("phase 2", "i") } },
      { "address.street": { $regex: new RegExp("phase 2", "i") } },
      { title: { $regex: new RegExp("phase 2", "i") } },
    ];
    let res2 = await Property.find(query);
    console.log(`Matched: ${res2.length}`);
    if (res2.length > 0) {
      console.log(
        `Sample: ${res2[0].title} in ${res2[0].address.city}, ${res2[0].address.street}`,
      );
    }

    console.log("--- EXPERIMENT 3: Drop Location Req ---");
    delete query["$or"];
    let res3 = await Property.find(query);
    console.log(`Matched: ${res3.length} (Just budget & type)`);
    if (res3.length > 0) {
      res3.forEach((p) => {
        console.log(
          `- ${p.title} (Price: ${p.price}) in ${p.address.street}, ${p.address.city}`,
        );
      });
    }
  } catch (err) {
    console.error(err);
  } finally {
    mongoose.disconnect();
  }
});
