const mongoose = require("mongoose");
require("dotenv").config();
const Deal = require("./src/models/Deal");

// Need to register other models if they are nested/populated
require("./src/models/Lead");
require("./src/models/Property");
require("./src/models/User");

mongoose.connect(process.env.MONGO_URI).then(async () => {
  try {
    console.log("Connected...");
    const deals = await Deal.find({})
      .populate("lead", "name email phone")
      .populate("property", "title price address.city")
      .populate("agent", "name email");
    console.log("Success count:", deals.length);
  } catch (err) {
    console.error("ERROR TRACE:", err);
  }
  process.exit();
});
