const multer = require("multer");
const path = require("path");
const fs = require("fs");


// ============================================================
// Upload Directory
// ============================================================

const uploadDirectory = path.join(
    __dirname,
    "../../uploads"
);


// Create directory if it doesn't exist

if (!fs.existsSync(uploadDirectory)) {

    fs.mkdirSync(
        uploadDirectory,
        {
            recursive: true
        }
    );

}


// ============================================================
// Storage Configuration
// ============================================================

const storage = multer.diskStorage({

    destination: (req, file, cb) => {

        cb(
            null,
            uploadDirectory
        );

    },

    filename: (req, file, cb) => {

        const extension = path.extname(
            file.originalname
        );

        const baseName = path
            .basename(
                file.originalname,
                extension
            )
            .replace(
                /[^a-zA-Z0-9-_]/g,
                "_"
            );

        const uniqueName =
            `${Date.now()}-${baseName}${extension}`;

        cb(
            null,
            uniqueName
        );

    }

});


// ============================================================
// File Validation
// ============================================================

const fileFilter = (req, file, cb) => {

    const extension = path.extname(
        file.originalname
    ).toLowerCase();


    if (extension !== ".csv") {

        return cb(
            new Error("Only CSV files are allowed.")
        );

    }


    cb(null, true);

};


// ============================================================
// Multer Configuration
// ============================================================

const upload = multer({

    storage,

    fileFilter,

    limits: {
        fileSize: 10 * 1024 * 1024
    }

});


module.exports = upload;