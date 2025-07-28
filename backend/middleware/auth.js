const jwt = require('jsonwebtoken');
const User = require('../models/User');
const dotenv = require("dotenv");

dotenv.config();

// Protect routes
exports.protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in headers
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      // Set token from Bearer token in header
      token = req.headers.authorization.split(' ')[1];
    }

    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }

    
      // Verify token
      try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Get user from the token
        req.user = await User.findById(decoded.id);
  
        if (!req.user) {
          return res.status(401).json({
            success: false,
            message: 'User not found'
          });
        }
      }catch(error){
        return res.status(401).json({
          success : false,
          message:'Something went wrong whiel verifying the token',
        })
      }

      next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized to access this route'
    });
  }
}; 