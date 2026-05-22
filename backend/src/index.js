const express = require("express");
const cors = require("cors");

const authMiddleware = require("./middleware/authMiddleware");
const dynamodb = require("./config/dynamodb");

const { ScanCommand } = require("@aws-sdk/lib-dynamodb");

const taskRoutes = require("./routes/tasks");

const app = express();

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

// Error handlers
process.on("uncaughtException", (err) => {
  console.error("UNCAUGHT EXCEPTION:", err);
});

process.on("unhandledRejection", (err) => {
  console.error("UNHANDLED REJECTION:", err);
});

// Middleware
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

app.use(express.json());

// Request logger
app.use((req, res, next) => {
  console.log(`${req.method} ${req.originalUrl}`);
  next();
});

// Health check
app.get("/", (req, res) => {
  res.json({
    message: "Backend running",
  });
});

// Protected route test
app.get(
  "/protected",
  authMiddleware,
  (req, res) => {
    res.json({
      message: "Protected route works",
      user: req.user,
    });
  }
);

// DynamoDB test
app.get("/aws-test", async (req, res) => {
  try {
    const result = await dynamodb.send(
      new ScanCommand({
        TableName: "Tasks",
      })
    );

    console.log(
      "AWS TEST RESULT:",
      JSON.stringify(result, null, 2)
    );

    res.json(result);
  } catch (error) {
    console.error(
      "AWS TEST ERROR:",
      error
    );

    res.status(500).json({
      name: error?.name,
      message: error?.message,
    });
  }
});

// Task routes
app.use("/tasks", taskRoutes);

// Start server
const PORT = process.env.PORT || 5050;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});