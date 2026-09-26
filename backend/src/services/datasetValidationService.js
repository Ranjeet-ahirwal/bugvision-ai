const fs = require("fs");
const path = require("path");


// ============================================================
// Required BugVision Features
// ============================================================

const REQUIRED_FEATURES = [
    "loc",
    "v(g)",
    "ev(g)",
    "iv(g)",
    "n",
    "v",
    "l",
    "d",
    "i",
    "e",
    "b",
    "t",
    "lOCode",
    "lOComment",
    "lOBlank",
    "locCodeAndComment",
    "uniq_Op",
    "uniq_Opnd",
    "total_Op",
    "total_Opnd",
    "branchCount"
];


// ============================================================
// Parse CSV Line
// ============================================================

const parseCSVLine = (line) => {

    const values = [];
    let current = "";
    let insideQuotes = false;

    for (let i = 0; i < line.length; i++) {

        const character = line[i];

        if (character === '"') {

            if (
                insideQuotes &&
                line[i + 1] === '"'
            ) {

                current += '"';
                i++;

            } else {

                insideQuotes = !insideQuotes;

            }

        } else if (
            character === "," &&
            !insideQuotes
        ) {

            values.push(current.trim());
            current = "";

        } else {

            current += character;

        }
    }

    values.push(current.trim());

    return values;
};


// ============================================================
// Validate Dataset
// ============================================================

const validateDataset = (filePath) => {

    const absolutePath = path.resolve(filePath);

    const content = fs.readFileSync(
        absolutePath,
        "utf8"
    );

    const lines = content
        .split(/\r?\n/)
        .filter(line => line.trim() !== "");


    if (lines.length < 2) {

        return {
            valid: false,
            message: "CSV file is empty or contains no data rows."
        };

    }


    // --------------------------------------------------------
    // Read Header
    // --------------------------------------------------------

    const headers = parseCSVLine(lines[0]);


    // --------------------------------------------------------
    // Check Required Columns
    // --------------------------------------------------------

    const missingColumns =
        REQUIRED_FEATURES.filter(
            feature => !headers.includes(feature)
        );


    if (missingColumns.length > 0) {

        return {
            valid: false,

            message:
                "Dataset is missing required software metric columns.",

            missingColumns

        };

    }


    // --------------------------------------------------------
    // Check Numeric Values
    // --------------------------------------------------------

    const invalidRows = [];

    for (
        let rowIndex = 1;
        rowIndex < lines.length;
        rowIndex++
    ) {

        const values = parseCSVLine(
            lines[rowIndex]
        );

        let rowIsInvalid = false;


        for (const feature of REQUIRED_FEATURES) {

            const columnIndex =
                headers.indexOf(feature);

            const value =
                values[columnIndex];


            if (
                value === undefined ||
                value === "" ||
                value === "?"
            ) {

                rowIsInvalid = true;
                break;

            }


            const numericValue =
                Number(value);


            if (!Number.isFinite(numericValue)) {

                rowIsInvalid = true;
                break;

            }

        }


        if (rowIsInvalid) {

            // CSV rows are 1-indexed for the user.
            invalidRows.push(rowIndex + 1);

        }

    }


    // --------------------------------------------------------
    // Invalid Rows
    // --------------------------------------------------------

    if (invalidRows.length > 0) {

        return {

            valid: false,

            message:
                "Dataset contains missing or invalid feature values.",

            invalidRowCount:
                invalidRows.length,

            invalidRows:
                invalidRows.slice(0, 100)

        };

    }


    // --------------------------------------------------------
    // Dataset Valid
    // --------------------------------------------------------

    return {

        valid: true,

        rowCount: lines.length - 1,

        featureCount:
            REQUIRED_FEATURES.length,

        features:
            REQUIRED_FEATURES

    };

};


module.exports = {
    validateDataset,
    REQUIRED_FEATURES
};