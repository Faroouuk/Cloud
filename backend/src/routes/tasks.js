const express = require("express");

const { v4: uuidv4 } = require("uuid");

const {
  PutCommand,
  ScanCommand,
  UpdateCommand,
  DeleteCommand,
  GetCommand,
} = require("@aws-sdk/lib-dynamodb");

const dynamodb = require("../config/dynamodb");

const authMiddleware =
  require("../middleware/authMiddleware");
const { requireRole } =
  require("../middleware/roleMiddleware");

const router = express.Router();

router.post(
  "/",
  authMiddleware,
  requireRole("Manager", "Admin"),
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
  requireRole("Employee", "Manager", "Admin"),
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
  requireRole("Manager", "Admin"),
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
  requireRole("Admin"),
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

router.post(
  "/:taskId/request-status-change",
  authMiddleware,
  requireRole("Employee", "Manager", "Admin"),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { requestedStatus, reason } = req.body;

      if (!taskId || taskId === "undefined") {
        return res.status(400).json({
          message: "Invalid taskId in request path",
        });
      }

      const validStatuses = [
        "To Do",
        "In Progress",
        "In Review",
        "Done",
      ];

      if (
        !requestedStatus ||
        !validStatuses.includes(requestedStatus)
      ) {
        return res.status(400).json({
          message:
            "Requested status is invalid.",
        });
      }

      const taskResult = await dynamodb.send(
        new GetCommand({
          TableName: "Tasks",
          Key: { taskId },
        })
      );

      if (!taskResult.Item) {
        console.warn("Task not found for request-status-change", taskId);
        return res.status(404).json({
          message: `Task not found for taskId ${taskId}`,
        });
      }

      const request = {
        taskId,
        requestId: uuidv4(),
        taskTitle: taskResult.Item.title || "",
        currentStatus: taskResult.Item.status || "",
        requestedStatus,
        reason: reason || "",
        requestedBy: req.user.username,
        requestedRole:
          req.user["custom:role"] ||
          (req.user["cognito:groups"] || [])[0] ||
          "",
        requestState: "Pending",
        createdAt: new Date().toISOString(),
      };

      await dynamodb.send(
        new PutCommand({
          TableName: "TaskStatusRequests",
          Item: request,
        })
      );

      res.json(request);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message:
          "Failed to submit status request",
      });
    }
  }
);

router.get(
  "/status-requests",
  authMiddleware,
  requireRole("Manager", "Admin"),
  async (req, res) => {
    try {
      const result = await dynamodb.send(
        new ScanCommand({
          TableName: "TaskStatusRequests",
        })
      );

      res.json(result.Items || []);
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to fetch status requests",
      });
    }
  }
);

router.post(
  "/status-requests/:taskId/approve",
  authMiddleware,
  requireRole("Manager", "Admin"),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { reviewReason } = req.body;

      const requestResult = await dynamodb.send(
        new GetCommand({
          TableName: "TaskStatusRequests",
          Key: { taskId },
        })
      );

      if (!requestResult.Item) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      const requestItem = requestResult.Item;

      await dynamodb.send(
        new UpdateCommand({
          TableName: "Tasks",
          Key: {
            taskId: requestItem.taskId,
          },
          UpdateExpression: "set #s = :status",
          ExpressionAttributeNames: {
            "#s": "status",
          },
          ExpressionAttributeValues: {
            ":status": requestItem.requestedStatus,
          },
        })
      );

      await dynamodb.send(
        new UpdateCommand({
          TableName: "TaskStatusRequests",
          Key: { taskId },
          UpdateExpression:
            "set requestState = :state, reviewReason = :reviewReason, reviewedAt = :reviewedAt",
          ExpressionAttributeValues: {
            ":state": "Approved",
            ":reviewReason": reviewReason || "",
            ":reviewedAt": new Date().toISOString(),
          },
        })
      );

      res.json({
        message: "Request approved",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to approve request",
      });
    }
  }
);

router.post(
  "/status-requests/:taskId/reject",
  authMiddleware,
  requireRole("Manager", "Admin"),
  async (req, res) => {
    try {
      const { taskId } = req.params;
      const { reviewReason } = req.body;

      const requestResult = await dynamodb.send(
        new GetCommand({
          TableName: "TaskStatusRequests",
          Key: { taskId },
        })
      );

      if (!requestResult.Item) {
        return res.status(404).json({
          message: "Request not found",
        });
      }

      await dynamodb.send(
        new UpdateCommand({
          TableName: "TaskStatusRequests",
          Key: { taskId },
          UpdateExpression:
            "set requestState = :state, reviewReason = :reviewReason, reviewedAt = :reviewedAt",
          ExpressionAttributeValues: {
            ":state": "Rejected",
            ":reviewReason": reviewReason || "",
            ":reviewedAt": new Date().toISOString(),
          },
        })
      );

      res.json({
        message: "Request rejected",
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({
        message: "Failed to reject request",
      });
    }
  }
);

module.exports = router;