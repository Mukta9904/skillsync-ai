require("dotenv").config({
  path: "./.env",
});

const app = require("./app.js");
const connectDB = require("./db/index.js");

connectDB()
  .then(() => {
    app.on("error", (error) => {
      console.error("Express Error:", error);
      throw error;
    });

    const PORT = process.env.PORT || 3000;

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("❌ MongoDB Connection Error:", error);
  });


