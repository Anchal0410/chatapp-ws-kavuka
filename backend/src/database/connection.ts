// import mongoose from "mongoose";
// import { logger } from "../utils/logger";
// import { DatabaseConnection } from "../types/index";

// class DatabaseService {
//   private connectionInfo: DatabaseConnection;

//   constructor() {
//     this.connectionInfo = {
//       isConnected: false,
//       connectionString:
//         process.env.MONGODB_URI ||
//         "mongodb+srv://Anchal19_:jainanchal165@cluster0.qfgmiqh.mongodb.net/",
//       dbName: process.env.MONGODB_DB_NAME || "chatapp",
//     };
//   }

//   async connect(): Promise<void> {
//     try {
//       if (this.connectionInfo.isConnected) {
//         logger.info("Database already connected");
//         return;
//       }

//       logger.info("Connecting to MongoDB...", {
//         uri: this.connectionInfo.connectionString,
//         dbName: this.connectionInfo.dbName,
//       });

//       await mongoose.connect(this.connectionInfo.connectionString, {
//         dbName: this.connectionInfo.dbName,
//         maxPoolSize: 10,
//         serverSelectionTimeoutMS: 5000,
//         socketTimeoutMS: 45000,
//         bufferCommands: false,
//         // bufferMaxEntries: 0,
//       });

//       this.connectionInfo.isConnected = true;
//       logger.info("Successfully connected to MongoDB");

//       mongoose.connection.on("error", (error) => {
//         logger.error("MongoDB connection error:", error);
//         this.connectionInfo.isConnected = false;
//       });

//       mongoose.connection.on("disconnected", () => {
//         logger.warn("MongoDB disconnected");
//         this.connectionInfo.isConnected = false;
//       });

//       mongoose.connection.on("reconnected", () => {
//         logger.info("MongoDB reconnected");
//         this.connectionInfo.isConnected = true;
//       });
//     } catch (error) {
//       logger.error("Failed to connect to MongoDB:", error);
//       this.connectionInfo.isConnected = false;
//       throw error;
//     }
//   }

//   async disconnect(): Promise<void> {
//     try {
//       if (!this.connectionInfo.isConnected) {
//         logger.info("Database already disconnected");
//         return;
//       }

//       await mongoose.disconnect();
//       this.connectionInfo.isConnected = false;
//       logger.info("Disconnected from MongoDB");
//     } catch (error) {
//       logger.error("Error disconnecting from MongoDB:", error);
//       throw error;
//     }
//   }

//   isConnected(): boolean {
//     return (
//       this.connectionInfo.isConnected && mongoose.connection.readyState === 1
//     );
//   }

//   getConnectionInfo(): DatabaseConnection {
//     return { ...this.connectionInfo };
//   }

//   async healthCheck(): Promise<boolean> {
//     try {
//       if (!this.isConnected()) {
//         return false;
//       }
//       if (!mongoose.connection.db) throw new Error("db not connected");
//       await mongoose.connection.db.admin().ping();
//       return true;
//     } catch (error) {
//       logger.error("Database health check failed:", error);
//       return false;
//     }
//   }
// }

// export const databaseService = new DatabaseService();

import mongoose from "mongoose";
import { logger } from "../utils/logger";
import { DatabaseConnection } from "../types/index";

const connectionInfo: DatabaseConnection = {
  isConnected: false,
  connectionString:
    process.env.MONGODB_URI ||
    "mongodb+srv://Anchal19_:jainanchal165@cluster0.qfgmiqh.mongodb.net/",
  dbName: process.env.MONGODB_DB_NAME || "chatapp",
};

async function connect(): Promise<void> {
  if (connectionInfo.isConnected) {
    logger.info("Database already connected");
    return;
  }

  try {
    logger.info("Connecting to MongoDB...", {
      uri: connectionInfo.connectionString,
      dbName: connectionInfo.dbName,
    });

    await mongoose.connect(connectionInfo.connectionString, {
      dbName: connectionInfo.dbName,
      maxPoolSize: 10,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
      bufferCommands: false,
    });

    connectionInfo.isConnected = true;
    logger.info("Successfully connected to MongoDB");

    mongoose.connection.on("error", (error) => {
      logger.error("MongoDB connection error:", error);
      connectionInfo.isConnected = false;
    });

    mongoose.connection.on("disconnected", () => {
      logger.warn("MongoDB disconnected");
      connectionInfo.isConnected = false;
    });

    mongoose.connection.on("reconnected", () => {
      logger.info("MongoDB reconnected");
      connectionInfo.isConnected = true;
    });
  } catch (error) {
    logger.error("Failed to connect to MongoDB:", error);
    connectionInfo.isConnected = false;
    throw error;
  }
}

async function disconnect(): Promise<void> {
  if (!connectionInfo.isConnected) {
    logger.info("Database already disconnected");
    return;
  }

  try {
    await mongoose.disconnect();
    connectionInfo.isConnected = false;
    logger.info("Disconnected from MongoDB");
  } catch (error) {
    logger.error("Error disconnecting from MongoDB:", error);
    throw error;
  }
}

function isConnected(): boolean {
  return connectionInfo.isConnected && mongoose.connection.readyState === 1;
}

function getConnectionInfo(): DatabaseConnection {
  return { ...connectionInfo };
}

async function healthCheck(): Promise<boolean> {
  try {
    if (!isConnected()) return false;
    if (!mongoose.connection.db) throw new Error("DB not connected");
    await mongoose.connection.db.admin().ping();
    return true;
  } catch (error) {
    logger.error("Database health check failed:", error);
    return false;
  }
}

export const databaseService = {
  connect,
  disconnect,
  isConnected,
  getConnectionInfo,
  healthCheck,
};
