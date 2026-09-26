const RiskDistribution = ({ predictionRun }) => {
  if (!predictionRun) {
    return null;
  }

  const high =
    predictionRun.riskSummary?.high || 0;

  const medium =
    predictionRun.riskSummary?.medium || 0;

  const low =
    predictionRun.riskSummary?.low || 0;

  const total = high + medium + low;

  const getPercentage = (value) => {
    if (!total) {
      return "0.0";
    }

    return ((value / total) * 100).toFixed(1);
  };

  const riskLevels = [
    {
      label: "High Risk",
      value: high,
      color: "red",
      textClass: "text-red-400",
      bgClass: "bg-red-500",
      badgeClass: "bg-red-950 text-red-400",
      borderClass: "border-red-900/50",
      description:
        "Components requiring the highest testing priority."
    },
    {
      label: "Medium Risk",
      value: medium,
      color: "yellow",
      textClass: "text-yellow-400",
      bgClass: "bg-yellow-500",
      badgeClass:
        "bg-yellow-950 text-yellow-400",
      borderClass: "border-yellow-900/50",
      description:
        "Components requiring additional attention."
    },
    {
      label: "Low Risk",
      value: low,
      color: "emerald",
      textClass: "text-emerald-400",
      bgClass: "bg-emerald-500",
      badgeClass:
        "bg-emerald-950 text-emerald-400",
      borderClass: "border-emerald-900/50",
      description:
        "Components with comparatively lower predicted risk."
    }
  ];

  return (
    <section className="mt-8">

      {/* Header */}
      <div className="mb-5">

        <p className="text-sm font-medium text-blue-400">
          Risk Analysis
        </p>

        <h2 className="mt-1 text-xl font-semibold text-white">
          Risk Distribution
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Distribution of analyzed components across
          the system's defined risk levels.
        </p>

      </div>

      {/* Risk Cards */}
      <div className="grid gap-4 md:grid-cols-3">

        {riskLevels.map((risk) => (
          <div
            key={risk.label}
            className={`rounded-2xl border ${risk.borderClass} bg-slate-900 p-5`}
          >

            <div className="flex items-start justify-between gap-4">

              <div>

                <p className="text-sm text-slate-400">
                  {risk.label}
                </p>

                <p
                  className={`mt-2 text-3xl font-bold ${risk.textClass}`}
                >
                  {risk.value.toLocaleString()}
                </p>

              </div>

              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${risk.badgeClass}`}
              >
                {getPercentage(risk.value)}%
              </span>

            </div>

            <p className="mt-3 text-xs leading-5 text-slate-500">
              {risk.description}
            </p>

            {/* Progress */}
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-800">

              <div
                className={`h-full rounded-full ${risk.bgClass} transition-all duration-500`}
                style={{
                  width: `${getPercentage(
                    risk.value
                  )}%`
                }}
              />

            </div>

          </div>
        ))}

      </div>

      {/* Overall Distribution */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">

          <div>

            <p className="text-sm text-slate-400">
              Overall Risk Distribution
            </p>

            <p className="mt-1 text-3xl font-bold text-white">
              {total.toLocaleString()}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Total components analyzed
            </p>

          </div>

          <div className="text-sm text-slate-500">
            High + Medium + Low
          </div>

        </div>

        {/* Distribution Bar */}
        <div className="mt-6 overflow-hidden rounded-full bg-slate-800">

          <div className="flex h-8 w-full">

            {high > 0 && (
              <div
                className="bg-red-500 transition-all duration-500"
                style={{
                  width: `${getPercentage(high)}%`
                }}
                title={`High Risk: ${high}`}
              />
            )}

            {medium > 0 && (
              <div
                className="bg-yellow-500 transition-all duration-500"
                style={{
                  width: `${getPercentage(medium)}%`
                }}
                title={`Medium Risk: ${medium}`}
              />
            )}

            {low > 0 && (
              <div
                className="bg-emerald-500 transition-all duration-500"
                style={{
                  width: `${getPercentage(low)}%`
                }}
                title={`Low Risk: ${low}`}
              />
            )}

          </div>

        </div>

        {/* Legend */}
        <div className="mt-6 grid gap-4 sm:grid-cols-3">

          {riskLevels.map((risk) => (
            <div
              key={risk.label}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >

              <div className="flex items-center gap-3">

                <span
                  className={`h-3 w-3 rounded-full ${risk.bgClass}`}
                />

                <span className="text-sm text-slate-300">
                  {risk.label}
                </span>

              </div>

              <p className="mt-3 text-lg font-semibold text-white">
                {risk.value.toLocaleString()}
              </p>

              <p className="mt-1 text-xs text-slate-500">
                {getPercentage(risk.value)}% of total
              </p>

            </div>
          ))}

        </div>

      </div>

    </section>
  );
};

export default RiskDistribution;