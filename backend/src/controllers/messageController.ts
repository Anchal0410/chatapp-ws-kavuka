import { Message, IMessageDocument } from "../models/Message";
import { IMessage, MessageControllerInterface } from "../types";
import { logger } from "../utils/logger";
import { LIMITS, ERROR_MESSAGES } from "../utils/constants";

function validateMessage(message: string): boolean {
  if (!message || typeof message !== "string") return false;

  const trimmedMessage = message.trim();
  if (trimmedMessage.length === 0) return false;
  if (trimmedMessage.length > LIMITS.MAX_MESSAGE_LENGTH) return false;

  return true;
}

function validateUsername(username: string): boolean {
  if (!username || typeof username !== "string") return false;

  const trimmedUsername = username.trim();
  if (trimmedUsername.length === 0) return false;
  if (trimmedUsername.length > LIMITS.MAX_USERNAME_LENGTH) return false;

  const usernameRegex = /^[a-zA-Z0-9_-]+$/;
  return usernameRegex.test(trimmedUsername);
}

function formatMessage(message: IMessageDocument): IMessage {
  return {
    _id: message._id.toString(),
    username: message.username,
    message: message.message,
    timestamp: message.timestamp,
    createdAt: message.createdAt,
    updatedAt: message.updatedAt,
  };
}

async function saveMessage(
  username: string,
  message: string
): Promise<IMessage> {
  try {
    logger.database("CREATE", "messages", {
      username,
      messageLength: message.length,
    });

    if (!validateUsername(username)) {
      throw new Error(ERROR_MESSAGES.INVALID_USERNAME);
    }

    if (!validateMessage(message)) {
      throw new Error(ERROR_MESSAGES.INVALID_MESSAGE_TYPE);
    }

    const savedMessage = await Message.createMessage(username, message);

    logger.info("Message saved successfully", {
      messageId: savedMessage._id,
      username: savedMessage.username,
      timestamp: savedMessage.timestamp,
    });

    return formatMessage(savedMessage);
  } catch (error) {
    logger.error("Failed to save message:", error);
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
  }
}

async function getRecentMessages(
  limit: number = LIMITS.MESSAGE_HISTORY_LIMIT
): Promise<IMessage[]> {
  try {
    logger.database("READ", "messages", { limit });

    const messages = await Message.getRecentMessages(limit);

    logger.info("Retrieved recent messages", {
      count: messages.length,
      limit,
    });

    return messages.map((msg) => formatMessage(msg));
  } catch (error) {
    logger.error("Failed to retrieve messages:", error);
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
  }
}

async function getMessageStats(): Promise<{
  totalMessages: number;
  uniqueUsers: number;
  recentActivity: Date | null;
}> {
  try {
    const totalMessages = await Message.countDocuments();

    const uniqueUsers = await Message.distinct("username").then(
      (users) => users.length
    );

    const recentMessage = await Message.findOne(
      {},
      {},
      { sort: { timestamp: -1 } }
    );
    const recentActivity = recentMessage ? recentMessage.timestamp : null;

    return {
      totalMessages,
      uniqueUsers,
      recentActivity,
    };
  } catch (error) {
    logger.error("Failed to get message stats:", error);
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
  }
}

async function deleteOldMessages(olderThanDays: number = 30): Promise<number> {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

    const result = await Message.deleteMany({
      timestamp: { $lt: cutoffDate },
    });

    logger.info("Deleted old messages", {
      deletedCount: result.deletedCount,
      cutoffDate,
    });

    return result.deletedCount || 0;
  } catch (error) {
    logger.error("Failed to delete old messages:", error);
    throw new Error(ERROR_MESSAGES.DATABASE_ERROR);
  }
}

export const messageController: MessageControllerInterface = {
  saveMessage,
  getRecentMessages,
  getMessageStats,
  deleteOldMessages,
  validateMessage,
  validateUsername,
};
