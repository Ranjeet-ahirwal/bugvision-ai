const express = require("express");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


// ============================================================
// Protected User Route
// ============================================================

router.get("/profile", protect, (req, res) => {

    res.json({
        message: "You are authenticated.",
        userId: req.user.userId
    });

});


module.exports = router;