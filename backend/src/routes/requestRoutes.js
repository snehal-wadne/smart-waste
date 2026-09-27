const express = require("express");
const router = express.Router();
const {
  createCollectionRequest,
  getRequestByCode,
  getRequestHistory,
  getRequestsByCitizenPhone,
  getAllRequests,
} = require("../controllers/requestController");

router.post("/", createCollectionRequest);
router.get("/", getAllRequests);

// Explicit Phase 3 routes
router.get("/track", getRequestByCode);
router.get("/track/:code", getRequestByCode);
router.get("/user/:phone", getRequestsByCitizenPhone);
router.get("/citizen/:phone", getRequestsByCitizenPhone);
router.get("/:id/history", getRequestHistory);
router.get("/:code", getRequestByCode);

module.exports = router;
