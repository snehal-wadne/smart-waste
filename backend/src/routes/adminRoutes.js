const express = require("express");
const router = express.Router();
const {
  getAdminRequests,
  updateRequestStatus,
  getAdminStats,
  getAdminAnalytics,
} = require("../controllers/adminController");

router.get("/requests", getAdminRequests);
router.get("/requests/", getAdminRequests);
router.patch("/requests/:id/status", updateRequestStatus);
router.get("/stats", getAdminStats);
router.get("/statistics", getAdminStats);
router.get("/analytics", getAdminAnalytics);

module.exports = router;
