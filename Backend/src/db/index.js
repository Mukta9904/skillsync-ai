const mongoose = require("mongoose");
const { DB_NAME } = require("../constants.js");

// DNS configuaration for Mongodb Connection 
const dns = require("dns")
dns.setServers(["1.1.1.1", "8.8.8.8"])

const connectDB = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      `${process.env.MONGODB_URI}/${DB_NAME}`
    );

    console.log(
      `✅ MongoDB Connected: ${connectionInstance.connection.host}/${connectionInstance.connection.name}`
    );

    return connectionInstance;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;
