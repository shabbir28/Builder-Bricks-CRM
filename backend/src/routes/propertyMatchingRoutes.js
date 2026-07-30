const express = require("express");
const {
  getMatchingProperties,
} = require("../controllers/propertyMatchingController");
const { auth } = require("../middleware/auth");

const router = express.Router();

router.use(auth); // Ensure user is authenticated

router.route("/match/:leadId").get(getMatchingProperties);

module.exports = router;
