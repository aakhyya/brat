const express=require("express");
const router=express.Router();
const { authLimiter } = require('../middlewares/rateLimiter');

const { signup, login, getMe, getTasteProfile, getTasteGraphData} = require('../controllers/authController');
const { protect } = require('../middlewares/auth');

// Public routes
router.post('/signup',authLimiter, signup);
router.post('/login',authLimiter, login);

// Protected routes
router.get('/me', protect, getMe);
router.get('/taste-profile', protect, getTasteProfile);
router.get('/taste-graph', protect, getTasteGraphData);

module.exports=router;