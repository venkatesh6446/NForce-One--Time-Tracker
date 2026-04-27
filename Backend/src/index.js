import express from "express";
import dotenv from "dotenv";
import cors from "cors"; // 🔥 ADD THIS
import sequelize from "./config/db.js";

// ✅ Load models (IMPORTANT for Sequelize)
import "./models/client.model.js";
import "./models/project.model.js";
import "./models/task.model.js";
import "./models/timeEntry.model.js";

// Routes
import authRoutes from "./routes/auth.routes.js";
import clientRoutes from "./routes/client.routes.js";
import projectRoutes from "./routes/project.routes.js";
import taskRoutes from "./routes/task.routes.js";
import timeEntryRoutes from "./routes/timeEntry.routes.js";

// Middleware
import { protect, authorizeRoles } from "./middleware/auth.middleware.js";

dotenv.config();

const app = express();

/* ======================
   GLOBAL MIDDLEWARE
====================== */

// 🔥 VERY IMPORTANT FIX (CORS)
app.use(cors({
  origin: "http://localhost:5173", // frontend URL
  credentials: true
}));

app.use(express.json());

/* ======================
   HEALTH CHECK ROUTE
====================== */
app.get("/", (req, res) => {
  res.send("Backend running 🚀");
});

/* ======================
   AUTH ROUTES
====================== */
app.use("/api/auth", authRoutes);

/* ======================
   CLIENT ROUTES
====================== */
app.use("/api/clients", clientRoutes);

/* ======================
   PROJECT ROUTES
====================== */
app.use("/api/projects", projectRoutes);

/* ======================
   TASK ROUTES
====================== */
app.use("/api/tasks", taskRoutes);

/* ======================
   TIME ENTRY ROUTES
====================== */
app.use("/api/time-entries", timeEntryRoutes);

/* ======================
   PROTECTED TEST ROUTE
====================== */
app.get("/api/test", protect, (req, res) => {
  res.json({
    success: true,
    message: "Protected route accessed ✅",
    user: req.user,
  });
});

/* ======================
   ROLE-BASED TEST ROUTES
====================== */

// ADMIN ONLY
app.get(
  "/api/admin",
  protect,
  authorizeRoles("ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Admin 👑",
      user: req.user,
    });
  }
);

// MANAGER + ADMIN
app.get(
  "/api/manager",
  protect,
  authorizeRoles("MANAGER", "ADMIN"),
  (req, res) => {
    res.json({
      success: true,
      message: "Welcome Manager 👨‍💼",
      user: req.user,
    });
  }
);

/* ======================
   404 HANDLER
====================== */
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found ❌",
  });
});

/* ======================
   GLOBAL ERROR HANDLER
====================== */
app.use((err, req, res, next) => {
  console.error(err.stack);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Something went wrong ❌",
  });
});

/* ======================
   SERVER START
====================== */
const startServer = async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connected ✅");

    await sequelize.sync();
    console.log("Tables synced ✅");

    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT} 🚀`);
    });

  } catch (error) {
    console.error("Startup error ❌", error);
  }
};

startServer();