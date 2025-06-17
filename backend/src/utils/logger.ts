export enum LogLevel {
  ERROR = "ERROR",
  WARN = "WARN",
  INFO = "INFO",
  DEBUG = "DEBUG",
}

function createLogger() {
  const isDevelopment = process.env.NODE_ENV === "development";

  function formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const baseMessage = `[${timestamp}] [${level}] ${message}`;

    return data
      ? `${baseMessage} ${JSON.stringify(data, null, 2)}`
      : baseMessage;
  }

  function error(message: string, error?: any): void {
    const logMessage = formatMessage(LogLevel.ERROR, message, error);
    console.error(logMessage);
  }

  function warn(message: string, data?: any): void {
    const logMessage = formatMessage(LogLevel.WARN, message, data);
    console.warn(logMessage);
  }

  function info(message: string, data?: any): void {
    const logMessage = formatMessage(LogLevel.INFO, message, data);
    console.log(logMessage);
  }

  function debug(message: string, data?: any): void {
    if (isDevelopment) {
      const logMessage = formatMessage(LogLevel.DEBUG, message, data);
      console.log(logMessage);
    }
  }

  function websocket(action: string, clientId: string, data?: any): void {
    debug(`WebSocket ${action}`, { clientId, ...data });
  }

  function database(operation: string, collection: string, data?: any): void {
    debug(`Database ${operation}`, { collection, ...data });
  }

  return {
    error,
    warn,
    info,
    debug,
    websocket,
    database,
  };
}

export const logger = createLogger();
