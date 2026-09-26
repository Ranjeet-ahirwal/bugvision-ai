const axios = require("axios");
const fs = require("fs");


// ============================================================
// ML Service URL
// ============================================================

const ML_SERVICE_URL =
    process.env.ML_SERVICE_URL ||
    "http://127.0.0.1:8000";


// ============================================================
// Send Dataset to FastAPI
// ============================================================

const predictDataset = async (filePath) => {

    try {

        // ----------------------------------------------------
        // Check file exists
        // ----------------------------------------------------

        if (!fs.existsSync(filePath)) {

            throw new Error(
                "Dataset file not found."
            );

        }


        // ----------------------------------------------------
        // Create multipart form data
        // ----------------------------------------------------

        const FormData = require("form-data");

        const formData = new FormData();

        formData.append(
            "file",
            fs.createReadStream(filePath)
        );


        // ----------------------------------------------------
        // Send request to FastAPI
        // ----------------------------------------------------

        const response = await axios.post(

            `${ML_SERVICE_URL}/predict-csv`,

            formData,

            {
                headers: {
                    ...formData.getHeaders()
                },

                maxContentLength:
                    Infinity,

                maxBodyLength:
                    Infinity,

                timeout:
                    120000
            }

        );


        // ----------------------------------------------------
        // Return ML result
        // ----------------------------------------------------

        return response.data;

    } catch (error) {

        console.error(
            "ML service error:",
            error.response?.data ||
            error.message
        );


        throw new Error(
            "ML prediction service failed."
        );

    }

};


module.exports = {
    predictDataset
};