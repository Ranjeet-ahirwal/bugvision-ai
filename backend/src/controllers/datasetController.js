const fs = require("fs");
const path = require("path");

const Dataset = require("../models/Dataset");
const Project = require("../models/Project");

const {
    validateDataset
} = require("../services/datasetValidationService");

const {
    uploadFile,
    deleteFile
} = require("../services/supabaseStorageService");

// ============================================================
// Upload Dataset
// ============================================================

const uploadDataset = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                message: "CSV file is required."
            });
        }

        const { projectId } = req.params;

        // --------------------------------------------------------
        // 1. Verify project ownership
        // --------------------------------------------------------

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });

        if (!project) {
            if (req.file.path && fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(404).json({
                message: "Project not found."
            });
        }

        // --------------------------------------------------------
        // 2. Validate dataset
        // --------------------------------------------------------

        const validation = validateDataset(req.file.path);

        if (!validation.valid) {
            if (fs.existsSync(req.file.path)) {
                fs.unlinkSync(req.file.path);
            }

            return res.status(400).json({
                message: "Dataset validation failed.",
                ...validation
            });
        }

        // --------------------------------------------------------
        // 3. Generate Supabase storage path
        // --------------------------------------------------------

        const extension = path.extname(req.file.originalname);

        const safeBaseName = path
            .basename(req.file.originalname, extension)
            .replace(/[^a-zA-Z0-9-_]/g, "_");

        const storagePath =
            `datasets/${req.user.userId}/${project._id}/${Date.now()}-${safeBaseName}${extension}`;

        // --------------------------------------------------------
        // 4. Upload CSV to Supabase
        // --------------------------------------------------------

        await uploadFile(
            req.file.path,
            storagePath
        );

        // --------------------------------------------------------
        // 5. Save dataset metadata in MongoDB
        // --------------------------------------------------------

        const dataset = await Dataset.create({
            project: project._id,
            owner: req.user.userId,
            originalName: req.file.originalname,
            storedName: req.file.filename,
            filePath: req.file.path,
            storagePath: storagePath,
            fileSize: req.file.size,
            rowCount: validation.rowCount,
            status: "uploaded"
        });

        // --------------------------------------------------------
        // 6. Delete temporary local file
        // --------------------------------------------------------

        if (fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        // --------------------------------------------------------
// 7. Response
// --------------------------------------------------------

return res.status(201).json({
    message: "Dataset uploaded and validated successfully.",
    dataset: {
        _id: dataset._id,
        project: dataset.project,
        originalName: dataset.originalName,
        storedName: dataset.storedName,
        storagePath: dataset.storagePath,
        fileSize: dataset.fileSize,
        rowCount: dataset.rowCount,
        featureCount: validation.featureCount,
        status: dataset.status,
        createdAt: dataset.createdAt
    }
});
    } catch (error) {

        console.error(
            "Dataset upload error:",
            error.message
        );

        // --------------------------------------------------------
        // Cleanup temporary local file
        // --------------------------------------------------------

        if (
            req.file &&
            req.file.path &&
            fs.existsSync(req.file.path)
        ) {
            try {
                fs.unlinkSync(req.file.path);
            } catch (fileError) {
                console.error(
                    "Temporary file cleanup failed:",
                    fileError.message
                );
            }
        }

        return res.status(500).json({
            message: "Server error while uploading dataset."
        });
    }
};


// ============================================================
// Get Project Datasets
// ============================================================

const getProjectDatasets = async (req, res) => {
    try {
        const { projectId } = req.params;

        // --------------------------------------------------------
        // 1. Verify project ownership
        // --------------------------------------------------------

        const project = await Project.findOne({
            _id: projectId,
            owner: req.user.userId
        });

        if (!project) {
            return res.status(404).json({
                message: "Project not found."
            });
        }

        // --------------------------------------------------------
        // 2. Get datasets
        // --------------------------------------------------------

        const datasets = await Dataset.find({
            project: projectId,
            owner: req.user.userId
        }).sort({
            createdAt: -1
        });

        // --------------------------------------------------------
        // 3. Return datasets
        // --------------------------------------------------------

        return res.status(200).json({
            count: datasets.length,
            datasets
        });

    } catch (error) {
        console.error(
            "Get project datasets error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error while fetching datasets."
        });
    }
};

module.exports = {
    uploadDataset,
    getProjectDatasets
};