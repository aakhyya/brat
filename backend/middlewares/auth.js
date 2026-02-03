const jwt = require('jsonwebtoken');
const User = require('../models/user');

// Protected routes
async function protect (req, res,next) {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, no token provided',
      });
    }
    
    try {
      const decodedUser=jwt.verify(token,process.env.JWT_SECRET);

      const user=await User.findById(decodedUser.id);
       if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, user no longer exists',
        });
      }

      req.user=user;
      next();
    } 
    catch (error) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
    
  } 
  catch (error) {
    console.error('Auth middleware error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication',
    });
  }
};

module.exports={protect};