const fs = require("fs");

const Dataset = require("../models/Dataset");
const Project = require("../models/Project");

const {
    validateDataset
} = require("../services/datasetValidationService");


// ============================================================
// Upload Dataset
// ============================================================

const uploadDataset = async (req, res) => {

    try {

        // ----------------------------------------------------
        // Check uploaded file
        // ----------------------------------------------------

        if (!req.file) {

            return res.status(400).json({
                message: "CSV file is required."
            });

        }


        // ----------------------------------------------------
        // Check project ID
        // ----------------------------------------------------

        const { projectId } = req.params;


        // ----------------------------------------------------
        // Find project belonging to user
        // ----------------------------------------------------

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });


        if (!project) {

            if (req.file.path) {

                fs.unlinkSync(req.file.path);

            }

            return res.status(404).json({
                message: "Project not found."
            });

        }


        // ----------------------------------------------------
        // Validate CSV
        // ----------------------------------------------------

        const validation =
            validateDataset(req.file.path);


        if (!validation.valid) {

            // Delete invalid file

            if (
                fs.existsSync(
                    req.file.path
                )
            ) {

                fs.unlinkSync(
                    req.file.path
                );

            }


            return res.status(400).json({

                message:
                    "Dataset validation failed.",

                ...validation

            });

        }


        // ----------------------------------------------------
        // Create dataset record
        // ----------------------------------------------------

        const dataset = await Dataset.create({

            project: project._id,

            owner: req.user.userId,

            originalName:
                req.file.originalname,

            storedName:
                req.file.filename,

            filePath:
                req.file.path,

            fileSize:
                req.file.size,

            rowCount:
                validation.rowCount,

            status: "uploaded"

        });


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.status(201).json({

            message:
                "Dataset uploaded and validated successfully.",

            dataset: {

                _id:
                    dataset._id,

                project:
                    dataset.project,

                originalName:
                    dataset.originalName,

                storedName:
                    dataset.storedName,

                fileSize:
                    dataset.fileSize,

                rowCount:
                    dataset.rowCount,

                featureCount:
                    validation.featureCount,

                status:
                    dataset.status,

                createdAt:
                    dataset.createdAt

            }

        });

    } catch (error) {

        console.error(
            "Dataset upload error:",
            error.message
        );


        // ----------------------------------------------------
        // Cleanup uploaded file
        // ----------------------------------------------------

        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {

            try {

                fs.unlinkSync(
                    req.file.path
                );

            } catch (fileError) {

                console.error(
                    "File cleanup error:",
                    fileError.message
                );

            }

        }


        return res.status(500).json({

            message:
                "Server error while uploading dataset."

        });

    }
};


// ============================================================
// Get Project Datasets
// ============================================================

const getProjectDatasets = async (req, res) => {

    try {

        const { projectId } = req.params;


        // ----------------------------------------------------
        // Verify project belongs to user
        // ----------------------------------------------------

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });


        if (!project) {

            return res.status(404).json({
                message: "Project not found."
            });

        }


        const datasets = await Dataset.find({
            project: projectId,
            owner: req.user.userId
        }).sort({
            createdAt: -1
        });


        return res.status(200).json({

            count: datasets.length,

            datasets

        });

    } catch (error) {

        console.error(
            "Get datasets error:",
            error.message
        );

        return res.status(500).json({
            message:
                "Server error while fetching datasets."
        });

    }
};


module.exports = {
    uploadDataset,
    getProjectDatasets
};