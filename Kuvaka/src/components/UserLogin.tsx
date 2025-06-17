import React, { useState, FormEvent } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { MessageCircle, Loader2, Users, Zap } from "lucide-react";

interface UserLoginProps {
  onLogin: (username: string) => Promise<void>;
  error: string | null;
}

const UserLogin: React.FC<UserLoginProps> = ({ onLogin, error }) => {
  const [username, setUsername] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!username.trim()) {
      return;
    }

    setIsLoading(true);
    try {
      await onLogin(username.trim());
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,white,rgba(255,255,255,0.6))] -z-10"></div>

      <Card className="w-full max-w-md shadow-2xl border-0 bg-white/80 backdrop-blur-sm">
        <CardHeader className="text-center pb-2">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg">
            <MessageCircle className="h-8 w-8 text-white" />
          </div>
          <CardTitle className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Welcome to ChatApp
          </CardTitle>
          <CardDescription className="text-base text-gray-600 mt-2">
            Connect instantly with people around the world in real-time
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Features */}
          <div className="grid grid-cols-2 gap-40 py-4">
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Zap className="h-4 w-4 text-yellow-500" />
              <span>Real-time</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <Users className="h-4 w-4 text-blue-500" />
              <span>Multi-user</span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="text"
                placeholder="Enter your username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                maxLength={20}
                disabled={isLoading}
                required
                className="h-12 text-center text-lg font-medium border-2 focus:border-blue-500 transition-all duration-200"
              />
              <p className="text-xs text-gray-500 text-center">
                Choose a unique username (1-20 characters).
              </p>
              <p>You can access the chat again with the same username</p>
            </div>

            {error && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-sm text-red-600 text-center animate-shake">
                <div className="font-medium">Connection Failed</div>
                <div className="text-xs mt-1">{error}</div>
              </div>
            )}

            <Button
              type="submit"
              className="w-full h-12 text-lg font-semibold bg-gradient-to-r from-blue-400 to-blue-800 hover:from-blue-600 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-[1.02]"
              disabled={!username.trim() || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Connecting to chat...
                </>
              ) : (
                <>
                  <MessageCircle className=" mr-2 h-5 w-5" />
                  Join Chat Room
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500">
              Built with React, TypeScript & WebSocket
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserLogin;
