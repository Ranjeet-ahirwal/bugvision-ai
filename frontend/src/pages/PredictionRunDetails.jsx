import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api from "../services/api";

import PredictionSummary from "../components/PredictionSummary";
import RiskDistribution from "../components/RiskDistribution";
import PredictionResults from "../components/PredictionResults";
import Navbar from "../components/Navbar";

const PredictionRunDetails = () => {
  const { runId } = useParams();

  const [predictionRun, setPredictionRun] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState("");

  const [downloading, setDownloading] =
    useState(false);

  useEffect(() => {
    const fetchPredictionRun = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get(
          `/predictions/run/${runId}`
        );

        setPredictionRun(
          response.data.predictionRun
        );
      } catch (error) {
        console.error(
          "Failed to fetch prediction run:",
          error
        );

        setError(
          error.response?.data?.message ||
            "Failed to load prediction run."
        );
      } finally {
        setLoading(false);
      }
    };

    if (runId) {
      fetchPredictionRun();
    }
  }, [runId]);

  const handleDownloadReport = async () => {
    try {
      setDownloading(true);
      setError("");

      const response = await api.get(
        `/predictions/run/${runId}/report`,
        {
          responseType: "blob"
        }
      );

      const blob = new Blob(
        [response.data],
        {
          type: "text/csv"
        }
      );

      const url =
        window.URL.createObjectURL(blob);

      const link =
        document.createElement("a");

      link.href = url;

      const datasetName =
        predictionRun?.dataset?.originalName ||
        "prediction";

      const safeDatasetName =
        datasetName
          .replace(/\.csv$/i, "")
          .replace(/[^a-z0-9-_]/gi, "_");

      link.download =
        `${safeDatasetName}_prediction_report.csv`;

      document.body.appendChild(link);

      link.click();

      link.remove();

      window.URL.revokeObjectURL(url);

    } catch (error) {
      console.error(
        "Failed to download report:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to download prediction report."
      );
    } finally {
      setDownloading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
            <p className="text-slate-400">
              Loading prediction run...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !predictionRun) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">
        <div className="mx-auto max-w-7xl">

          <Link
            to="/dashboard"
            className="mb-6 inline-flex text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="rounded-2xl border border-red-900 bg-red-950/30 p-6">
            <h1 className="text-xl font-semibold text-red-400">
              Unable to Load Prediction
            </h1>

            <p className="mt-2 text-sm text-red-300">
              {error ||
                "Prediction run could not be found."}
            </p>
          </div>

        </div>
      </div>
    );
  }

  const datasetName =
    predictionRun.dataset?.originalName ||
    "Unknown Dataset";

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Header */}
        <div className="mb-8">

          <Link
            to="/dashboard"
            className="mb-5 inline-flex text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">

            <div>

              <p className="text-sm font-medium text-blue-400">
                Prediction Run Details
              </p>

              <h1 className="mt-2 text-3xl font-bold">
                {datasetName}
              </h1>

              <p className="mt-2 text-sm text-slate-400">
                Detailed analysis results for this prediction run.
              </p>

            </div>

            <div className="flex flex-wrap items-center gap-3">

              {/* Status */}
              <span
                className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${
                  predictionRun.status === "completed"
                    ? "bg-emerald-950 text-emerald-400"
                    : predictionRun.status === "failed"
                    ? "bg-red-950 text-red-400"
                    : "bg-yellow-950 text-yellow-400"
                }`}
              >
                {predictionRun.status}
              </span>

              {/* Download Report */}
              {predictionRun.status === "completed" && (
                <button
                  onClick={handleDownloadReport}
                  disabled={downloading}
                  className={`rounded-lg px-4 py-2 text-sm font-semibold text-white transition ${
                    downloading
                      ? "cursor-not-allowed bg-blue-900"
                      : "bg-blue-600 hover:bg-blue-700"
                  }`}
                >
                  {downloading
                    ? "Downloading..."
                    : "Download CSV Report"}
                </button>
              )}

            </div>

          </div>

          {/* Download Error */}
          {error && (
            <div className="mt-5 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
              {error}
            </div>
          )}

          {/* Run Metadata */}
          <div className="mt-6 grid gap-4 md:grid-cols-3">

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Run Date
              </p>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {predictionRun.createdAt
                  ? new Date(
                      predictionRun.createdAt
                    ).toLocaleString()
                  : "—"}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Dataset
              </p>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {datasetName}
              </p>
            </div>

            <div className="rounded-xl border border-slate-800 bg-slate-900 p-4">
              <p className="text-xs uppercase tracking-wide text-slate-500">
                Classification Threshold
              </p>

              <p className="mt-2 text-sm font-medium text-slate-200">
                {predictionRun.classificationThreshold ??
                  0.2}
              </p>
            </div>

          </div>

        </div>

        {/* Prediction Summary */}
        <PredictionSummary
          predictionRun={predictionRun}
          error=""
        />

        {/* Risk Distribution */}
        <RiskDistribution
          predictionRun={predictionRun}
        />

        {/* Prediction Results */}
        <PredictionResults
          runId={predictionRun._id}
        />

      </main>

    </div>
  );
};

export default PredictionRunDetails;