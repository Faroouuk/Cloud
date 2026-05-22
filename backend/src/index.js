const express = require("express");
const cors = require("cors");

const authMiddleware = require("./middleware/authMiddleware");

const app = express();
const dynamodb =
  require("./config/dynamodb");

const {
  ScanCommand,
} = require("@aws-sdk/lib-dynamodb");

const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:3001",
];

app.use(
  cors({
    origin(origin, callback) {
      if (
        !origin ||
        allowedOrigins.includes(origin)
      ) {
        callback(null, true);
        return;
      }

      callback(
        new Error("Not allowed by CORS")
      );
    },
    credentials: true,
  })
);

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Backend running",
  });
});

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



app.get("/aws-test", async (req, res) => {
  try {
    const result =
      await dynamodb.send(
        new ScanCommand({
          TableName: "Tasks",
        })
      );

    res.json(result);
  } catch (error) {
    console.error(error);

    res.status(500).json(error);
  }
});



const taskRoutes =
  require("./routes/tasks");

app.use("/tasks", taskRoutes);
const PORT = 5050;

app.listen(PORT, () => {
  console.log(
    `Server running on port ${PORT}`
  );
});
