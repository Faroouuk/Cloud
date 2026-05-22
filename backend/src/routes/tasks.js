const express = require("express");

const { v4: uuidv4 } = require("uuid");

const {
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamodb = require("../config/dynamodb");

const authMiddleware =
  require("../middleware/authMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const {
        title,
        description,
        status,
        priority,
        teamId,
        assigneeId,
      } = req.body;

      const task = {
        taskId: uuidv4(),

        title,

        description,

        status,

        priority,

        teamId,

        assigneeId,

        createdBy:
          req.user.username,

        createdAt:
          new Date().toISOString(),
      };

      await dynamodb.send(
        new PutCommand({
          TableName: "Tasks",

          Item: task,
        })
      );

      res.json(task);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to create task",
      });
    }
  }
);

router.get(
  "/",
  authMiddleware,
  async (req, res) => {
    try {
      const result =
        await dynamodb.send(
          new ScanCommand({
            TableName: "Tasks",
          })
        );

      res.json(result.Items);
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to fetch tasks",
      });
    }
  }
);

router.put(
  "/:taskId",
  authMiddleware,
  async (req, res) => {
    try {
      const { taskId } = req.params;

      const {
        title,
        description,
        status,
        priority,
        teamId,
        assigneeId,
      } = req.body;

      await dynamodb.send(
        new UpdateCommand({
          TableName: "Tasks",

          Key: { taskId },

          UpdateExpression:
            "set #s = :status, title = :title, description = :description, priority = :priority, teamId = :teamId, assigneeId = :assigneeId",

          ExpressionAttributeNames: {
            "#s": "status",
          },

          ExpressionAttributeValues: {
            ":status": status,
            ":title": title,
            ":description":
              description,
            ":priority": priority,
            ":teamId": teamId,
            ":assigneeId":
              assigneeId,
          },
        })
      );

      res.json({
        message:
          "Task updated successfully",

        taskId,

        status,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to update task",
      });
    }
  }
);

router.delete(
  "/:taskId",
  authMiddleware,
  async (req, res) => {
    try {
      const { taskId } = req.params;

      await dynamodb.send(
        new DeleteCommand({
          TableName: "Tasks",

          Key: {
            taskId,
          },
        })
      );

      res.json({
        message:
          "Task deleted successfully",

        taskId,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Failed to delete task",
      });
    }
  }
);

module.exports = router;