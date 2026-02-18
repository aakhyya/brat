const User = require('../models/user');
const jwt = require('jsonwebtoken');

async function signup(req, res) {
  try {
    const { email, password, displayName } = req.body;
    if (!email || !password || !displayName) {
      return res.status(400).json({
        success: false,
        message: 'All credentials required!',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists',
      });
    }

    const user = await User.create({
      email,
      password,
      profile: {
        displayName,
      },
    });
    const token = user.generateAuthToken();

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
async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'All credentials are required!'
      });
    }

    const user = await User.findOne({ email }).select('+password'); //including password explicitly
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = user.generateAuthToken();

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

async function getTasteGraphData(req, res) {
  try{
    const userId=req.user._id;
    const user=await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found"
      });
    }

    const vector=user.tasteVector;
    console.log("User taste vector:", vector);
    console.log("Max value:", Math.max(...vector.map(v => Math.abs(v))));
    if (!vector || vector.length !== 30) {
      return res.status(200).json({
        success: true,
        message: "No taste data yet. Rate some content!",
        data: {
          nodes: [],
          edges: []
        }
      });
    }

    const categories = {
      genre: { start: 0, end: 9, color: "#d8b4fe" }, // purple
      mood: { start: 10, end: 15, color: "#86efac" }, // green
      theme: { start: 16, end: 21, color: "#67e8f9" }, // cyan
      era: { start: 22, end: 25, color: "#f9a8d4" }, // pink
      complexity: { start: 26, end: 29, color: "#fcd34d" } // amber
    };

    const nodes = [];
    for (let i = 0; i < vector.length; i++) { //making nodes
      const value = vector[i];
      let category = "other";
      let color = "#6b7280"; //gray default
      
      for (const [catName, catInfo] of Object.entries(categories)) {
        if (i >= catInfo.start && i <= catInfo.end) {
          category = catName;
          color = catInfo.color;
          break;
        }
      }

      nodes.push({
        id:i,
        label:DIMENSION_LABELS[i],
        value:value,
        category: category,
        color: color, //Colors = categories
      });
    }

     // Create edges between related nodes
    const edges = [];
    const threshold = 0.04; // only meaningful connections
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
         // Connect if both values are above threshold
        if (Math.abs(node1.value) > threshold && Math.abs(node2.value) > threshold) {
          const avgStrength = (Math.abs(node1.value) + Math.abs(node2.value)) / 2;
          edges.push({
            source: i,
            target: j,
            strength: avgStrength
          });
        }
      }
    }

    return res.status(200).json({
      success: true,
      data: {
        nodes: nodes,// taste dimensions
        edges: edges //strong co-preferences
      }
    });

  }
  catch(err){
    console.error("Taste graph error:", err);
    res.status(500).json({
      success: false,
      message: "Failed to fetch taste graph"
    });
  }
}

module.exports = { signup, login, getMe, getTasteProfile, getTasteGraphData };