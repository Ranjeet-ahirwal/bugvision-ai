import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";

const PredictionHistory = ({ projectId }) => {
  const [predictionRuns, setPredictionRuns] =
    useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [downloadingRunId, setDownloadingRunId] =
    useState(null);

  const fetchPredictionHistory = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/predictions/project/${projectId}`
      );

      setPredictionRuns(
        response.data.predictionRuns || []
      );
    } catch (error) {
      console.error(
        "Failed to fetch prediction history:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load prediction history."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (projectId) {
      fetchPredictionHistory();
    }
  }, [projectId]);

  const formatDate = (date) => {
    if (!date) {
      return "—";
    }

    return new Date(date).toLocaleString();
  };

  const handleDownloadReport = async (run) => {
    try {
      setDownloadingRunId(run._id);
      setError("");

      const response = await api.get(
        `/predictions/run/${run._id}/report`,
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
        run.dataset?.originalName ||
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
        "Failed to download prediction report:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to download prediction report."
      );
    } finally {
      setDownloadingRunId(null);
    }
  };

  if (loading) {
    return (
      <section className="mt-8">

        <div className="mb-5">
          <p className="text-sm font-medium text-blue-400">
            Project Activity
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Prediction History
          </h2>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center">
          <p className="text-sm text-slate-400">
            Loading prediction history...
          </p>
        </div>

      </section>
    );
  }

  return (
    <section className="mt-8">

      {/* Header */}
      <div className="mb-5">

        <p className="text-sm font-medium text-blue-400">
          Project Activity
        </p>

        <h2 className="mt-1 text-xl font-semibold text-white">
          Prediction History
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          View and manage previous prediction runs
          for this project.
        </p>

      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Empty */}
      {!error && predictionRuns.length === 0 && (
        <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-10 text-center">

          <div className="text-3xl">
            📊
          </div>

          <h3 className="mt-3 font-semibold text-white">
            No prediction runs yet
          </h3>

          <p className="mt-1 text-sm text-slate-400">
            Run an analysis on a dataset to see its
            prediction history here.
          </p>

        </div>
      )}

      {/* History Table */}
      {predictionRuns.length > 0 && (
        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          <div className="flex items-center justify-between border-b border-slate-800 px-5 py-4">

            <div>
              <p className="text-sm font-semibold text-white">
                Previous Runs
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {predictionRuns.length} prediction{" "}
                {predictionRuns.length === 1
                  ? "run"
                  : "runs"}
              </p>
            </div>

          </div>

          <div className="overflow-x-auto">

            <table className="w-full min-w-[1100px] text-left">

              <thead className="border-b border-slate-800 bg-slate-950">

                <tr>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Dataset
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Date
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Components
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Defective
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    High Risk
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Actions
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {predictionRuns.map((run) => {

                  const projectReference =
                    typeof run.project === "object"
                      ? run.project?._id
                      : run.project;

                  const isCompleted =
                    run.status === "completed";

                  const isDownloading =
                    downloadingRunId === run._id;

                  return (
                    <tr
                      key={run._id}
                      className="transition hover:bg-slate-800/40"
                    >

                      {/* Dataset */}
                      <td className="px-5 py-4">

                        <p className="max-w-[220px] truncate text-sm font-medium text-white">
                          {run.dataset?.originalName ||
                            "Unknown Dataset"}
                        </p>

                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-sm text-slate-400">
                        {formatDate(run.createdAt)}
                      </td>

                      {/* Components */}
                      <td className="px-5 py-4 text-sm text-slate-300">
                        {(
                          run.totalRows ?? 0
                        ).toLocaleString()}
                      </td>

                      {/* Defective */}
                      <td className="px-5 py-4">

                        <span className="text-sm font-semibold text-red-400">
                          {(
                            run.defectiveCount ?? 0
                          ).toLocaleString()}
                        </span>

                      </td>

                      {/* High Risk */}
                      <td className="px-5 py-4">

                        <span className="text-sm font-semibold text-orange-400">
                          {(
                            run.riskSummary?.high ??
                            0
                          ).toLocaleString()}
                        </span>

                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                            run.status ===
                            "completed"
                              ? "bg-emerald-950 text-emerald-400"
                              : run.status ===
                                "failed"
                              ? "bg-red-950 text-red-400"
                              : "bg-yellow-950 text-yellow-400"
                          }`}
                        >
                          {run.status}
                        </span>

                      </td>

                      {/* Actions */}
                      <td className="px-5 py-4">

                        <div className="flex items-center gap-2">

                          {/* View */}
                          {projectReference &&
                            isCompleted && (
                              <Link
                                to={`/projects/${projectReference}/predictions/${run._id}`}
                                className="rounded-lg border border-slate-700 px-3 py-2 text-xs font-medium text-slate-300 transition hover:border-blue-500 hover:text-blue-400"
                              >
                                View
                              </Link>
                            )}

                          {/* Download */}
                          {isCompleted && (
                            <button
                              onClick={() =>
                                handleDownloadReport(
                                  run
                                )
                              }
                              disabled={
                                isDownloading
                              }
                              className={`rounded-lg px-3 py-2 text-xs font-medium transition ${
                                isDownloading
                                  ? "cursor-not-allowed bg-slate-800 text-slate-500"
                                  : "bg-blue-600 text-white hover:bg-blue-700"
                              }`}
                            >
                              {isDownloading
                                ? "Downloading..."
                                : "Download"}
                            </button>
                          )}

                          {!isCompleted && (
                            <span className="text-xs text-slate-600">
                              Not available
                            </span>
                          )}

                        </div>

                      </td>

                    </tr>
                  );
                })}

              </tbody>

            </table>

          </div>

        </div>
      )}

    </section>
  );
};

export default PredictionHistory;