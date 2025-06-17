import React, { useEffect, useRef } from "react";
import { ScrollArea } from "./ui/scroll-area";
import { Avatar, AvatarFallback } from "./ui/avatar";
import { Message } from "../types";
import { cn } from "../lib/utils";
import { MessageCircle, Clock } from "lucide-react";

interface ChatWindowProps {
  messages: Message[];
  currentUsername: string;
}

const ChatWindow: React.FC<ChatWindowProps> = ({
  messages,
  currentUsername,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = (): void => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const formatTimestamp = (timestamp: string): string => {
    const date = new Date(timestamp);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else {
      return (
        date.toLocaleDateString([], { month: "short", day: "numeric" }) +
        " " +
        date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      );
    }
  };

  const getInitials = (username: string): string => {
    return username.slice(0, 2).toUpperCase();
  };

  const getAvatarColor = (username: string): string => {
    const colors = [
      "bg-red-500",
      "bg-blue-500",
      "bg-green-500",
      "bg-yellow-500",
      "bg-purple-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  return (
    <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50/50 to-white">
      <ScrollArea className="h-full custom-scrollbar" ref={scrollAreaRef}>
        <div className="p-6 space-y-6 max-w-4xl mx-auto min-h-full">
          {messages.length === 0 ? (
            <div className="flex items-center justify-center h-64 text-gray-500">
              <div className="text-center space-y-4">
                <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center">
                  <MessageCircle className="h-10 w-10 text-blue-500" />
                </div>
                <div>
                  <div className="text-xl font-semibold text-gray-700">
                    Welcome to the chat!
                  </div>
                  <div className="text-sm text-gray-500 mt-1">
                    Start the conversation by sending your first message
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <>
              {messages.map((msg, index) => {
                const isOwnMessage = msg.username === currentUsername;
                const prevMessage = index > 0 ? messages[index - 1] : null;
                const showAvatar =
                  !prevMessage || prevMessage.username !== msg.username;

                return (
                  <div
                    key={index}
                    className={cn(
                      "flex gap-3 group animate-fadeInUp",
                      isOwnMessage ? "flex-row-reverse" : "flex-row"
                    )}
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    {/* Avatar */}
                    <div
                      className={cn(
                        "flex flex-col items-center",
                        isOwnMessage ? "items-end" : "items-start"
                      )}
                    >
                      {showAvatar ? (
                        <Avatar
                          className={cn(
                            "h-10 w-10 border-2 border-white shadow-md",
                            getAvatarColor(msg.username)
                          )}
                        >
                          <AvatarFallback className="text-white font-bold text-sm">
                            {getInitials(msg.username)}
                          </AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="h-10 w-10" />
                      )}
                    </div>

                    {/* Message Content */}
                    <div
                      className={cn(
                        "flex flex-col max-w-[70%]",
                        isOwnMessage ? "items-end" : "items-start"
                      )}
                    >
                      {/* Username and timestamp */}
                      {showAvatar && (
                        <div
                          className={cn(
                            "flex items-center gap-2 mb-1 text-xs text-gray-500",
                            isOwnMessage ? "flex-row-reverse" : "flex-row"
                          )}
                        >
                          <span className="font-semibold text-gray-700">
                            {isOwnMessage ? "You" : msg.username}
                          </span>
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatTimestamp(msg.timestamp)}</span>
                          </div>
                        </div>
                      )}

                      {/* Message bubble */}
                      <div
                        className={cn(
                          "relative px-4 py-3 rounded-2xl shadow-sm transition-all duration-200 group-hover:shadow-md",
                          isOwnMessage
                            ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-br-md message-enter own"
                            : "bg-white border border-gray-200 text-gray-800 rounded-bl-md message-enter"
                        )}
                      >
                        <div className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                          {msg.message}
                        </div>
                      </div>

                      {/* Show timestamp on hover for non-first messages */}
                      {!showAvatar && (
                        <div
                          className={cn(
                            "opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-gray-400 mt-1",
                            isOwnMessage ? "text-right" : "text-left"
                          )}
                        >
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </>
          )}
        </div>
      </ScrollArea>
    </div>
  );
};
export default ChatWindow;
