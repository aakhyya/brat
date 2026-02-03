const User = require('../models/user');
const jwt = require('jsonwebtoken');

async function signup (req, res){
  try {
    const { email, password, displayName } = req.body;
        if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'All credentials required!',
      });
    }

    const existingUser=await User.findOne({email});
    if(existingUser){
        return res.status(400).json({
            success: false,
            message: 'Email already exists',
        });
    }
    
    const user=await User.create({
        email,
        password,
        profile:{
            displayName,
        },
    });
    const token=user.generateAuthToken();
    
    res.status(201).json({
      success: true,
      message: 'User signed up successfully',
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.profile.displayName,
          onboardingCompleted: user.onboardingCompleted,
        },
        token,
      },
    });
    
  } catch (error) {
    console.error('Signup error:', error);
    
    //duplicate email error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }
    
    res.status(500).json({
      success: false,
      message: 'Server error during Signup',
      error: error.message,
    });
  }
};

// POST /api/auth/login
async function login(req, res){
  try {
    const { email, password } = req.body;
    if(!email || !password){
        return res.status(400).json({
            success:false,
            message:'All credentials are required!'
        });
    }
    
    const user=await User.findOne({email}).select('+password'); //including password explicitly
     if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }
    
    const isMatch=await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token= user.generateAuthToken();
    
    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          email: user.email,
          displayName: user.profile.displayName,
          onboardingCompleted: user.onboardingCompleted,
        },
        token,
      },
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login',
      error: error.message,
    });
  }
};

// GET /api/auth/me
async function getMe(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }
    
    res.json({
      success: true,
      data: { user },
    });
    
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message,
    });
  }
};

module.exports={signup,login,getMe};