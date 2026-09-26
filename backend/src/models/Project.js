const mongoose = require("mongoose");


// ============================================================
// Project Schema
// ============================================================

const projectSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
            minlength: 2,
            maxlength: 100
        },

        description: {
            type: String,
            trim: true,
            maxlength: 500,
            default: ""
        },

        owner: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        }
    },
    {
        timestamps: true
    }
);


// ============================================================
// Project Model
// ============================================================

const Project = mongoose.model("Project", projectSchema);

module.exports = Project;