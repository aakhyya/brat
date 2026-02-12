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

const DIMENSION_LABELS = [
  // 0–9 Genres
  "Action", "Comedy", "Drama", "Horror", "Romance",
  "Sci-Fi", "Thriller", "Fantasy", "Documentary", "Mystery",

  // 10–15 Mood
  "Uplifting", "Dark Mood", "Intense", "Calm",
  "Energetic", "Emotional",

  // 16–21 Themes
  "Love Theme", "Revenge Theme", "Coming-of-Age",
  "Survival", "Power Struggles", "Identity",

  // 22–25 Era
  "Classic Era", "Modern Era",
  "Contemporary Era", "Futuristic",

  // 26–29 Complexity
  "Simple Storytelling", "Layered Storytelling",
  "Experimental Style", "Fast-Paced"
];

async function getTasteProfile(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const vector = user.tasteVector;

    if (!vector || vector.length !== 30) {
      return res.status(200).json({
        success: true,
        strongPreferences: [],
        weakPreferences: [],
        message: "No taste data yet. Rate some content!"
      });
    }

    const mapped = vector.map((value, index) => ({
      dimension: DIMENSION_LABELS[index],
      value
    }));

    // Strongest (highest absolute values)
    const strongPreferences = [...mapped]
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value))
      .slice(0, 5);

    // Weakest (closest to zero)
    const weakPreferences = [...mapped]
      .sort((a, b) => Math.abs(a.value) - Math.abs(b.value))
      .slice(0, 5);

    res.status(200).json({
  success: true,
  data: {
    strongPreferences,
    weakPreferences
  }
});

  } catch (error) {
    console.error("Taste profile error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch taste profile"
    });
  }
}

module.exports={signup,login,getMe,getTasteProfile};