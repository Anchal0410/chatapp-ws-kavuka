export interface Message {
  username: string;
  message: string;
  timestamp: string;
}

export interface WebSocketMessage {
  type: "join" | "message" | "history";
  username?: string;
  message?: string;
  messages?: Message[];
  timestamp?: string;
}

export interface UseWebSocketReturn {
  connect: (username: string) => void;
  disconnect: () => void;
  sendMessage: (message: string) => boolean;
  isConnected: boolean;
  messages: Message[];
  error: string | null;
}
