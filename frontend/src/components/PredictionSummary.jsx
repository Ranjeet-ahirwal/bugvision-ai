const PredictionSummary = ({ predictionRun }) => {
  if (!predictionRun) {
    return null;
  }

  const total = predictionRun.totalRows || 0;
  const defective = predictionRun.defectiveCount || 0;
  const nonDefective =
    predictionRun.nonDefectiveCount || 0;

  const highRisk =
    predictionRun.riskSummary?.high || 0;

  const mediumRisk =
    predictionRun.riskSummary?.medium || 0;

  const lowRisk =
    predictionRun.riskSummary?.low || 0;

  const defectRate =
    total > 0
      ? ((defective / total) * 100).toFixed(1)
      : "0.0";

  const highRiskRate =
    total > 0
      ? ((highRisk / total) * 100).toFixed(1)
      : "0.0";

  const cards = [
    {
      label: "Components Analyzed",
      value: total.toLocaleString(),
      description: "Total software components",
      valueClass: "text-white",
      icon: "▦"
    },
    {
      label: "Predicted Defective",
      value: defective.toLocaleString(),
      description: `${defectRate}% of analyzed components`,
      valueClass: "text-red-400",
      icon: "⚠"
    },
    {
      label: "Predicted Non-Defective",
      value: nonDefective.toLocaleString(),
      description: "Lower predicted defect risk",
      valueClass: "text-emerald-400",
      icon: "✓"
    },
    {
      label: "High Risk",
      value: highRisk.toLocaleString(),
      description: `${highRiskRate}% of analyzed components`,
      valueClass: "text-orange-400",
      icon: "!"
    }
  ];

  return (
    <section className="mt-8">

      {/* Section Header */}
      <div>
        <p className="text-sm font-medium text-blue-400">
          Analysis Overview
        </p>

        <h2 className="mt-1 text-xl font-semibold text-white">
          Prediction Summary
        </h2>

        <p className="mt-1 text-sm text-slate-400">
          Overview of the software components analyzed
          during this prediction run.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

        {cards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
          >

            <div className="flex items-start justify-between">

              <div>
                <p className="text-sm text-slate-400">
                  {card.label}
                </p>

                <p
                  className={`mt-3 text-3xl font-bold ${card.valueClass}`}
                >
                  {card.value}
                </p>
              </div>

              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-800 text-sm text-slate-300">
                {card.icon}
              </div>

            </div>

            <p className="mt-3 text-xs text-slate-500">
              {card.description}
            </p>

          </div>
        ))}

      </div>

      {/* Prediction Breakdown */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">

          <div>
            <p className="text-sm font-semibold text-white">
              Prediction Breakdown
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Distribution of predicted defect status.
            </p>
          </div>

          <div className="flex flex-wrap gap-6">

            <div>
              <p className="text-xs text-slate-500">
                Defective
              </p>

              <p className="mt-1 text-lg font-semibold text-red-400">
                {defective.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Non-Defective
              </p>

              <p className="mt-1 text-lg font-semibold text-emerald-400">
                {nonDefective.toLocaleString()}
              </p>
            </div>

            <div>
              <p className="text-xs text-slate-500">
                Defect Rate
              </p>

              <p className="mt-1 text-lg font-semibold text-white">
                {defectRate}%
              </p>
            </div>

          </div>

        </div>

        {/* Distribution Bar */}
        <div className="mt-5">

          <div className="flex h-3 w-full overflow-hidden rounded-full bg-slate-800">

            <div
              className="bg-red-500 transition-all"
              style={{
                width: `${defectRate}%`
              }}
            />

            <div
              className="bg-emerald-500 transition-all"
              style={{
                width: `${100 - Number(defectRate)}%`
              }}
            />

          </div>

          <div className="mt-3 flex justify-between text-xs">

            <span className="text-red-400">
              Defective {defectRate}%
            </span>

            <span className="text-emerald-400">
              Non-Defective{" "}
              {(100 - Number(defectRate)).toFixed(1)}%
            </span>

          </div>

        </div>

      </div>

      {/* Run Information */}
      <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-6">

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Status
            </p>

            <p className="mt-2 font-semibold capitalize text-emerald-400">
              {predictionRun.status}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              High Risk
            </p>

            <p className="mt-2 font-semibold text-orange-400">
              {highRisk.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Medium Risk
            </p>

            <p className="mt-2 font-semibold text-yellow-400">
              {mediumRisk.toLocaleString()}
            </p>
          </div>

          <div>
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Low Risk
            </p>

            <p className="mt-2 font-semibold text-emerald-400">
              {lowRisk.toLocaleString()}
            </p>
          </div>

        </div>

        <div className="mt-5 border-t border-slate-800 pt-5">

          <p className="text-xs uppercase tracking-wide text-slate-500">
            Classification Threshold
          </p>

          <p className="mt-2 font-semibold text-slate-200">
            {predictionRun.classificationThreshold ??
              0.2}
          </p>

          <p className="mt-1 text-xs text-slate-500">
            Decision threshold used by the prediction
            model for classifying components as
            defective.
          </p>

        </div>

      </div>

    </section>
  );
};

export default PredictionSummary;