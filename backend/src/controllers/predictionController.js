const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

const PredictionRun = require("../models/PredictionRun");
const PredictionResult = require("../models/PredictionResult");
const Dataset = require("../models/Dataset");

const {
  predictDataset
} = require("../services/mlService");

const {
  downloadFile
} = require("../services/supabaseStorageService");


// =====================================================
// RUN PREDICTION
// =====================================================

const runPrediction = async (req, res) => {

  let temporaryFilePath = null;

  try {

    const { datasetId } = req.params;

    // ---------------------------------------------
    // Validate dataset ID
    // ---------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(datasetId)) {
      return res.status(400).json({
        message: "Invalid dataset ID."
      });
    }

    // ---------------------------------------------
    // Find dataset belonging to logged-in user
    // ---------------------------------------------

    const dataset = await Dataset.findOne({
      _id: datasetId,
      owner: req.user.userId
    });

    if (!dataset) {
      return res.status(404).json({
        message: "Dataset not found."
      });
    }

    console.log(
      `Starting prediction for dataset: ${dataset.originalName}`
    );

    // ---------------------------------------------
    // Validate Supabase storage path
    // ---------------------------------------------

    if (!dataset.storagePath) {
      return res.status(404).json({
        message: "Dataset storage path not found."
      });
    }

    console.log(
      `Downloading dataset from Supabase: ${dataset.storagePath}`
    );

    // ---------------------------------------------
    // Create temporary local directory
    // ---------------------------------------------

    const temporaryDirectory = path.join(
      __dirname,
      "../../uploads"
    );

    if (!fs.existsSync(temporaryDirectory)) {
      fs.mkdirSync(temporaryDirectory, {
        recursive: true
      });
    }

    // ---------------------------------------------
    // Create temporary file path
    // ---------------------------------------------

    temporaryFilePath = path.join(
      temporaryDirectory,
      `prediction-${dataset._id}-${Date.now()}.csv`
    );

    // ---------------------------------------------
    // Download dataset from Supabase
    // ---------------------------------------------

    await downloadFile(
      dataset.storagePath,
      temporaryFilePath
    );

    console.log(
      "Dataset downloaded successfully."
    );

    // ---------------------------------------------
    // Create prediction run
    // ---------------------------------------------

    const predictionRun = await PredictionRun.create({
      dataset: dataset._id,
      project: dataset.project,
      owner: req.user.userId,
      status: "processing"
    });

    // ---------------------------------------------
    // Update dataset status
    // ---------------------------------------------

    dataset.status = "processing";
    await dataset.save();

    try {

      // -------------------------------------------
      // Send dataset to ML service
      // -------------------------------------------

      const mlResponse = await predictDataset(
        temporaryFilePath
      );

      console.log(
        "ML prediction completed. Results received:",
        mlResponse.results?.length
      );

      // -------------------------------------------
      // Validate ML response
      // -------------------------------------------

      if (
        !mlResponse ||
        !Array.isArray(mlResponse.results)
      ) {
        throw new Error(
          "Invalid response received from ML service."
        );
      }

      // -------------------------------------------
      // Convert ML results to MongoDB format
      // -------------------------------------------

      const results = mlResponse.results.map(
        (result) => ({
          predictionRun: predictionRun._id,

          row: result.row,

          component: result.component,

          defectProbability:
            result.defect_probability,

          prediction:
            result.prediction,

          riskLevel:
            result.risk_level
        })
      );

      // -------------------------------------------
      // Save prediction results
      // -------------------------------------------

      console.log(
        "Saving prediction results to MongoDB:",
        results.length
      );

      await PredictionResult.insertMany(
        results
      );

      console.log(
        "Prediction results saved to MongoDB."
      );

      // -------------------------------------------
      // Calculate summary
      // -------------------------------------------

      const defectiveCount =
        mlResponse.results.filter(
          (result) =>
            result.prediction === "Defective"
        ).length;

      const nonDefectiveCount =
        mlResponse.results.filter(
          (result) =>
            result.prediction === "Non-Defective"
        ).length;

      const highRiskCount =
        mlResponse.results.filter(
          (result) =>
            result.risk_level === "HIGH"
        ).length;

      const mediumRiskCount =
        mlResponse.results.filter(
          (result) =>
            result.risk_level === "MEDIUM"
        ).length;

      const lowRiskCount =
        mlResponse.results.filter(
          (result) =>
            result.risk_level === "LOW"
        ).length;

      // -------------------------------------------
      // Update prediction run
      // -------------------------------------------

      predictionRun.totalRows =
        mlResponse.total_rows ||
        mlResponse.results.length;

      predictionRun.defectiveCount =
        defectiveCount;

      predictionRun.nonDefectiveCount =
        nonDefectiveCount;

      predictionRun.riskSummary = {
        high: highRiskCount,
        medium: mediumRiskCount,
        low: lowRiskCount
      };

      predictionRun.classificationThreshold =
        mlResponse.classification_threshold ||
        0.20;

      predictionRun.status = "completed";

      predictionRun.completedAt =
        new Date();

      await predictionRun.save();

      // -------------------------------------------
      // Update dataset status
      // -------------------------------------------

      dataset.status = "completed";

      await dataset.save();

      // -------------------------------------------
      // Send response
      // -------------------------------------------

      return res.status(200).json({

        message:
          "Prediction completed successfully.",

        predictionRun: {
          _id: predictionRun._id,

          dataset:
            predictionRun.dataset,

          project:
            predictionRun.project,

          owner:
            predictionRun.owner,

          totalRows:
            predictionRun.totalRows,

          defectiveCount:
            predictionRun.defectiveCount,

          nonDefectiveCount:
            predictionRun.nonDefectiveCount,

          riskSummary:
            predictionRun.riskSummary,

          classificationThreshold:
            predictionRun.classificationThreshold,

          status:
            predictionRun.status,

          completedAt:
            predictionRun.completedAt
        }

      });

    } catch (predictionError) {

      console.error(
        "Prediction error:",
        predictionError.message
      );

      // -------------------------------------------
      // Mark prediction run as failed
      // -------------------------------------------

      predictionRun.status = "failed";

      predictionRun.errorMessage =
        predictionError.message;

      await predictionRun.save();

      // -------------------------------------------
      // Mark dataset as failed
      // -------------------------------------------

      dataset.status = "failed";

      await dataset.save();

      return res.status(500).json({

        message:
          "Prediction failed.",

        error:
          predictionError.message,

        predictionRunId:
          predictionRun._id
      });
    }

  } catch (error) {

    console.error(
      "Run prediction error:",
      error.message
    );

    return res.status(500).json({

      message:
        "Failed to start prediction.",

      error:
        error.message
    });

  } finally {

    // ---------------------------------------------
    // Always remove temporary local CSV
    // ---------------------------------------------

    if (
      temporaryFilePath &&
      fs.existsSync(temporaryFilePath)
    ) {

      try {

        fs.unlinkSync(
          temporaryFilePath
        );

        console.log(
          "Temporary prediction file removed."
        );

      } catch (cleanupError) {

        console.error(
          "Temporary file cleanup error:",
          cleanupError.message
        );

      }
    }
  }
};


// =====================================================
// GET SINGLE PREDICTION RUN
// =====================================================

const getPredictionRun = async (req, res) => {

  try {

    const { runId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(runId)) {

      return res.status(400).json({
        message: "Invalid prediction run ID."
      });

    }

    const predictionRun =
      await PredictionRun.findOne({
        _id: runId,
        owner: req.user.userId
      })
        .populate(
          "dataset",
          "originalName rowCount status"
        )
        .populate(
          "project",
          "name description"
        );

    if (!predictionRun) {

      return res.status(404).json({
        message:
          "Prediction run not found."
      });

    }

    return res.status(200).json({
      predictionRun
    });

  } catch (error) {

    console.error(
      "Get prediction run error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to fetch prediction run."
    });

  }
};


// =====================================================
// GET PAGINATED PREDICTION RESULTS
// =====================================================

const getPredictionResults = async (
  req,
  res
) => {

  try {

    const { runId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(runId)) {

      return res.status(400).json({
        message:
          "Invalid prediction run ID."
      });

    }

    // ---------------------------------------------
    // Check prediction run ownership
    // ---------------------------------------------

    const predictionRun =
      await PredictionRun.findOne({
        _id: runId,
        owner: req.user.userId
      });

    if (!predictionRun) {

      return res.status(404).json({
        message:
          "Prediction run not found."
      });

    }

    // ---------------------------------------------
    // Pagination
    // ---------------------------------------------

    const page =
      Math.max(
        parseInt(req.query.page) || 1,
        1
      );

    const limit =
      Math.min(
        Math.max(
          parseInt(req.query.limit) || 20,
          1
        ),
        100
      );

    const skip =
      (page - 1) * limit;

    // ---------------------------------------------
    // Filters
    // ---------------------------------------------

    const {
      risk,
      prediction,
      component
    } = req.query;

    const query = {
      predictionRun: runId
    };

    if (
      risk &&
      ["HIGH", "MEDIUM", "LOW"].includes(risk)
    ) {

      query.riskLevel = risk;

    }

    if (
      prediction &&
      [
        "Defective",
        "Non-Defective"
      ].includes(prediction)
    ) {

      query.prediction = prediction;

    }

    if (component) {

      query.component = {
        $regex: component,
        $options: "i"
      };

    }

    // ---------------------------------------------
    // Count results
    // ---------------------------------------------

    const totalResults =
      await PredictionResult.countDocuments(
        query
      );

    // ---------------------------------------------
    // Fetch results
    // ---------------------------------------------

    const results =
      await PredictionResult.find(query)
        .sort({ row: 1 })
        .skip(skip)
        .limit(limit);

    const totalPages =
      Math.ceil(
        totalResults / limit
      );

    return res.status(200).json({

      results,

      pagination: {

        page,

        limit,

        totalResults,

        totalPages,

        hasNextPage:
          page < totalPages,

        hasPreviousPage:
          page > 1

      },

      filters: {

        risk:
          risk || null,

        prediction:
          prediction || null,

        component:
          component || null

      }

    });

  } catch (error) {

    console.error(
      "Get prediction results error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to fetch prediction results."
    });

  }
};


// =====================================================
// GET PROJECT PREDICTION HISTORY
// =====================================================

const getProjectPredictionHistory = async (
  req,
  res
) => {

  try {

    const { projectId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(
        projectId
      )
    ) {

      return res.status(400).json({
        message:
          "Invalid project ID."
      });

    }

    // ---------------------------------------------
    // Fetch prediction history
    // ---------------------------------------------

    const predictionRuns =
      await PredictionRun.find({

        project: projectId,

        owner: req.user.userId

      })
        .populate(
          "dataset",
          "originalName rowCount status"
        )
        .sort({
          createdAt: -1
        });

    return res.status(200).json({

      totalRuns:
        predictionRuns.length,

      predictionRuns

    });

  } catch (error) {

    console.error(
      "Get project prediction history error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to fetch prediction history."
    });

  }
};


// =====================================================
// DOWNLOAD PREDICTION CSV REPORT
// =====================================================

const downloadPredictionReport = async (
  req,
  res
) => {

  try {

    const { runId } = req.params;

    // ---------------------------------------------
    // Validate prediction run ID
    // ---------------------------------------------

    if (!mongoose.Types.ObjectId.isValid(runId)) {

      return res.status(400).json({
        message:
          "Invalid prediction run ID."
      });

    }

    // ---------------------------------------------
    // Check prediction run ownership
    // ---------------------------------------------

    const predictionRun =
      await PredictionRun.findOne({

        _id: runId,

        owner: req.user.userId

      }).populate(
        "dataset",
        "originalName"
      );

    if (!predictionRun) {

      return res.status(404).json({
        message:
          "Prediction run not found."
      });

    }

    // ---------------------------------------------
    // Only completed runs can be exported
    // ---------------------------------------------

    if (
      predictionRun.status !== "completed"
    ) {

      return res.status(400).json({
        message:
          "Only completed prediction runs can be exported."
      });

    }

    // ---------------------------------------------
    // Get prediction results
    // ---------------------------------------------

    const results =
      await PredictionResult.find({

        predictionRun: runId

      })
        .sort({
          row: 1
        })
        .lean();

    if (!results.length) {

      return res.status(404).json({
        message:
          "No prediction results found for this run."
      });

    }

    // ---------------------------------------------
    // CSV escaping helper
    // ---------------------------------------------

    const escapeCsvValue = (value) => {

      if (
        value === null ||
        value === undefined
      ) {

        return "";

      }

      const stringValue =
        String(value);

      if (
        stringValue.includes(",") ||
        stringValue.includes('"') ||
        stringValue.includes("\n")
      ) {

        return `"${stringValue.replace(
          /"/g,
          '""'
        )}"`;

      }

      return stringValue;
    };

    // ---------------------------------------------
    // CSV header
    // ---------------------------------------------

    const csvRows = [

      [
        "Row",
        "Component",
        "Defect Probability",
        "Prediction",
        "Risk Level"
      ]

    ];

    // ---------------------------------------------
    // Add prediction results
    // ---------------------------------------------

    results.forEach((result) => {

      csvRows.push([

        result.row,

        result.component,

        result.defectProbability,

        result.prediction,

        result.riskLevel

      ]);

    });

    // ---------------------------------------------
    // Convert rows to CSV
    // ---------------------------------------------

    const csvContent =
      csvRows
        .map((row) =>
          row
            .map(escapeCsvValue)
            .join(",")
        )
        .join("\n");

    // ---------------------------------------------
    // Create safe filename
    // ---------------------------------------------

    const datasetName =
      predictionRun.dataset?.originalName ||
      "prediction";

    const safeDatasetName =
      datasetName
        .replace(
          /\.[^/.]+$/,
          ""
        )
        .replace(
          /[^a-zA-Z0-9-_]/g,
          "_"
        );

    const filename =
      `${safeDatasetName}_prediction_report.csv`;

    // ---------------------------------------------
    // Send CSV file
    // ---------------------------------------------

    res.setHeader(
      "Content-Type",
      "text/csv; charset=utf-8"
    );

    res.setHeader(
      "Content-Disposition",
      `attachment; filename="${filename}"`
    );

    return res.status(200).send(
      csvContent
    );

  } catch (error) {

    console.error(
      "Download prediction report error:",
      error.message
    );

    return res.status(500).json({
      message:
        "Failed to generate prediction report."
    });

  }
};


// =====================================================
// EXPORTS
// =====================================================

module.exports = {

  runPrediction,

  getPredictionRun,

  getPredictionResults,

  getProjectPredictionHistory,

  downloadPredictionReport

};