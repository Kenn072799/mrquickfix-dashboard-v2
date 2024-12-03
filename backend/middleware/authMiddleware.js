import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Bearer ")) {
      return res.status(401).json({ 
        success: false,
        message: "Authorization header missing or invalid format" 
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ 
        success: false,
        message: "No token provided" 
      });
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      // Check token expiration
      const currentTimestamp = Math.floor(Date.now() / 1000);
      if (decoded.exp && decoded.exp < currentTimestamp) {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        });
      }

      // Check account status
      if (decoded.adminStatus === "deactivated") {
        return res.status(403).json({
          success: false,
          message: "Account is deactivated. Please contact administrator."
        });
      }

      req.user = {
        id: decoded.id,
        email: decoded.email,
        adminStatus: decoded.adminStatus,
        role: decoded.role
      };

      next();
    } catch (jwtError) {
      if (jwtError.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: "Invalid token"
        });
      }
      if (jwtError.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          message: "Token has expired"
        });
      }
      throw jwtError;
    }

  } catch (error) {
    console.error("Auth Middleware Error:", {
      timestamp: new Date().toISOString(),
      error: error.message,
      stack: error.stack
    });

    return res.status(500).json({
      success: false,
      message: "Internal server error during authentication"
    });
  }
};