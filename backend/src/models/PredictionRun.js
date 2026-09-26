const mongoose = require("mongoose");


// ============================================================
// Prediction Run Schema
// ============================================================

const predictionRunSchema = new mongoose.Schema(
    {
        dataset: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Dataset",
            required: true
        },

        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Project",
            required: true
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },

        totalRows: {
            type: Number,
            default: 0
        },

        defectiveCount: {
            type: Number,
            default: 0
        },

        nonDefectiveCount: {
            type: Number,
            default: 0
        },

        riskSummary: {
            high: {
                type: Number,
                default: 0
            },

            medium: {
                type: Number,
                default: 0
            },

            low: {
                type: Number,
                default: 0
            }
        },

        classificationThreshold: {
            type: Number,
            default: 0.20
        },

        status: {
            type: String,

            enum: [
                "processing",
                "completed",
                "failed"
            ],

            default: "processing"
        },

        errorMessage: {
            type: String,
            default: ""
        },

        completedAt: {
            type: Date,
            default: null
        }
    },

    {
        timestamps: true
    }
);


const PredictionRun = mongoose.model(
    "PredictionRun",
    predictionRunSchema
);


module.exports = PredictionRun;