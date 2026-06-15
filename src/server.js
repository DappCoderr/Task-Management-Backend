import express from "express";
import cookieParser from "cookie-parser";
import { CROS_PATH, PORT } from "./config/serverConfig.js";
import { connectDB } from "./config/database.js";
import { errorHandler } from "./middlewares/errorHandler.js";
import v1Routes from "./routes/v1/index.js";
import { sequelize } from "./config/database.js";
import cors from "cors";

const app = express();

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: CROS_PATH, credentials: true }));
app.use("/api/v1", v1Routes);

app.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Server is running",
  });
});

async function startServer() {
  try {
    await connectDB();
    await sequelize.sync({ alter: true });
    app.listen(PORT, () => {
      console.log(`Server running on PORT: ${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server");
    console.error(error);
    process.exit(1);
  }
}

startServer();
