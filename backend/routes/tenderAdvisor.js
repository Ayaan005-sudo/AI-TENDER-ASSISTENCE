const express = require("express");
const router = express.Router();
const tenderAdvisorController = require("../controllers/tenderAdvisorController");

// Mount the advisor advice route
router.post("/ai-advisor", tenderAdvisorController.getAdvisorAdvice);

module.exports = router;
