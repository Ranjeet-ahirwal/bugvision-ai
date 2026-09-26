import { useState } from "react";

import api from "../services/api";

const UploadDatasetModal = ({
  projectId,
  onClose,
  onDatasetUploaded
}) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (event) => {
    const selectedFile = event.target.files[0];

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    if (!selectedFile.name.toLowerCase().endsWith(".csv")) {
      setError("Only CSV files are allowed.");
      setFile(null);
      return;
    }

    if (selectedFile.size > 10 * 1024 * 1024) {
      setError("File size must be less than 10 MB.");
      setFile(null);
      return;
    }

    setFile(selectedFile);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!file) {
      setError("Please select a CSV file.");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const formData = new FormData();

      formData.append("dataset", file);

      const response = await api.post(
        `/datasets/project/${projectId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data"
          },
          timeout: 120000
        }
      );

      onDatasetUploaded(response.data.dataset);

      onClose();

    } catch (error) {
      console.error(
        "Dataset upload error:",
        error
      );

      const responseData = error.response?.data;

      if (
        responseData?.message ===
        "Dataset validation failed."
      ) {
        const validationErrors =
          responseData.errors || [];

        setError(
          `${responseData.message} ${
            validationErrors.length > 0
              ? validationErrors.join(" ")
              : ""
          }`
        );
      } else {
        setError(
          responseData?.message ||
            "Failed to upload dataset."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4">

      <div className="w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl">

        {/* Header */}
        <div className="flex items-start justify-between">

          <div>
            <h2 className="text-xl font-semibold text-white">
              Upload Dataset
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Upload a software metrics CSV for analysis.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="text-xl text-slate-400 hover:text-white disabled:opacity-50"
          >
            ×
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm leading-5 text-red-300">
            {error}
          </div>
        )}


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6"
        >

          {/* File selector */}
          <label className="block cursor-pointer rounded-xl border-2 border-dashed border-slate-700 bg-slate-800/50 p-8 text-center transition hover:border-blue-500">

            <div className="text-4xl">
              📊
            </div>

            <p className="mt-3 font-medium text-white">
              {file
                ? file.name
                : "Choose a CSV file"}
            </p>

            <p className="mt-2 text-sm text-slate-400">
              CSV files only • Maximum 10 MB
            </p>

            <input
              type="file"
              accept=".csv,text/csv"
              onChange={handleFileChange}
              className="hidden"
              disabled={loading}
            />

          </label>


          {/* Selected file */}
          {file && (
            <div className="mt-4 rounded-lg border border-slate-700 bg-slate-800 px-4 py-3">

              <div className="flex items-center justify-between">

                <div>
                  <p className="text-sm font-medium text-white">
                    {file.name}
                  </p>

                  <p className="mt-1 text-xs text-slate-400">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>

                <span className="text-sm text-emerald-400">
                  Ready
                </span>

              </div>

            </div>
          )}


          {/* Info */}
          <div className="mt-5 rounded-lg bg-slate-800/60 p-4 text-xs leading-5 text-slate-400">

            <p className="font-medium text-slate-300">
              Required dataset
            </p>

            <p className="mt-1">
              The CSV must contain the required software
              engineering metrics used by the BugVision AI
              model.
            </p>

          </div>


          {/* Buttons */}
          <div className="mt-6 flex justify-end gap-3">

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-slate-700 px-5 py-2.5 text-sm font-medium text-slate-300 hover:bg-slate-800 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={!file || loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {loading
                ? "Uploading..."
                : "Upload Dataset"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default UploadDatasetModal;