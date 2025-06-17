import express, { Request, Response } from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import cors from "cors";
import dotenv from "dotenv";
import { v4 as uuidv4 } from "uuid";
import { databaseService } from "./database/connection";
import { webSocketService } from "./services/webSocketService";
import { messageController } from "./controllers/messageController";
import { logger } from "./utils/logger";
import { ServerConfig, WebSocketMessage } from "./types";
import {
  DEFAULT_CONFIG,
  MESSAGE_TYPES,
  ERROR_MESSAGES,
} from "./utils/constants";

dotenv.config();

const config: ServerConfig = {
  port: parseInt(process.env.PORT || String(DEFAULT_CONFIG.PORT)),
  mongoUri: process.env.MONGODB_URI || DEFAULT_CONFIG.MONGODB_URI,
  dbName: process.env.MONGODB_DB_NAME || DEFAULT_CONFIG.DB_NAME,
  corsOrigin: process.env.CORS_ORIGIN || DEFAULT_CONFIG.CORS_ORIGINS,
  maxMessageLength: parseInt(process.env.MAX_MESSAGE_LENGTH || "500"),
  messageHistoryLimit: parseInt(process.env.MESSAGE_HISTORY_LIMIT || "50"),
};

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server });

// Middleware
app.use(cors({ origin: config.corsOrigin, credentials: true }));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

app.use((req: Request, res: Response, next) => {
  logger.debug(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get("User-Agent"),
  });
  next();
});

// Routes
app.get("/", (req, res) => {
  res.json({
    message: "Chat Application Backend Server",
    status: "running",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
  });
});

app.get("/health", async (req, res) => {
  try {
    const dbHealth = await databaseService.healthCheck();
    const wsStats = webSocketService.getConnectionStats();
    const messageStats = await messageController.getMessageStats();

    res.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      database: {
        connected: dbHealth,
        connectionInfo: databaseService.getConnectionInfo(),
      },
      websocket: {
        connections: wsStats.totalConnections,
        connectedUsers: wsStats.connectedUsers.length,
        longestConnection: wsStats.longestConnection,
      },
      messages: messageStats,
    });
  } catch (error) {
    logger.error("Health check failed:", error);
    res.status(500).json({ status: "unhealthy", error: "Health check failed" });
  }
});

app.get("/api/messages", async (req, res) => {
  try {
    const limit =
      parseInt(req.query.limit as string) || config.messageHistoryLimit;
    const messages = await messageController.getRecentMessages(limit);
    res.json({ success: true, data: messages, count: messages.length });
  } catch (error) {
    logger.error("Failed to fetch messages:", error);
    res.status(500).json({ success: false, error: "Failed to fetch messages" });
  }
});

app.get("/api/stats", async (req, res) => {
  try {
    const messageStats = await messageController.getMessageStats();
    const wsStats = webSocketService.getConnectionStats();
    res.json({
      success: true,
      data: { messages: messageStats, connections: wsStats },
    });
  } catch (error) {
    logger.error("Failed to fetch stats:", error);
    res
      .status(500)
      .json({ success: false, error: "Failed to fetch statistics" });
  }
});

app.use((req, res) => {
  res.status(404).json({
    error: "Endpoint not found",
    path: req.originalUrl,
    method: req.method,
    availableEndpoints: [
      "GET /",
      "GET /health",
      "GET /api/messages",
      "GET /api/stats",
    ],
  });
});

app.use((error: Error, req: Request, res: Response) => {
  logger.error("Express error handler:", error);
  res.status(500).json({
    error: "Internal server error",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Something went wrong",
  });
});

// WebSocket Setup
wss.on("connection", (ws: WebSocket, req) => {
  const clientId = uuidv4();
  const clientIP = req.socket.remoteAddress;
  let username: string | null = null;
  let isAuthenticated = false;

  logger.websocket("CONNECTION_ATTEMPT", clientId, {
    ip: clientIP,
    userAgent: req.headers["user-agent"],
  });

  ws.on("message", async (data: Buffer) => {
    try {
      const message: WebSocketMessage = JSON.parse(data.toString());

      if (!isAuthenticated && message.type === MESSAGE_TYPES.JOIN) {
        if (
          !message.username ||
          !messageController.validateUsername(message.username)
        ) {
          sendError(ws, ERROR_MESSAGES.INVALID_USERNAME);
          ws.close(1008, ERROR_MESSAGES.INVALID_USERNAME);
          return;
        }

        username = message.username.trim();
        isAuthenticated = true;
        webSocketService.addClient(clientId, username, ws);

        try {
          const history = await messageController.getRecentMessages(
            config.messageHistoryLimit
          );
          ws.send(
            JSON.stringify({ type: MESSAGE_TYPES.HISTORY, messages: history })
          );
        } catch {
          sendError(ws, ERROR_MESSAGES.DATABASE_ERROR);
        }
      } else if (isAuthenticated && message.type === MESSAGE_TYPES.MESSAGE) {
        if (
          !message.message ||
          !messageController.validateMessage(message.message)
        ) {
          sendError(ws, ERROR_MESSAGES.MESSAGE_TOO_LONG);
          return;
        }

        const saved = await messageController.saveMessage(
          username!,
          message.message
        );
        webSocketService.broadcastMessage({
          type: MESSAGE_TYPES.MESSAGE,
          username: saved.username,
          message: saved.message,
          timestamp: saved.timestamp.toISOString(),
        });
      } else {
        sendError(
          ws,
          isAuthenticated
            ? ERROR_MESSAGES.INVALID_MESSAGE_TYPE
            : "Authentication required"
        );
        if (!isAuthenticated) ws.close(1008, "Authentication required");
      }
    } catch (error) {
      logger.error(`WebSocket error for ${clientId}:`, error);
      sendError(ws, ERROR_MESSAGES.INTERNAL_SERVER_ERROR);
    }
  });

  ws.on("close", (code, reason) => {
    if (isAuthenticated) webSocketService.removeClient(clientId);
    logger.websocket("CONNECTION_CLOSED", clientId, {
      username,
      code,
      reason: reason.toString(),
    });
  });

  ws.on("error", (err) => {
    logger.error(`WebSocket error for ${clientId}:`, err);
    if (isAuthenticated) webSocketService.removeClient(clientId);
  });

  setTimeout(() => {
    if (!isAuthenticated) {
      logger.warn(`Authentication timeout for client ${clientId}`);
      ws.close(1008, "Authentication timeout");
    }
  }, 10000);
});

wss.on("error", (error: Error) => {
  logger.error("WebSocket server error:", error);
});

// Error sending function
function sendError(ws: WebSocket, message: string) {
  if (ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify({ type: MESSAGE_TYPES.ERROR, error: message }));
  }
}

// Graceful shutdown
const shutdown = async (signal: string) => {
  logger.info(`Received ${signal}, shutting down...`);
  try {
    wss.close(() => logger.info("WebSocket server closed"));
    webSocketService.disconnectAllClients();
    webSocketService.stopHeartbeat();
    await databaseService.disconnect();
    server.close(() => {
      logger.info("HTTP server closed");
      process.exit(0);
    });

    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 10000);
  } catch (error) {
    logger.error("Shutdown error:", error);
    process.exit(1);
  }
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
process.on("uncaughtException", (error) => {
  logger.error("Uncaught Exception:", error);
  shutdown("uncaughtException");
});
process.on("unhandledRejection", (reason, promise) => {
  shutdown("unhandledRejection");
});

// Start Server
(async () => {
  try {
    await databaseService.connect();
    server.listen(config.port, () => {
      logger.info("Server running", {
        port: config.port,
        environment: process.env.NODE_ENV || "development",
      });
    });
  } catch (error) {
    logger.error("Startup failed:", error);
    process.exit(1);
  }
})();
