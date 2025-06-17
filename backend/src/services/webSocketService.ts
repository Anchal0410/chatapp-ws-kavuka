import { WebSocket } from "ws";
import {
  ConnectedClient,
  WebSocketMessage,
  WebSocketServiceInterface,
} from "../types";
import { logger } from "../utils/logger";
import { WS_CLOSE_CODES, LIMITS } from "../utils/constants";

const clients: Map<string, ConnectedClient> = new Map();
let heartbeatInterval: NodeJS.Timeout | null = null;

function addClient(clientId: string, username: string, ws: WebSocket): void {
  const client: ConnectedClient = {
    id: clientId,
    username: username.trim(),
    ws,
    isAlive: true,
    connectedAt: new Date(),
  };

  clients.set(clientId, client);

  logger.websocket("CLIENT_CONNECTED", clientId, {
    username: client.username,
    totalClients: clients.size,
  });

  setupClientEventHandlers(client);
}

function removeClient(clientId: string): void {
  const client = clients.get(clientId);
  if (client) {
    clients.delete(clientId);

    logger.websocket("CLIENT_DISCONNECTED", clientId, {
      username: client.username,
      totalClients: clients.size,
      connectedDuration: Date.now() - client.connectedAt.getTime(),
    });
  }
}

function broadcastMessage(
  message: WebSocketMessage,
  excludeClientId?: string
): void {
  const messageStr = JSON.stringify(message);
  let sentCount = 0;
  let failedCount = 0;

  clients.forEach((client, clientId) => {
    if (excludeClientId && clientId === excludeClientId) return;

    try {
      if (client.ws.readyState === WebSocket.OPEN) {
        client.ws.send(messageStr);
        sentCount++;
      } else {
        removeClient(clientId);
        failedCount++;
      }
    } catch (error) {
      logger.error(`Failed to send message to client ${clientId}:`, error);
      removeClient(clientId);
      failedCount++;
    }
  });

  logger.websocket("BROADCAST_MESSAGE", "ALL", {
    messageType: message.type,
    sentCount,
    failedCount,
    excludedClient: excludeClientId,
  });
}

function sendToClient(clientId: string, message: WebSocketMessage): void {
  const client = clients.get(clientId);
  if (!client) {
    logger.warn(
      `Attempted to send message to non-existent client: ${clientId}`
    );
    return;
  }

  try {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
      logger.websocket("SEND_TO_CLIENT", clientId, {
        messageType: message.type,
      });
    } else {
      removeClient(clientId);
    }
  } catch (error) {
    logger.error(`Failed to send message to client ${clientId}:`, error);
    removeClient(clientId);
  }
}

function getConnectedUsers(): string[] {
  return Array.from(clients.values()).map((client) => client.username);
}

function getClientCount(): number {
  return clients.size;
}

function getConnectionStats(): {
  totalConnections: number;
  connectedUsers: string[];
  longestConnection: number;
} {
  const now = Date.now();
  let longestConnection = 0;

  clients.forEach((client) => {
    const connectionDuration = now - client.connectedAt.getTime();
    if (connectionDuration > longestConnection) {
      longestConnection = connectionDuration;
    }
  });

  return {
    totalConnections: clients.size,
    connectedUsers: getConnectedUsers(),
    longestConnection,
  };
}

function setupClientEventHandlers(client: ConnectedClient): void {
  client.ws.on("close", (code: number, reason: string) => {
    logger.websocket("CLIENT_CLOSE", client.id, {
      username: client.username,
      code,
      reason: reason.toString(),
    });
    removeClient(client.id);
  });

  client.ws.on("error", (error: Error) => {
    logger.error(`WebSocket error for client ${client.id}:`, error);
    removeClient(client.id);
  });

  client.ws.on("pong", () => {
    const clientData = clients.get(client.id);
    if (clientData) {
      clientData.isAlive = true;
    }
  });
}

function startHeartbeat(): void {
  heartbeatInterval = setInterval(() => {
    clients.forEach((client, clientId) => {
      if (!client.isAlive) {
        logger.websocket("HEARTBEAT_FAILED", clientId, {
          username: client.username,
        });
        client.ws.terminate();
        removeClient(clientId);
        return;
      }

      client.isAlive = false;
      try {
        if (client.ws.readyState === WebSocket.OPEN) {
          client.ws.ping();
        }
      } catch (error) {
        logger.error(`Failed to ping client ${clientId}:`, error);
        removeClient(clientId);
      }
    });
  }, LIMITS.HEARTBEAT_INTERVAL);
}

function stopHeartbeat(): void {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
  }
}

function disconnectAllClients(): void {
  clients.forEach((client, clientId) => {
    try {
      client.ws.close(WS_CLOSE_CODES.NORMAL, "Server shutdown");
    } catch (error) {
      logger.error(`Error closing connection for client ${clientId}:`, error);
    }
  });

  clients.clear();
  logger.info("All clients disconnected");
}

export const webSocketService: WebSocketServiceInterface = {
  clients,
  addClient,
  removeClient,
  broadcastMessage,
  sendToClient,
  getConnectedUsers,
  getClientCount,
  getConnectionStats,
  disconnectAllClients,
  startHeartbeat,
  stopHeartbeat,
};
