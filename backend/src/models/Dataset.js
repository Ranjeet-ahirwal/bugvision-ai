const mongoose = require("mongoose");

// ============================================================
// Dataset Schema
// ============================================================

const datasetSchema = new mongoose.Schema(
    {
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

        originalName: {
            type: String,
            required: true,
            trim: true
        },

        storedName: {
            type: String,
            required: true,
            trim: true
        },

        // Temporary/local path used during processing
        filePath: {
            type: String,
            required: true
        },

        // Permanent Supabase Storage path
        storagePath: {
            type: String,
            required: true,
            trim: true
        },

        fileSize: {
            type: Number,
            required: true
        },

        rowCount: {
            type: Number,
            default: 0
        },

        status: {
            type: String,
            enum: [
                "uploaded",
                "processing",
                "completed",
                "failed"
            ],
            default: "uploaded"
        }
    },
    {
        timestamps: true
    }
);

// ============================================================
// Dataset Model
// ============================================================

const Dataset = mongoose.model(
    "Dataset",
    datasetSchema
);

module.exports = Dataset;