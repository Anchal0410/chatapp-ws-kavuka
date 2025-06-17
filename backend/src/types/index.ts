export interface IMessage {
  _id?: string;
  username: string;
  message: string;
  timestamp: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface WebSocketMessage {
  type: "join" | "message" | "history" | "error";
  username?: string;
  message?: string;
  timestamp?: string;
  messages?: IMessage[];
  error?: string;
}

export interface ConnectedClient {
  id: string;
  username: string;
  ws: any;
  isAlive: boolean;
  connectedAt: Date;
}

export interface ServerConfig {
  port: number;
  mongoUri: string;
  dbName: string;
  corsOrigin: string;
  maxMessageLength: number;
  messageHistoryLimit: number;
}

export interface DatabaseConnection {
  isConnected: boolean;
  connectionString: string;
  dbName: string;
}

export interface WebSocketServiceInterface {
  clients: Map<string, ConnectedClient>;
  addClient: (clientId: string, username: string, ws: any) => void;
  removeClient: (clientId: string) => void;
  broadcastMessage: (
    message: WebSocketMessage,
    excludeClientId?: string
  ) => void;
  getClientCount: () => number;
  getConnectionStats: () => {
    totalConnections: number;
    connectedUsers: string[];
    longestConnection: number;
  };
  disconnectAllClients: () => void;
  startHeartbeat: () => void;
  stopHeartbeat: () => void;
  sendToClient: (clientId: string, message: WebSocketMessage) => void;
  getConnectedUsers: () => string[];
}

export interface MessageControllerInterface {
  saveMessage: (username: string, message: string) => Promise<IMessage>;
  getRecentMessages: (limit?: number) => Promise<IMessage[]>;
  validateMessage: (message: string) => boolean;
  validateUsername: (username: string) => boolean;
  getMessageStats: () => Promise<{
    totalMessages: number;
    uniqueUsers: number;
    recentActivity: Date | null;
  }>;
  deleteOldMessages: (olderThanDays?: number) => Promise<number>;
}

export interface HealthCheckResponse {
  status: "healthy" | "unhealthy";
  timestamp: string;
  database: {
    connected: boolean;
    connectionInfo: DatabaseConnection;
  };
  websocket: {
    connections: number;
    connectedUsers: number;
    longestConnection: number;
  };
  messages: {
    totalMessages: number;
    uniqueUsers: number;
    recentActivity: Date | null;
  };
}

export interface APIResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  count?: number;
  timestamp?: string;
}

export interface MessageStats {
  totalMessages: number;
  uniqueUsers: number;
  recentActivity: Date | null;
}

export interface ConnectionStats {
  totalConnections: number;
  connectedUsers: string[];
  longestConnection: number;
}

export interface ClientConnectionInfo {
  clientId: string;
  username: string;
  ip?: string;
  userAgent?: string;
  connectedAt: Date;
}

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export interface LogData {
  [key: string]: any;
}

export interface WebSocketErrorMessage {
  type: "error";
  error: string;
  code?: string;
  timestamp?: string;
}

export interface WebSocketJoinMessage {
  type: "join";
  username: string;
}

export interface WebSocketChatMessage {
  type: "message";
  message: string;
}

export interface WebSocketHistoryMessage {
  type: "history";
  messages: IMessage[];
}

export interface WebSocketBroadcastMessage {
  type: "message";
  username: string;
  message: string;
  timestamp: string;
}

export type WebSocketIncomingMessage =
  | WebSocketJoinMessage
  | WebSocketChatMessage;
export type WebSocketOutgoingMessage =
  | WebSocketHistoryMessage
  | WebSocketBroadcastMessage
  | WebSocketErrorMessage;
