const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    await mongoose.connect(
      "mongodb+srv://ethanjlefevre27_db_user:rkAKcae7nzndSWoa@michiganwrestlingdataba.x0pj7xg.mongodb.net/wrestling?retryWrites=true&w=majority"
    );
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

module.exports = connectDB;