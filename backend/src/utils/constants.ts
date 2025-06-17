export const MESSAGE_TYPES = {
  JOIN: "join",
  MESSAGE: "message",
  HISTORY: "history",
  ERROR: "error",
} as const;

export const WS_CLOSE_CODES = {
  NORMAL: 1000,
  GOING_AWAY: 1001,
  PROTOCOL_ERROR: 1002,
  UNSUPPORTED_DATA: 1003,
  INVALID_FRAME_PAYLOAD_DATA: 1007,
  POLICY_VIOLATION: 1008,
  MESSAGE_TOO_BIG: 1009,
  INTERNAL_ERROR: 1011,
} as const;

export const ERROR_MESSAGES = {
  INVALID_MESSAGE_TYPE: "Invalid message type",
  MESSAGE_TOO_LONG: "Message exceeds maximum length",
  EMPTY_MESSAGE: "Message cannot be empty",
  INVALID_USERNAME: "Invalid username",
  USERNAME_TOO_LONG: "Username exceeds maximum length",
  DATABASE_ERROR: "Database operation failed",
  CONNECTION_ERROR: "Connection error occurred",
  INTERNAL_SERVER_ERROR: "Internal server error",
} as const;

export const LIMITS = {
  MAX_MESSAGE_LENGTH: process.env.MAX_MESSAGE_LENGTH
    ? parseInt(process.env.MAX_MESSAGE_LENGTH)
    : 500,
  MAX_USERNAME_LENGTH: 20,
  MESSAGE_HISTORY_LIMIT: process.env.MESSAGE_HISTORY_LIMIT
    ? parseInt(process.env.MESSAGE_HISTORY_LIMIT)
    : 50,
  HEARTBEAT_INTERVAL: 30000,
  CONNECTION_TIMEOUT: 60000,
} as const;

export const DEFAULT_CONFIG = {
  PORT: 8080,
  MONGODB_URI: process.env.MONGODB_URI!,
  DB_NAME: "chatapp",
  CORS_ORIGIN: "http://localhost:3000",
} as const;
