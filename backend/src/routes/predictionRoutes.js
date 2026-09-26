const express = require("express");

const {
  runPrediction,
  getPredictionRun,
  getPredictionResults,
  getProjectPredictionHistory,
  downloadPredictionReport
} = require("../controllers/predictionController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/dataset/:datasetId",
  protect,
  runPrediction
);

router.get(
  "/run/:runId",
  protect,
  getPredictionRun
);

router.get(
  "/run/:runId/results",
  protect,
  getPredictionResults
);

router.get(
  "/project/:projectId",
  protect,
  getProjectPredictionHistory
);

router.get(
  "/run/:runId/report",
  protect,
  downloadPredictionReport
);

module.exports = router;