const express = require("express");
const {
  createCommunication,
  getLeadCommunications,
  deleteCommunication,
} = require("../controllers/communicationController");
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");

const router = express.Router();

router.use(auth); // Ensure user is authenticated

router.route("/").post(upload.single("attachment"), createCommunication);

router.route("/:leadId").get(getLeadCommunications);

router.route("/:id").delete(deleteCommunication);

module.exports = router;
