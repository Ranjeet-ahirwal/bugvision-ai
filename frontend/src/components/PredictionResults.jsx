import { useEffect, useState } from "react";
import api from "../services/api";

const PredictionResults = ({ runId }) => {
  const [results, setResults] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [page, setPage] = useState(1);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    totalResults: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false
  });

  const [riskFilter, setRiskFilter] = useState("");
  const [predictionFilter, setPredictionFilter] =
    useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  /*
   * Small debounce for component search.
   * This prevents an API request on every keystroke.
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchInput]);

  const fetchResults = async () => {
    if (!runId) {
      return;
    }

    try {
      setLoading(true);
      setError("");

      const params = new URLSearchParams();

      params.append("page", page);
      params.append("limit", 20);

      if (riskFilter) {
        params.append("risk", riskFilter);
      }

      if (predictionFilter) {
        params.append(
          "prediction",
          predictionFilter
        );
      }

      if (search.trim()) {
        params.append(
          "component",
          search.trim()
        );
      }

      const response = await api.get(
        `/predictions/run/${runId}/results?${params.toString()}`
      );

      setResults(response.data.results || []);

      setPagination(
        response.data.pagination || {
          page: 1,
          limit: 20,
          totalResults: 0,
          totalPages: 0,
          hasNextPage: false,
          hasPreviousPage: false
        }
      );

    } catch (error) {
      console.error(
        "Failed to fetch prediction results:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load prediction results."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResults();
  }, [
    runId,
    page,
    riskFilter,
    predictionFilter,
    search
  ]);

  const getRiskClasses = (risk) => {
    if (risk === "HIGH") {
      return "border border-red-900 bg-red-950 text-red-400";
    }

    if (risk === "MEDIUM") {
      return "border border-yellow-900 bg-yellow-950 text-yellow-400";
    }

    return "border border-emerald-900 bg-emerald-950 text-emerald-400";
  };

  const getPredictionClasses = (prediction) => {
    if (prediction === "Defective") {
      return "border border-red-900 bg-red-950/40 text-red-400";
    }

    return "border border-emerald-900 bg-emerald-950/40 text-emerald-400";
  };

  const formatProbability = (probability) => {
    if (typeof probability !== "number") {
      return "—";
    }

    return `${(probability * 100).toFixed(2)}%`;
  };

  const getProbabilityWidth = (probability) => {
    if (typeof probability !== "number") {
      return "0%";
    }

    return `${Math.min(
      Math.max(probability * 100, 0),
      100
    )}%`;
  };

  const getProbabilityBarClass = (probability) => {
    if (probability >= 0.6) {
      return "bg-red-500";
    }

    if (probability >= 0.3) {
      return "bg-yellow-500";
    }

    return "bg-emerald-500";
  };

  const handleRiskChange = (event) => {
    setRiskFilter(event.target.value);
    setPage(1);
  };

  const handlePredictionChange = (event) => {
    setPredictionFilter(event.target.value);
    setPage(1);
  };

  const handleSearchChange = (event) => {
    setSearchInput(event.target.value);
  };

  const handleResetFilters = () => {
    setSearchInput("");
    setSearch("");
    setRiskFilter("");
    setPredictionFilter("");
    setPage(1);
  };

  const hasActiveFilters =
    searchInput.trim() ||
    riskFilter ||
    predictionFilter;

  if (!runId) {
    return null;
  }

  return (
    <section className="mt-10">

      {/* Header */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-sm font-medium text-blue-400">
            Analysis Output
          </p>

          <h2 className="mt-1 text-xl font-semibold text-white">
            Prediction Results
          </h2>

          <p className="mt-1 text-sm text-slate-400">
            Inspect individual software components and
            their predicted defect risk.
          </p>

        </div>

        {!loading &&
          pagination.totalResults > 0 && (
            <div className="rounded-lg border border-slate-800 bg-slate-900 px-4 py-2">

              <p className="text-xs text-slate-500">
                Total Results
              </p>

              <p className="text-lg font-semibold text-white">
                {pagination.totalResults.toLocaleString()}
              </p>

            </div>
          )}

      </div>

      {/* Filters */}
      <div className="mb-5 rounded-2xl border border-slate-800 bg-slate-900 p-5">

        <div className="grid gap-4 lg:grid-cols-[2fr_1fr_1fr_auto]">

          {/* Search */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Search Component
            </label>

            <div className="relative">

              <input
                type="text"
                value={searchInput}
                onChange={handleSearchChange}
                placeholder="Search by component name..."
                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none placeholder:text-slate-500 transition focus:border-blue-500"
              />

            </div>

          </div>

          {/* Risk */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Risk Level
            </label>

            <select
              value={riskFilter}
              onChange={handleRiskChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
            >

              <option value="">
                All Risk Levels
              </option>

              <option value="HIGH">
                High Risk
              </option>

              <option value="MEDIUM">
                Medium Risk
              </option>

              <option value="LOW">
                Low Risk
              </option>

            </select>

          </div>

          {/* Prediction */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Prediction
            </label>

            <select
              value={predictionFilter}
              onChange={handlePredictionChange}
              className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2.5 text-sm text-white outline-none transition focus:border-blue-500"
            >

              <option value="">
                All Predictions
              </option>

              <option value="Defective">
                Defective
              </option>

              <option value="Non-Defective">
                Non-Defective
              </option>

            </select>

          </div>

          {/* Reset */}
          <div className="flex items-end">

            <button
              onClick={handleResetFilters}
              disabled={!hasActiveFilters}
              className="w-full rounded-lg border border-slate-700 px-4 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40 lg:w-auto"
            >
              Reset
            </button>

          </div>

        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">

            <span>
              Active filters:
            </span>

            {searchInput.trim() && (
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
                Search: {searchInput}
              </span>
            )}

            {riskFilter && (
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
                Risk: {riskFilter}
              </span>
            )}

            {predictionFilter && (
              <span className="rounded-full border border-slate-700 bg-slate-950 px-3 py-1 text-slate-300">
                Prediction: {predictionFilter}
              </span>
            )}

          </div>
        )}

      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-900 bg-red-950/40 p-4 text-sm text-red-400">
          {error}
        </div>
      )}

      {/* Loading */}
      {loading ? (

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-12 text-center">

          <div className="mx-auto h-7 w-7 animate-spin rounded-full border-2 border-slate-700 border-t-blue-500" />

          <p className="mt-4 text-sm text-slate-400">
            Loading prediction results...
          </p>

        </div>

      ) : (

        <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900">

          {/* Table */}
          <div className="overflow-x-auto">

            <table className="w-full min-w-[850px] text-left">

              <thead className="border-b border-slate-800 bg-slate-950">

                <tr>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    #
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Component
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Defect Probability
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Prediction
                  </th>

                  <th className="px-5 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Risk
                  </th>

                </tr>

              </thead>

              <tbody className="divide-y divide-slate-800">

                {results.length === 0 ? (

                  <tr>

                    <td
                      colSpan="5"
                      className="px-5 py-14 text-center"
                    >

                      <div className="text-3xl">
                        🔍
                      </div>

                      <p className="mt-3 text-sm font-medium text-slate-300">
                        No prediction results found
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        Try changing or resetting your
                        filters.
                      </p>

                    </td>

                  </tr>

                ) : (

                  results.map((result) => (

                    <tr
                      key={result._id}
                      className="transition hover:bg-slate-800/40"
                    >

                      {/* Row */}
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {result.row}
                      </td>

                      {/* Component */}
                      <td className="px-5 py-4">

                        <p className="max-w-[260px] truncate text-sm font-medium text-white">
                          {result.component}
                        </p>

                      </td>

                      {/* Probability */}
                      <td className="px-5 py-4">

                        <div className="w-44">

                          <div className="flex items-center justify-between">

                            <span className="text-sm font-medium text-slate-200">
                              {formatProbability(
                                result.defectProbability
                              )}
                            </span>

                          </div>

                          <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-slate-800">

                            <div
                              className={`h-full rounded-full transition-all ${getProbabilityBarClass(
                                result.defectProbability
                              )}`}
                              style={{
                                width:
                                  getProbabilityWidth(
                                    result.defectProbability
                                  )
                              }}
                            />

                          </div>

                        </div>

                      </td>

                      {/* Prediction */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getPredictionClasses(
                            result.prediction
                          )}`}
                        >
                          {result.prediction}
                        </span>

                      </td>

                      {/* Risk */}
                      <td className="px-5 py-4">

                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${getRiskClasses(
                            result.riskLevel
                          )}`}
                        >
                          {result.riskLevel}
                        </span>

                      </td>

                    </tr>

                  ))

                )}

              </tbody>

            </table>

          </div>

          {/* Pagination */}
          {pagination.totalResults > 0 && (

            <div className="flex flex-col gap-4 border-t border-slate-800 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <p className="text-sm text-slate-400">

                  Showing{" "}

                  <span className="font-medium text-slate-200">
                    {(pagination.page - 1) *
                      pagination.limit +
                      1}
                  </span>

                  {" "}–{" "}

                  <span className="font-medium text-slate-200">
                    {Math.min(
                      pagination.page *
                        pagination.limit,
                      pagination.totalResults
                    )}
                  </span>

                  {" "}of{" "}

                  <span className="font-medium text-slate-200">
                    {pagination.totalResults}
                  </span>

                </p>

              </div>

              <div className="flex items-center gap-2">

                <button
                  onClick={() =>
                    setPage((current) =>
                      Math.max(current - 1, 1)
                    )
                  }
                  disabled={
                    !pagination.hasPreviousPage
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  ← Previous
                </button>

                <span className="min-w-[110px] text-center text-sm text-slate-400">
                  Page{" "}
                  <span className="font-medium text-white">
                    {pagination.page}
                  </span>{" "}
                  of{" "}
                  <span className="font-medium text-white">
                    {pagination.totalPages}
                  </span>
                </span>

                <button
                  onClick={() =>
                    setPage((current) =>
                      current + 1
                    )
                  }
                  disabled={
                    !pagination.hasNextPage
                  }
                  className="rounded-lg border border-slate-700 px-3 py-2 text-sm font-medium text-slate-300 transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  Next →
                </button>

              </div>

            </div>

          )}

        </div>

      )}

    </section>
  );
};

export default PredictionResults;