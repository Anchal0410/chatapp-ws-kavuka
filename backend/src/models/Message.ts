import mongoose, { Schema, Document } from "mongoose";
import { IMessage } from "../types";

export interface IMessageDocument extends IMessage, Document {
  _id: string;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessageDocument>(
  {
    username: {
      type: String,
      required: [true, "Username is required"],
      trim: true,
      maxlength: [20, "Username cannot exceed 20 characters"],
      minlength: [1, "Username cannot be empty"],
    },
    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      maxlength: [500, "Message cannot exceed 500 characters"],
      minlength: [1, "Message cannot be empty"],
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform: function (doc, ret) {
        ret.timestamp = ret.timestamp || ret.createdAt;
        return ret;
      },
    },
  }
);

MessageSchema.index({ timestamp: -1 });
MessageSchema.index({ username: 1, timestamp: -1 });

MessageSchema.pre("save", function (next) {
  if (!this.timestamp) {
    this.timestamp = new Date();
  }
  next();
});

MessageSchema.statics.getRecentMessages = async function (
  limit: number = 50
): Promise<IMessageDocument[]> {
  return this.find({})
    .sort({ timestamp: -1 })
    .limit(limit)
    .exec()
    .then((messages: IMessageDocument[]) => messages.reverse());
};

MessageSchema.statics.createMessage = async function (
  username: string,
  message: string
): Promise<IMessageDocument> {
  const newMessage = new this({
    username: username.trim(),
    message: message.trim(),
    timestamp: new Date(),
  });

  return await newMessage.save();
};

export interface IMessageModel extends mongoose.Model<IMessageDocument> {
  getRecentMessages(limit?: number): Promise<IMessageDocument[]>;
  createMessage(username: string, message: string): Promise<IMessageDocument>;
}

export const Message = mongoose.model<IMessageDocument, IMessageModel>(
  "Message",
  MessageSchema
);
