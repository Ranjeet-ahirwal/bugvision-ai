import { useState } from "react";

import api from "../services/api";

const CreateProjectModal = ({
  onClose,
  onProjectCreated
}) => {
  const [formData, setFormData] = useState({
    name: "",
    description: ""
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    setError("");

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post(
        "/projects",
        {
          name: formData.name.trim(),
          description: formData.description.trim()
        }
      );

      onProjectCreated(response.data.project);

      onClose();
    } catch (error) {
      console.error(
        "Create project error:",
        error
      );

      setError(
        error.response?.data?.message ||
          "Failed to create project."
      );
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
              Create New Project
            </h2>

            <p className="mt-1 text-sm text-slate-400">
              Add a project to start analyzing software defects.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="text-xl text-slate-400 hover:text-white"
          >
            ×
          </button>

        </div>


        {/* Error */}
        {error && (
          <div className="mt-5 rounded-lg border border-red-800 bg-red-950/40 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        )}


        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="mt-6 space-y-5"
        >

          {/* Name */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Project Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. BugVision Test Project"
              maxLength={100}
              required
              className="w-full rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

          </div>


          {/* Description */}
          <div>

            <label className="mb-2 block text-sm font-medium text-slate-300">
              Description
            </label>

            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Describe your project..."
              maxLength={500}
              rows={4}
              className="w-full resize-none rounded-lg border border-slate-700 bg-slate-800 px-4 py-3 text-white outline-none placeholder:text-slate-500 focus:border-blue-500"
            />

            <p className="mt-1 text-right text-xs text-slate-500">
              {formData.description.length}/500
            </p>

          </div>


          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-2">

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
              disabled={loading}
              className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading
                ? "Creating..."
                : "Create Project"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
};

export default CreateProjectModal;