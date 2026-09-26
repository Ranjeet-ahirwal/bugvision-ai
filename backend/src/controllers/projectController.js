const Project = require("../models/Project");
const mongoose = require("mongoose");


// ============================================================
// Create Project
// ============================================================

const createProject = async (req, res) => {

    try {

        const { name, description } = req.body;


        // ----------------------------------------------------
        // Validate project name
        // ----------------------------------------------------

        if (!name || !name.trim()) {

            return res.status(400).json({
                message: "Project name is required."
            });

        }


        // ----------------------------------------------------
        // Create project
        // ----------------------------------------------------

        const project = await Project.create({

            name: name.trim(),

            description: description
                ? description.trim()
                : "",

            owner: req.user.userId

        });


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.status(201).json({

            message: "Project created successfully.",

            project

        });

    } catch (error) {

        console.error(
            "Create project error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error while creating project."
        });

    }
};


// ============================================================
// Get My Projects
// ============================================================

const getProjects = async (req, res) => {

    try {

        const projects = await Project.find({
            owner: req.user.userId
        }).sort({
            createdAt: -1
        });


        return res.status(200).json({

            count: projects.length,

            projects

        });

    } catch (error) {

        console.error(
            "Get projects error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error while fetching projects."
        });

    }
};



// ============================================================
// Get Single Project
// ============================================================

// ============================================================
// Get Single Project
// ============================================================

const getProjectById = async (req, res) => {

    try {

        // ----------------------------------------------------
        // Validate MongoDB ObjectId
        // ----------------------------------------------------

        if (!mongoose.Types.ObjectId.isValid(req.params.id)) {

            return res.status(400).json({
                message: "Invalid project ID."
            });

        }


        // ----------------------------------------------------
        // Find project belonging to logged-in user
        // ----------------------------------------------------

        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });


        if (!project) {

            return res.status(404).json({
                message: "Project not found."
            });

        }


        // ----------------------------------------------------
        // Response
        // ----------------------------------------------------

        return res.status(200).json({
            project
        });

    } catch (error) {

        console.error(
            "Get project error:",
            error
        );

        return res.status(500).json({
            message: "Server error while fetching project."
        });

    }
};

// ============================================================
// Update Project
// ============================================================

const updateProject = async (req, res) => {

    try {

        const { name, description } = req.body;


        const project = await Project.findOne({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!project) {

            return res.status(404).json({
                message: "Project not found."
            });

        }


        // ----------------------------------------------------
        // Update name
        // ----------------------------------------------------

        if (name !== undefined) {

            if (!name.trim()) {

                return res.status(400).json({
                    message: "Project name cannot be empty."
                });

            }

            project.name = name.trim();
        }


        // ----------------------------------------------------
        // Update description
        // ----------------------------------------------------

        if (description !== undefined) {

            project.description = description.trim();
        }


        await project.save();


        return res.status(200).json({

            message: "Project updated successfully.",

            project

        });

    } catch (error) {

        console.error(
            "Update project error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error while updating project."
        });

    }
};


// ============================================================
// Delete Project
// ============================================================

const deleteProject = async (req, res) => {

    try {

        const project = await Project.findOneAndDelete({
            _id: req.params.id,
            owner: req.user.userId
        });

        if (!project) {

            return res.status(404).json({
                message: "Project not found."
            });

        }


        return res.status(200).json({

            message: "Project deleted successfully."

        });

    } catch (error) {

        console.error(
            "Delete project error:",
            error.message
        );

        return res.status(500).json({
            message: "Server error while deleting project."
        });

    }
};

module.exports = {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
};