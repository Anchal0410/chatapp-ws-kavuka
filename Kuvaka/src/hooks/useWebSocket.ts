import { useState, useEffect, useCallback } from "react";
import { Message, WebSocketMessage, UseWebSocketReturn } from "../types";

const useWebSocket = (url: string): UseWebSocketReturn => {
  const [socket, setSocket] = useState<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [error, setError] = useState<string | null>(null);

  const connect = useCallback(
    (username: string): void => {
      if (!url || !username) return;

      try {
        const ws = new WebSocket(url);

        ws.onopen = (): void => {
          setIsConnected(true);
          setError(null);

          ws.send(
            JSON.stringify({
              type: "join",
              username: username,
            } as WebSocketMessage)
          );
        };

        ws.onmessage = (event: MessageEvent): void => {
          try {
            const data: WebSocketMessage = JSON.parse(event.data);

            if (data.type === "history") {
              setMessages(data.messages || []);
            } else if (data.type === "message") {
              setMessages((prev) => [
                ...prev,
                {
                  username: data.username!,
                  message: data.message!,
                  timestamp: data.timestamp || new Date().toISOString(),
                },
              ]);
            }
          } catch (err) {
            console.error("Error parsing message:", err);
          }
        };

        ws.onclose = (): void => {
          setIsConnected(false);
          setSocket(null);
        };

        ws.onerror = (): void => {
          setError("Connection error occurred");
        };

        setSocket(ws);
      } catch (err) {
        setError("Failed to connect to server");
      }
    },
    [url]
  );

  const sendMessage = useCallback(
    (message: string): boolean => {
      if (socket && socket.readyState === WebSocket.OPEN && message.trim()) {
        socket.send(
          JSON.stringify({
            type: "message",
            message: message.trim(),
          } as WebSocketMessage)
        );
        return true;
      }
      return false;
    },
    [socket]
  );

  const disconnect = useCallback((): void => {
    if (socket) {
      socket.close();
    }
    setSocket(null);
    setIsConnected(false);
    setMessages([]);
    setError(null);
  }, [socket]);

  useEffect(() => {
    return (): void => {
      if (socket) {
        socket.close();
      }
    };
  }, [socket]);

  return {
    connect,
    disconnect,
    sendMessage,
    isConnected,
    messages,
    error,
  };
};

export default useWebSocket;
