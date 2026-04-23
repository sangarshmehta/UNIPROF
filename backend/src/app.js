const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const crypto = require("crypto");
const env = require("./config/env");
const authRoutes = require("./routes/authRoutes");
const teacherRoutes = require("./routes/teacherRoutes");
const studentRoutes = require("./routes/studentRoutes");
const adminRoutes = require("./routes/adminRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const { apiRateLimiter } = require("./middleware/rateLimit");

const app = express();

app.disable("x-powered-by");
app.use(helmet());
app.use(express.json({ limit: "1mb" }));
app.use((req, res, next) => {
  req.requestId = crypto.randomUUID();
  res.setHeader("x-request-id", req.requestId);
  next();
});

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow server-to-server or same-origin requests (no Origin header).
      if (!origin) return callback(null, true);

      // Explicit wildcard – only set CORS_ORIGIN=* in development/local.
      if (env.CORS_ORIGINS.includes("*")) return callback(null, true);

      // Empty allow-list → open in development, closed in production.
      if (!env.CORS_ORIGINS.length) {
        if (env.NODE_ENV !== "production") return callback(null, true);
        return callback(new Error("CORS_ORIGIN is not configured"));
      }

      // Vercel preview URLs are always allowed (team deploys).
      if (/^https:\/\/.*\.vercel\.app$/.test(origin)) return callback(null, true);

      // Strict whitelist check.
      if (env.CORS_ORIGINS.includes(origin)) return callback(null, true);

      return callback(new Error("Origin not allowed by CORS"));
    },
    credentials: true,
  }),
);

app.use(apiRateLimiter);

app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

app.get("/health", (req, res) => {
  res.json({ status: "ok", env: env.NODE_ENV });
});

app.use("/api", authRoutes);
app.use("/api", teacherRoutes);
app.use("/api", studentRoutes);
app.use("/api", adminRoutes);
app.use("/api", notificationRoutes);
app.use("/api", uploadRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((error, req, res, next) => {
  const status = Number(error.status) || 500;
  const isProd = env.NODE_ENV === "production";
  if (status >= 500) {
    console.error(`[${req.requestId}]`, error);
  }
  return res.status(status).json({
    message: status >= 500 && isProd ? "Internal server error" : error.message || "Internal server error",
    request_id: req.requestId,
  });
});

module.exports = app;
