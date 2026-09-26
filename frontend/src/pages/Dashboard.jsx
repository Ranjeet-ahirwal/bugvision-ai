import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import api from "../services/api";
import Navbar from "../components/Navbar";
import { useAuth } from "../context/AuthContext";
import CreateProjectModal from "../components/CreateProjectModal";

const Dashboard = () => {
  const { user } = useAuth();

  const [projects, setProjects] = useState([]);
  const [datasetCount, setDatasetCount] = useState(0);
  const [predictionRunCount, setPredictionRunCount] =
    useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError("");

      // Fetch user's projects
      const projectResponse = await api.get(
        "/projects"
      );

      const userProjects =
        projectResponse.data.projects || [];

      setProjects(userProjects);

      // If there are no projects, there is
      // nothing else to count.
      if (userProjects.length === 0) {
        setDatasetCount(0);
        setPredictionRunCount(0);
        return;
      }

      // Fetch datasets and prediction history
      // for every project.
      const projectData = await Promise.all(
        userProjects.map(async (project) => {
          try {
            const [
              datasetResponse,
              predictionResponse
            ] = await Promise.all([
              api.get(
                `/datasets/project/${project._id}`
              ),
              api.get(
                `/predictions/project/${project._id}`
              )
            ]);

            return {
              datasets:
                datasetResponse.data.datasets ||
                [],
              predictionRuns:
                predictionResponse.data
                  .predictionRuns || []
            };
          } catch (projectError) {
            console.error(
              `Failed to load data for project ${project._id}:`,
              projectError
            );

            return {
              datasets: [],
              predictionRuns: []
            };
          }
        })
      );

      const totalDatasets =
        projectData.reduce(
          (total, project) =>
            total + project.datasets.length,
          0
        );

      const totalPredictionRuns =
        projectData.reduce(
          (total, project) =>
            total +
            project.predictionRuns.length,
          0
        );

      setDatasetCount(totalDatasets);
      setPredictionRunCount(
        totalPredictionRuns
      );

    } catch (error) {
      console.error(
        "Dashboard data error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to load dashboard data."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleProjectCreated = (project) => {
    setProjects((currentProjects) => [
      project,
      ...currentProjects
    ]);

    setShowCreateModal(false);

    // Refresh dashboard counts.
    fetchDashboardData();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* Global Navbar */}
      <Navbar />

      <main className="mx-auto max-w-7xl px-6 py-8">

        {/* Welcome */}
        <div className="mb-8">

          <p className="text-sm font-medium text-blue-400">
            Workspace
          </p>

          <h1 className="text-2xl font-bold text-slate-900">
  Welcome back, Software Quality Overview
</h1>
          <p className="mt-1 text-sm text-slate-500">
    Monitor your projects, datasets, and defect prediction activity.
  </p>

        </div>

        {/* Statistics */}
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">

          {/* Projects */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Total Projects
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "—" : projects.length}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Projects under your account
            </p>

          </div>

          {/* Datasets */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Datasets
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading ? "—" : datasetCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              Uploaded datasets
            </p>

          </div>

          {/* Prediction Runs */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">

            <p className="text-sm text-slate-400">
              Prediction Runs
            </p>

            <p className="mt-3 text-3xl font-bold">
              {loading
                ? "—"
                : predictionRunCount}
            </p>

            <p className="mt-1 text-xs text-slate-500">
              AI prediction analyses
            </p>

          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="mt-6 rounded-xl border border-red-800 bg-red-950/40 p-4 text-sm text-red-300">
            {error}
          </div>
        )}

        {/* Projects */}
        <section className="mt-10">

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

            <div>
              <h3 className="text-xl font-semibold">
                Your Projects
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Projects created under your account.
              </p>
            </div>

            <button
              onClick={() =>
                setShowCreateModal(true)
              }
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold transition hover:bg-blue-700"
            >
              + New Project
            </button>

          </div>

          {/* Loading */}
          {loading && (
            <div className="mt-6 rounded-xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading dashboard...
            </div>
          )}

          {/* Empty */}
          {!loading &&
            !error &&
            projects.length === 0 && (
              <div className="mt-6 rounded-2xl border border-dashed border-slate-700 bg-slate-900 p-12 text-center">

                <div className="text-4xl">
                  📁
                </div>

                <h4 className="mt-4 text-lg font-semibold">
                  No projects yet
                </h4>

                <p className="mx-auto mt-2 max-w-md text-sm text-slate-400">
                  Create your first project to start
                  uploading datasets and running
                  AI-based bug predictions.
                </p>

                <button
                  onClick={() =>
                    setShowCreateModal(true)
                  }
                  className="mt-6 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold hover:bg-blue-700"
                >
                  Create Your First Project
                </button>

              </div>
            )}

          {/* Project List */}
          {!loading &&
            projects.length > 0 && (
              <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

                {projects.map((project) => (
                  <div
                    key={project._id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:border-slate-700"
                  >

                    <div className="flex items-start justify-between gap-3">

                      <h4 className="text-lg font-semibold">
                        {project.name}
                      </h4>

                      <span className="rounded-full bg-emerald-950 px-2.5 py-1 text-xs font-medium text-emerald-400">
                        Active
                      </span>

                    </div>

                    <p className="mt-2 line-clamp-3 text-sm text-slate-400">
                      {project.description ||
                        "No project description provided."}
                    </p>

                    <div className="mt-5 flex items-center justify-between">

                      <span className="text-xs text-slate-500">
                        Created{" "}
                        {project.createdAt
                          ? new Date(
                              project.createdAt
                            ).toLocaleDateString()
                          : "—"}
                      </span>

                      <Link
                        to={`/projects/${project._id}`}
                        className="text-sm font-medium text-blue-400 hover:text-blue-300"
                      >
                        Open →
                      </Link>

                    </div>

                  </div>
                ))}

              </div>
            )}

        </section>

      </main>

      {/* Create Project Modal */}
      {showCreateModal && (
        <CreateProjectModal
          onClose={() =>
            setShowCreateModal(false)
          }
          onProjectCreated={
            handleProjectCreated
          }
        />
      )}

    </div>
  );
};

export default Dashboard;