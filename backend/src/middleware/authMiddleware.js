const jwt = require("jsonwebtoken");


// ============================================================
// Authenticate User
// ============================================================

const protect = (req, res, next) => {

    try {

        // ----------------------------------------------------
        // Get Authorization header
        // ----------------------------------------------------

        const authHeader = req.headers.authorization;


        if (!authHeader) {

            return res.status(401).json({
                message: "Authentication required."
            });

        }


        // ----------------------------------------------------
        // Check Bearer token format
        // ----------------------------------------------------

        if (!authHeader.startsWith("Bearer ")) {

            return res.status(401).json({
                message: "Invalid authentication format."
            });

        }


        // ----------------------------------------------------
        // Extract token
        // ----------------------------------------------------

        const token = authHeader.split(" ")[1];


        // ----------------------------------------------------
        // Verify token
        // ----------------------------------------------------

        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        // ----------------------------------------------------
        // Attach user information to request
        // ----------------------------------------------------

        req.user = decoded;


        // ----------------------------------------------------
        // Continue to protected route
        // ----------------------------------------------------

        next();

    } catch (error) {

        console.error("Authentication error:", error.message);

        return res.status(401).json({
            message: "Invalid or expired token."
        });

    }
};


module.exports = protect;