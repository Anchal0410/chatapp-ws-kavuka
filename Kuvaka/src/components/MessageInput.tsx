import React, {
  useState,
  FormEvent,
  KeyboardEvent,
  useRef,
  useEffect,
} from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Loader2, Smile } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (message: string) => boolean;
  disabled: boolean;
}

const MessageInput: React.FC<MessageInputProps> = ({
  onSendMessage,
  disabled,
}) => {
  const [message, setMessage] = useState<string>("");
  const [isSending, setIsSending] = useState<boolean>(false);
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Auto-focus input when component mounts or becomes enabled
  useEffect(() => {
    if (!disabled && inputRef.current) {
      inputRef.current.focus();
    }
  }, [disabled]);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    if (!message.trim() || disabled || isSending) {
      return;
    }

    setIsSending(true);
    setIsTyping(false);

    try {
      const success = onSendMessage(message.trim());
      if (success) {
        setMessage("");
        // Focus back to input after sending
        setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>): void => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    const value = e.target.value;
    setMessage(value);

    if (value.trim() && !isTyping) {
      setIsTyping(true);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
    }, 1000);
  };

  const handleEmojiClick = (): void => {
    // Simple emoji insertion (you could expand this with an emoji picker)
    const emojis = ["😊", "😂", "❤️", "👍", "🎉", "🔥", "💯", "👋"];
    const randomEmoji = emojis[Math.floor(Math.random() * emojis.length)];
    setMessage((prev) => prev + randomEmoji);
    inputRef.current?.focus();
  };

  const getPlaceholderText = (): string => {
    if (disabled) {
      return "Disconnected - Cannot send messages";
    }
    if (isSending) {
      return "Sending message...";
    }
    return "Type your message... (Press Enter to send)";
  };

  return (
    <div className="p-6">
      <form onSubmit={handleSubmit} className="flex items-end gap-3">
        {/* Message Input Container */}
        <div className="flex-1 relative">
          {/* Input Field */}
          <div className="relative">
            <Input
              ref={inputRef}
              type="text"
              placeholder={getPlaceholderText()}
              value={message}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              disabled={disabled || isSending}
              maxLength={500}
              className={`
                h-12 pr-20 pl-12 text-base rounded-2xl border-2 transition-all duration-200
                ${
                  disabled
                    ? "bg-gray-50 border-gray-200 text-gray-400"
                    : "bg-white border-gray-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-100"
                }
                ${message.trim() ? "border-blue-300" : ""}
              `}
            />

            {/* Emoji Button */}
            <button
              type="button"
              onClick={handleEmojiClick}
              disabled={disabled}
              className={`
                absolute left-3 top-1/2 transform -translate-y-1/2 p-1 rounded-full transition-all duration-200
                ${
                  disabled
                    ? "text-gray-300 cursor-not-allowed"
                    : "text-gray-400 hover:text-blue-500 hover:bg-blue-50"
                }
              `}
            >
              <Smile className="h-5 w-5" />
            </button>
          </div>

          {/* Character Counter */}
          {message.length > 400 && (
            <div
              className={`
              absolute -bottom-6 right-2 text-xs
              ${message.length > 480 ? "text-red-500" : "text-gray-400"}
            `}
            >
              {message.length}/500
            </div>
          )}
        </div>

        {/* Send Button */}
        <Button
          type="submit"
          size="icon"
          disabled={!message.trim() || disabled || isSending}
          className={`
            h-12 w-12 rounded-2xl transition-all duration-200 shadow-lg
            ${
              message.trim() && !disabled && !isSending
                ? "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 scale-100 hover:scale-105 shadow-blue-200"
                : "bg-gray-300 cursor-not-allowed scale-95"
            }
          `}
        >
          {isSending ? (
            <Loader2 className="h-5 w-5 animate-spin text-white" />
          ) : (
            <Send
              className={`h-5 w-5 transition-all duration-200 ${
                message.trim() && !disabled
                  ? "text-white translate-x-0.5"
                  : "text-gray-500"
              }`}
            />
          )}
        </Button>
      </form>

      {/* Status Messages */}
      {disabled && (
        <div className="mt-3 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-600 text-xs rounded-full border border-red-200">
            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            <span>Connection lost - Messages cannot be sent</span>
          </div>
        </div>
      )}

      {/* Quick Actions (optional) */}
      {!disabled && (
        <div className="mt-3 flex items-center justify-center gap-2">
          <div className="text-xs text-gray-400">Quick actions:</div>
          {["👋", "👍", "❤️", "😊"].map((emoji, index) => (
            <button
              key={index}
              type="button"
              onClick={() => {
                setMessage((prev) => prev + emoji);
                inputRef.current?.focus();
              }}
              className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 transition-all duration-200 text-sm hover:scale-110"
            >
              {emoji}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default MessageInput;
