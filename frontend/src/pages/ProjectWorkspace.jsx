import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import UploadDatasetModal from "../components/UploadDatasetModal";
import PredictionSummary from "../components/PredictionSummary";
import PredictionResults from "../components/PredictionResults";
import RiskDistribution from "../components/RiskDistribution";
import PredictionHistory from "../components/PredictionHistory";
import Navbar from "../components/Navbar";

import api from "../services/api";

const ProjectWorkspace = () => {
  const { projectId } = useParams();

  const [project, setProject] = useState(null);
  const [datasets, setDatasets] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showUploadModal, setShowUploadModal] =
    useState(false);

  const [predictionRun, setPredictionRun] =
    useState(null);

  const [predictionLoading, setPredictionLoading] =
    useState(false);

  const [predictionError, setPredictionError] =
    useState("");

  const fetchProjectData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        projectResponse,
        datasetResponse
      ] = await Promise.all([
        api.get(`/projects/${projectId}`),
        api.get(`/datasets/project/${projectId}`)
      ]);

      setProject(projectResponse.data.project);

      setDatasets(
        datasetResponse.data.datasets || []
      );

    } catch (error) {
      console.error(
        "Project workspace error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load project."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjectData();
  }, [projectId]);

  const handleDatasetUploaded = (dataset) => {
    setDatasets((currentDatasets) => [
      dataset,
      ...currentDatasets
    ]);

    setShowUploadModal(false);
  };

  const handleRunPrediction = async (datasetId) => {
    try {
      setPredictionLoading(true);
      setPredictionError("");
      setPredictionRun(null);

      const response = await api.post(
        `/predictions/dataset/${datasetId}`
      );

      setPredictionRun(
        response.data.predictionRun
      );

    } catch (error) {
      console.error(
        "Prediction error:",
        error
      );

      setPredictionError(
        error.response?.data?.message ||
          "Failed to run prediction."
      );
    } finally {
      setPredictionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-slate-400">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 px-8 py-6 text-center">
          <p className="text-sm">
            Loading project...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-6 py-10 text-white">

        <div className="mx-auto max-w-4xl">

          <Link
            to="/dashboard"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-5 text-red-300">
            {error}
          </div>

        </div>

      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      <Navbar />

      {/* Project Header */}
      <header className="border-b border-slate-800 bg-slate-900">

        <div className="mx-auto max-w-7xl px-6 py-6">

          <Link
            to="/dashboard"
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            ← Back to Dashboard
          </Link>

          <div className="mt-5">

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm font-medium text-blue-400">
                  Project Workspace
                </p>

                <h1 className="mt-1 text-3xl font-bold">
                  {project?.name}
                </h1>

                <p className="mt-2 max-w-2xl text-slate-400">
                  {project?.description ||
                    "No project description provided."}
                </p>

              </div>

              <div className="rounded-lg border border-slate-700 bg-slate-950 px-4 py-3">

                <p className="text-xs text-slate-500">
                  Project ID
                </p>

                <p className="mt-1 max-w-[220px] truncate text-xs text-slate-300">
                  {project?._id}
                </p>

              </div>

            </div>

          </div>

        </div>

      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Project Overview */}
        <section>

          <h2 className="text-xl font-semibold">
            Project Overview
          </h2>

          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

            {/* Datasets */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Datasets
              </p>

              <p className="mt-3 text-3xl font-bold">
                {datasets.length}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Uploaded datasets
              </p>

            </div>

            {/* Prediction */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Latest Prediction
              </p>

              <p className="mt-3 text-lg font-bold">
                {predictionRun
                  ? predictionRun.status
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                Current prediction status
              </p>

            </div>

            {/* Defective */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                Defective Components
              </p>

              <p className="mt-3 text-3xl font-bold">
                {predictionRun
                  ? predictionRun.defectiveCount
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                From latest prediction
              </p>

            </div>

            {/* High Risk */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

              <p className="text-sm text-slate-400">
                High Risk
              </p>

              <p className="mt-3 text-3xl font-bold text-red-400">
                {predictionRun
                  ? predictionRun.riskSummary?.high ||
                    0
                  : "—"}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                High-risk components
              </p>

            </div>

          </div>

        </section>

        {/* Dataset Section */}
        <section className="mt-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>

              <h2 className="text-xl font-semibold">
                Datasets
              </h2>

              <p className="mt-1 text-sm text-slate-400">
                Upload and manage datasets for this
                project.
              </p>

            </div>

            <button
              onClick={() =>
                setShowUploadModal(true)
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
            >
              + Upload Dataset
            </button>

          </div>

          {/* Dataset List */}
          {datasets.length === 0 ? (

            <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

              <div className="text-4xl">
                📊
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                No dataset uploaded
              </h3>

              <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                Upload a valid software metrics CSV
                dataset to start defect prediction.
              </p>

              <button
                onClick={() =>
                  setShowUploadModal(true)
                }
                className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
              >
                Upload Dataset
              </button>

            </div>

          ) : (

            <div className="mt-6 space-y-4">

              {datasets.map((dataset) => (

                <div
                  key={dataset._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >

                  <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

                    {/* Dataset Information */}
                    <div>

                      <div className="flex items-center gap-3">

                        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-950 text-xl">
                          📄
                        </div>

                        <div>

                          <h3 className="font-semibold">
                            {dataset.originalName}
                          </h3>

                          <p className="text-xs text-slate-500">
                            Uploaded{" "}
                            {dataset.createdAt
                              ? new Date(
                                  dataset.createdAt
                                ).toLocaleDateString()
                              : "—"}
                          </p>

                        </div>

                      </div>

                      <div className="mt-4 flex flex-wrap gap-4 text-sm text-slate-400">

                        <span>
                          Rows:{" "}
                          <strong className="text-slate-200">
                            {dataset.rowCount}
                          </strong>
                        </span>

                        <span>
                          Size:{" "}
                          <strong className="text-slate-200">
                            {(
                              dataset.fileSize /
                              1024
                            ).toFixed(1)}{" "}
                            KB
                          </strong>
                        </span>

                        <span>
                          Status:{" "}
                          <strong className="text-slate-200">
                            {dataset.status}
                          </strong>
                        </span>

                      </div>

                    </div>

                    {/* Actions */}
                    <div className="flex flex-wrap items-center gap-3">

                      <span
                        className={`rounded-full px-3 py-1 text-xs font-medium ${
                          dataset.status ===
                          "completed"
                            ? "bg-emerald-950 text-emerald-400"
                            : dataset.status ===
                              "failed"
                            ? "bg-red-950 text-red-400"
                            : "bg-slate-800 text-slate-300"
                        }`}
                      >
                        {dataset.status}
                      </span>

                      <button
                        onClick={() =>
                          handleRunPrediction(
                            dataset._id
                          )
                        }
                        disabled={
                          predictionLoading
                        }
                        className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {predictionLoading
                          ? "Analyzing..."
                          : "Run Prediction"}
                      </button>

                    </div>

                  </div>

                </div>

              ))}

            </div>

          )}

        </section>

        {/* Prediction Error */}
        {predictionError && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {predictionError}
          </div>
        )}

        {/* Latest Prediction */}
        {predictionRun && (
          <>
            <PredictionSummary
              predictionRun={
                predictionRun
              }
              error={predictionError}
            />

            <RiskDistribution
              predictionRun={
                predictionRun
              }
            />

            <PredictionResults
              runId={predictionRun._id}
            />
          </>
        )}

        {/* Prediction History */}
        <PredictionHistory
          projectId={projectId}
        />

        {/* AI Prediction Information */}
        <section className="mt-10">

          <h2 className="text-xl font-semibold">
            AI Prediction
          </h2>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8">

            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-950 text-xl">
                    🤖
                  </div>

                  <h3 className="text-lg font-semibold">
                    Analyze Software Components
                  </h3>

                </div>

                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
                  BugVision AI analyzes software
                  engineering metrics and estimates
                  defect risk for individual software
                  components.
                </p>

              </div>

              <div>

                <button
                  onClick={() =>
                    datasets.length > 0 &&
                    handleRunPrediction(
                      datasets[0]._id
                    )
                  }
                  disabled={
                    datasets.length === 0 ||
                    predictionLoading
                  }
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {predictionLoading
                    ? "Analyzing..."
                    : datasets.length === 0
                    ? "Upload Dataset First"
                    : "Analyze Latest Dataset"}
                </button>

              </div>

            </div>

          </div>

        </section>

      </main>

      {/* Upload Dataset Modal */}
      {showUploadModal && (
        <UploadDatasetModal
          projectId={projectId}
          onClose={() =>
            setShowUploadModal(false)
          }
          onDatasetUploaded={
            handleDatasetUploaded
          }
        />
      )}

    </div>
  );
};

export default ProjectWorkspace;