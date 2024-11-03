import jwt from 'jsonwebtoken';

export const authMiddleware = (req, res, next) => {
    const token = req.cookies.token || req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ message: 'Authorization required. No token provided.' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) {
          if (err.name === 'TokenExpiredError') {
              return res.status(403).json({ message: 'Token has expired. Please log in again.' });
          }
          return res.status(403).json({ message: 'Invalid token.' });
      }
      req.userId = decoded.userId;
      next();
  });
};
