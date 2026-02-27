require('dotenv').config();
const express=require("express");
const cors=require("cors");
const app=express();
const PORT=process.env.PORT || 3000;

// Imports
const connectDB = require('./config/database');
const authRoutes=require('./routes/authRoutes');
const { apiLimiter } = require('./middlewares/rateLimiter');
const contentRoutes = require("./routes/contentRoutes");

// Connect to database
connectDB();

//Middlewares
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://brat-ju80.onrender.com'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({extended:false}));

// Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from brat" });
});

// Auth routes with auth-specific rate limiter
app.use('/api/auth', authRoutes);

// Content routes with general rate limiter
app.use('/api/content', apiLimiter, contentRoutes);


//404 Handler
app.use((req,res)=>{
    res.status(404).json({
        success:false,
        message:`Route not found!`
    });
});

app.listen(PORT, ()=>{
    console.log(`Port started on: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || "development"}`)
});


//Users:
//1. Test 1 : test1@gmail.com 1234567