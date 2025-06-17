import React, { useState, useEffect } from "react";
import useWebSocket from "./hooks/useWebSocket";
import UserLogin from "./components/UserLogin";
import ChatWindow from "./components/ChatWindow";
import MessageInput from "./components/MessageInput";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { ScrollArea } from "./components/ui/scroll-area";
import { Avatar, AvatarFallback } from "./components/ui/avatar";
import {
  MessageCircle,
  Users,
  LogOut,
  WifiOff,
  Wifi,
  Clock,
  Zap,
} from "lucide-react";

const WEBSOCKET_URL = import.meta.env.PROD
  ? "wss://chatapp-ws-kavuka.onrender.com"
  : import.meta.env.VITE_WEBSOCKET_URL;

const App: React.FC = () => {
  const [currentUsername, setCurrentUsername] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [connectionTime, setConnectionTime] = useState<Date | null>(null);
  const [lastMessageTime, setLastMessageTime] = useState<Date | null>(null);

  const { connect, disconnect, sendMessage, isConnected, messages, error } =
    useWebSocket(WEBSOCKET_URL);

  useEffect(() => {
    if (isConnected && !connectionTime) {
      setConnectionTime(new Date());
    }
  }, [isConnected, connectionTime]);

  useEffect(() => {
    if (messages.length > 0) {
      setLastMessageTime(new Date());
    }
  }, [messages]);

  const handleLogin = async (username: string): Promise<void> => {
    try {
      await connect(username);
      setCurrentUsername(username);
      setIsLoggedIn(true);
    } catch (err) {
      console.error("Login failed:", err);
    }
  };

  const handleLogout = (): void => {
    disconnect();
    setCurrentUsername("");
    setIsLoggedIn(false);
    setConnectionTime(null);
    setLastMessageTime(null);
  };

  const handleSendMessage = (message: string): boolean => {
    return sendMessage(message);
  };

  const getInitials = (username: string): string => {
    return username.slice(0, 2).toUpperCase();
  };

  const getUniqueUsers = (): string[] => {
    const users = new Set(messages.map((msg) => msg.username));
    return Array.from(users);
  };

  const getConnectionDuration = (): string => {
    if (!connectionTime) return "0s";
    const now = new Date();
    const diff = Math.floor((now.getTime() - connectionTime.getTime()) / 1000);
    if (diff < 60) return `${diff}s`;
    if (diff < 3600) return `${Math.floor(diff / 60)}m`;
    return `${Math.floor(diff / 3600)}h ${Math.floor((diff % 3600) / 60)}m`;
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
      "bg-orange-500",
      "bg-cyan-500",
    ];
    let hash = 0;
    for (let i = 0; i < username.length; i++) {
      hash = username.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getLastActivity = (): string => {
    if (!lastMessageTime) return "No activity";
    const now = new Date();
    const diff = Math.floor((now.getTime() - lastMessageTime.getTime()) / 1000);
    if (diff < 60) return "Just now";
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    return `${Math.floor(diff / 3600)}h ago`;
  };

  if (!isLoggedIn) {
    return <UserLogin onLogin={handleLogin} error={error} />;
  }

  return (
    <div className="h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black,transparent)] -z-10"></div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob"></div>
      <div className="absolute top-40 right-20 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-40 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-xl opacity-10 animate-blob animation-delay-4000"></div>

      <div className="mx-auto max-w-7xl h-full flex gap-6">
        {/* Main Chat Container */}
        <Card className="flex-1 flex flex-col shadow-2xl border-0 bg-white/95 backdrop-blur-xl overflow-hidden">
          {/* Enhanced Header */}
          <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <MessageCircle className="h-8 w-8" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">ChatApp Pro</h1>
                  <div className="flex items-center gap-3 text-sm opacity-90 mt-1">
                    {isConnected ? (
                      <>
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <Wifi className="h-4 w-4" />
                          <span>Connected</span>
                        </div>
                        <span className="text-xs opacity-75">
                          • {getConnectionDuration()}
                        </span>
                      </>
                    ) : (
                      <>
                        <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse"></div>
                        <WifiOff className="h-4 w-4" />
                        <span>Disconnected</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6">
                {/* Stats */}
                <div className="hidden md:flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                    <Users className="h-4 w-4" />
                    <span>{getUniqueUsers().length} online</span>
                  </div>
                  <div className="flex items-center gap-2 bg-white/15 rounded-full px-4 py-2 backdrop-blur-sm">
                    {/* <Activity className="h-4 w-4" /> */}
                    <span>{messages.length} messages</span>
                  </div>
                </div>

                {/* Current User */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-10 w-10 border-2 border-white/50 shadow-lg">
                    <AvatarFallback
                      className={`text-white font-bold ${getAvatarColor(
                        currentUsername
                      )}`}
                    >
                      {getInitials(currentUsername)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="hidden sm:block">
                    <div className="font-semibold">{currentUsername}</div>
                    <div className="text-xs opacity-75">Online</div>
                  </div>
                </div>

                {/* Logout Button */}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="text-white border-white/30 hover:bg-white/15 hover:text-white transition-all duration-200"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  <span className="hidden sm:inline">Logout</span>
                </Button>
              </div>
            </div>
          </div>

          {/* Connection Status Banner */}
          {!isConnected && (
            <div className="bg-gradient-to-r from-red-500 to-red-600 text-white p-3 flex items-center justify-center gap-2 text-sm animate-pulse">
              <WifiOff className="h-4 w-4" />
              <span>Connection lost - Attempting to reconnect...</span>
              <div className="ml-2 flex space-x-1">
                <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.1s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-white rounded-full animate-bounce"
                  style={{ animationDelay: "0.2s" }}
                ></div>
              </div>
            </div>
          )}

          {/* Chat Messages */}
          <div className="flex-1 flex flex-col min-h-0">
            <ChatWindow messages={messages} currentUsername={currentUsername} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-100 bg-gradient-to-r from-gray-50/80 to-white/80 backdrop-blur-sm">
            <MessageInput
              onSendMessage={handleSendMessage}
              disabled={!isConnected}
            />
          </div>
        </Card>

        {/* Sidebar - Online Users & Stats */}
        <Card className="w-80 hidden lg:flex flex-col shadow-xl border-0 bg-white/95 backdrop-blur-xl">
          {/* Sidebar Header */}
          <div className="p-6 border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
            <h3 className="font-bold text-lg text-gray-900 flex items-center gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
              Online Users
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {getUniqueUsers().length} members active
            </p>
          </div>

          {/* Online Users List */}
          <div className="flex-1 overflow-hidden">
            <ScrollArea className="h-full custom-scrollbar">
              <div className="p-4 space-y-3">
                {getUniqueUsers().map((user, index) => (
                  <div
                    key={user}
                    className={`flex items-center gap-3 p-4 rounded-xl transition-all duration-200 hover:scale-[1.02] animate-fadeInUp ${
                      user === currentUsername
                        ? "bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 shadow-md"
                        : "bg-gray-50 hover:bg-gray-100 border border-gray-200"
                    }`}
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <Avatar className="h-10 w-10 shadow-md">
                      <AvatarFallback
                        className={`text-sm font-bold text-white ${getAvatarColor(
                          user
                        )}`}
                      >
                        {getInitials(user)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-semibold text-sm text-gray-900 truncate">
                        {user}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        {user === currentUsername ? "You" : "Online"}
                      </div>
                    </div>
                    {user === currentUsername && (
                      <div className="px-2 py-1 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                        You
                      </div>
                    )}
                  </div>
                ))}

                {getUniqueUsers().length === 0 && (
                  <div className="text-center text-gray-500 py-12">
                    <div className="mx-auto w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                      <Users className="h-8 w-8 text-gray-400" />
                    </div>
                    <p className="text-sm font-medium">No users online</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Be the first to join!
                    </p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Sidebar Stats */}
          <div className="p-4 border-t border-gray-100 bg-gradient-to-r from-gray-50 to-white space-y-3">
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <div className="font-bold text-lg text-blue-600">
                  {messages.length}
                </div>
                <div className="text-gray-500">Messages</div>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-200 text-center">
                <div className="font-bold text-lg text-green-600">
                  {getUniqueUsers().length}
                </div>
                <div className="text-gray-500">Users</div>
              </div>
            </div>

            <div className="space-y-2 text-xs text-gray-500">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="h-3 w-3" />
                  <span>Connected</span>
                </div>
                <span className="font-medium">{getConnectionDuration()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-3 w-3" />
                  <span>Last activity</span>
                </div>
                <span className="font-medium">{getLastActivity()}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      isConnected ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></div>
                  <span>Server</span>
                </div>
                <span className="font-medium">
                  {isConnected ? "Online" : "Offline"}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default App;
