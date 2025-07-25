const express = require("express");
const router = express.Router();
const multer = require("multer");
const aboutController = require("../controllers/aboutController");
const upload = require("../middleware/fileUpload");
const auth = require("../middleware/auth");

// =========================
// PUBLIC ABOUT ROUTES
// Includes public About and Vision-Mission pages
// =========================
// Public route for viewing about page
router.get("/", aboutController.getAboutPage);

// Public route for viewing vision-mission page
router.get("/vision-mission", aboutController.getVisionMissionPage);   /// this is the vision and mission page

module.exports = router;
