const express = require("express");

const protect = require("../middleware/authMiddleware");

const {
    createProject,
    getProjects,
    getProjectById,
    updateProject,
    deleteProject
} = require("../controllers/projectController");

const router = express.Router();


// ============================================================
// Create Project
// ============================================================

router.post(
    "/",
    protect,
    createProject
);


// ============================================================
// Get All My Projects
// ============================================================

router.get(
    "/",
    protect,
    getProjects
);


// ============================================================
// Get Single Project
// ============================================================

router.get(
    "/:id",
    protect,
    getProjectById
);


// ============================================================
// Update Project
// ============================================================

router.put(
    "/:id",
    protect,
    updateProject
);


// ============================================================
// Delete Project
// ============================================================

router.delete(
    "/:id",
    protect,
    deleteProject
);


module.exports = router;