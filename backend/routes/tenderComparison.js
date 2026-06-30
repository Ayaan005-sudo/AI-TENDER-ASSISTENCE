const express = require("express");
const router = express.Router();
const tenderComparisonController = require("../controllers/tenderComparisonController");

// Mount the tender comparison endpoint
router.post("/compare", tenderComparisonController.compareTenders);

module.exports = router;
