const express = require("express");

const protect = require("../middleware/authMiddleware");

const upload = require("../middleware/uploadMiddleware");

const {
    uploadDataset,
    getProjectDatasets
} = require("../controllers/datasetController");

const router = express.Router();


// ============================================================
// Upload Dataset
// ============================================================

router.post(
    "/project/:projectId",
    protect,
    upload.single("dataset"),
    uploadDataset
);


// ============================================================
// Get Project Datasets
// ============================================================

router.get(
    "/project/:projectId",
    protect,
    getProjectDatasets
);


module.exports = router;