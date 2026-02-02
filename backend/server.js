require('dotenv').config();
const express=require("express");
const cors=require("cors");
const app=express();
const PORT=process.env.PORT || 3000;

// Imports
const connectDB = require('./config/database');

// Connect to database
connectDB();


//Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:false}));

//Routes
app.get("/", (req, res) => {
  res.json({ message: "Hello from brat" });
});


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


