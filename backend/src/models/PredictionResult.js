const mongoose = require("mongoose");


// ============================================================
// Prediction Result Schema
// ============================================================

const predictionResultSchema = new mongoose.Schema(
    {
        predictionRun: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "PredictionRun",
            required: true,
            index: true
        },

        row: {
            type: Number,
            required: true
        },

        component: {
            type: String,
            required: true
        },

        defectProbability: {
            type: Number,
            required: true
        },

        prediction: {
            type: String,

            enum: [
                "Defective",
                "Non-Defective"
            ],

            required: true
        },

        riskLevel: {
            type: String,

            enum: [
                "HIGH",
                "MEDIUM",
                "LOW"
            ],

            required: true
        }
    },

    {
        timestamps: true
    }
);


const PredictionResult = mongoose.model(
    "PredictionResult",
    predictionResultSchema
);


module.exports = PredictionResult;