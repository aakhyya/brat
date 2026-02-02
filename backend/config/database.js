const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);

    console.log(`MongoDB Connected: ${conn.connection.host}`);

    mongoose.connection.on("error", (err) => {
      console.error("MongoDB connection error:", err);//AFTER INITIAL CONNECION, logs the error,
                                                      //but doesn't crash the app
    });

    mongoose.connection.on("disconnected", () => {
      console.warn("MongoDB disconnected");
    });

  } catch (error) {
    console.error("MongoDB connection failed:", error.message); //BEFORE INITIAL CONNECION
    process.exit(1);//kills the Node.js process-> 1 means: abnormal failure
  }
};

module.exports = connectDB;
