# ChatApp Pro - Real-Time Chat Application

A modern, real-time chat application built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring WebSocket communication, TypeScript, and a beautiful UI powered by Tailwind CSS and shadcn/ui.

![{799ADC9D-2A29-4C08-AE41-CAE35C2057B7}](https://github.com/user-attachments/assets/58aa89f2-bfa4-4c5c-8279-14b8ae621f51)

![{11036DD7-32F2-4EB6-852F-EC1741995F7A}](https://github.com/user-attachments/assets/f2c597f4-723b-426d-8ec5-e5d00e4e5a65)


## ✨ Features

- 🚀 **Real-time messaging** with WebSocket connections
- 👥 **Multi-user support** with live user tracking
- 💾 **Persistent storage** with MongoDB
- 🎨 **Modern UI** with Tailwind CSS and shadcn/ui components
- 📱 **Responsive design** for all devices
- 🔐 **Input validation** and error handling
- ⚡ **TypeScript** for type safety
- 🎭 **User avatars** with unique colors
- 📊 **Real-time statistics** and connection status
- 🔄 **Auto-reconnection** on connection loss

## 🏗️ Architecture Overview

### Frontend Architecture
- **React 18** with TypeScript for type-safe development
- **Custom WebSocket hook** for real-time communication management
- **Component-based architecture** with reusable UI components
- **State management** using React hooks
- **Responsive design** with Tailwind CSS utilities

### Backend Architecture
- **Express.js server** with TypeScript
- **WebSocket server** using the `ws` library (no Socket.IO)
- **MongoDB** with Mongoose ODM for data persistence
- **Modular design** with controllers, services, and models
- **Comprehensive logging** and error handling

### Communication Flow
```
Client (React) ↔ WebSocket Connection ↔ Express Server ↔ MongoDB
```

## 🔄 Concurrency Handling

### Asynchronous Patterns
- **Event-driven WebSocket** connections for non-blocking I/O
- **Async/await** patterns throughout the codebase
- **Connection pooling** for efficient database operations
- **Heartbeat mechanism** to monitor connection health

### WebSocket Service
- **Client connection management** with unique IDs
- **Message broadcasting** to all connected clients
- **Graceful disconnection** handling
- **Automatic cleanup** of stale connections

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd chat-application
   ```

2. **Install dependencies for both frontend and backend**
   ```bash
   # Install backend dependencies
   cd backend
   npm install
   
   # Install frontend dependencies
   cd ../kavuka
   npm install
   ```

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables in `.env`**
   ```env
   PORT=8080
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/chatapp
   MONGODB_DB_NAME=chatapp
   CORS_ORIGIN=http://localhost:3000
   MAX_MESSAGE_LENGTH=500
   MESSAGE_HISTORY_LIMIT=50
   ```

4. **Start MongoDB service**
   ```bash
   # macOS (with Homebrew)
   brew services start mongodb-community
   
   # Ubuntu/Debian
   sudo systemctl start mongod
   
   # Windows
   net start MongoDB
   ```

5. **Run the backend server**
   ```bash
   # Development mode with hot reload
   npm run dev
   
   # Production mode
   npm run build && npm start
   ```

   The backend server will start on `http://localhost:8080`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Start the development server**
   ```bash
   npm run dev
   ```

   The frontend will start on `http://localhost:3000`

### Verification

1. Open your browser and navigate to `http://localhost:3000`
2. Enter a username to join the chat
3. Open multiple browser tabs with different usernames to test real-time messaging
4. Check the backend logs to verify WebSocket connections

## 📁 Project Structure

```
chat-application/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers and business logic
│   │   ├── models/              # MongoDB schemas and models
│   │   ├── services/            # WebSocket and business services
│   │   ├── database/            # Database connection management
│   │   ├── utils/               # Utilities and constants
│   │   ├── types/               # TypeScript type definitions
│   │   └── server.ts            # Main server entry point
│   ├── .env.example
│   ├── package.json
│   └── tsconfig.json
├── kavuka/
│   ├── src/
│   │   ├── components/          # React components
│   │   │   ├── ui/              # Reusable UI components (shadcn/ui)
│   │   │   ├── ChatWindow.tsx   # Main chat display
│   │   │   ├── MessageInput.tsx # Message input component
│   │   │   └── UserLogin.tsx    # Login form
│   │   ├── hooks/               # Custom React hooks
│   │   ├── types/               # TypeScript interfaces
│   │   └── App.tsx              # Main application component
│   ├── package.json
│   └── vite.config.ts
└── README.md
```

## 🛠️ Design Choices & Assumptions

### Technology Decisions

1. **WebSocket over Socket.IO**
   - Used native `ws` library as specified in requirements
   - Provides full control over WebSocket implementation
   - Lighter weight and more performant

2. **TypeScript Implementation**
   - Chosen for type safety and better developer experience
   - Prevents runtime errors and improves code maintainability
   - Enhanced IDE support with autocomplete and refactoring

3. **MongoDB with Mongoose**
   - Document-based storage suitable for chat messages
   - Mongoose provides schema validation and query building
   - Easy to scale and modify data structure

4. **React with Custom Hooks**
   - `useWebSocket` hook encapsulates all WebSocket logic
   - Separation of concerns between UI and communication
   - Reusable and testable WebSocket functionality

### UI/UX Design Philosophy

1. **Modern, Clean Interface**
   - shadcn/ui components for consistency
   - Tailwind CSS for rapid styling
   - Responsive design for all devices

2. **Real-time Feedback**
   - Live connection status indicators
   - Typing indicators and message states
   - User presence and activity tracking

3. **Accessibility**
   - Proper ARIA labels and semantic HTML
   - Keyboard navigation support
   - High contrast and readable typography

### Architecture Assumptions

1. **Single Chat Room**
   - Application supports one global chat room
   - All users can see all messages
   - Suitable for small to medium teams

2. **Client-Side User Management**
   - No authentication system implemented
   - Username-based identification
   - Suitable for internal/trusted environments

3. **Message Persistence**
   - All messages stored in MongoDB
   - Last 50 messages sent to new users
   - No message deletion functionality

## 🔧 API Documentation

### HTTP Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | Server status and info |
| `/health` | GET | Detailed health check with stats |
| `/api/messages` | GET | Retrieve recent messages |
| `/api/stats` | GET | Connection and message statistics |

### WebSocket Events

#### Client → Server

```typescript
// Join chat room
{
  "type": "join",
  "username": "john_doe"
}

// Send message
{
  "type": "message",
  "message": "Hello everyone!"
}
```

#### Server → Client

```typescript
// Chat history
{
  "type": "history",
  "messages": [...]
}

// New message broadcast
{
  "type": "message",
  "username": "alice",
  "message": "Hi there!",
  "timestamp": "2024-01-01T12:00:00.000Z"
}

// Error notification
{
  "type": "error",
  "error": "Message too long"
}
```

## 🧪 Testing

### Manual Testing
```bash
# Test HTTP endpoints
curl http://localhost:8080/health

# Test with multiple browser tabs
# Open http://localhost:3000 in multiple tabs with different usernames
```

### WebSocket Testing
```javascript
// Browser console testing
const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => {
  ws.send(JSON.stringify({type: 'join', username: 'test'}));
  ws.send(JSON.stringify({type: 'message', message: 'Hello!'}));
};
ws.onmessage = (e) => console.log(JSON.parse(e.data));
```

## 🚀 Deployment

### Backend Deployment (Render/Heroku)

1. **Set environment variables**
   ```env
   NODE_ENV=production
   MONGODB_URI=<your-mongodb-atlas-uri>
   CORS_ORIGIN=<your-frontend-url>
   ```

2. **Build and deploy**
   ```bash
   npm run build
   npm start
   ```

### Frontend Deployment (Netlify/Vercel)

1. **Update WebSocket URL in frontend**
   ```typescript
   const WEBSOCKET_URL = 'wss://your-backend-url.com';
   ```

2. **Build and deploy**
   ```bash
   npm run build
   ```

### Production Considerations

- Use MongoDB Atlas for database hosting
- Configure proper CORS origins
- Set up SSL/TLS certificates for WSS
- Implement rate limiting and DDoS protection
- Add monitoring and logging services

## 🔍 Monitoring & Health Checks

### Health Endpoint Response
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "database": {
    "connected": true,
    "connectionInfo": { ... }
  },
  "websocket": {
    "connections": 5,
    "connectedUsers": 3,
    "longestConnection": 120000
  },
  "messages": {
    "totalMessages": 1250,
    "uniqueUsers": 45,
    "recentActivity": "2024-01-01T11:59:30.000Z"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   brew services list | grep mongodb  # macOS
   sudo systemctl status mongod       # Linux
   ```

2. **WebSocket Connection Issues**
   - Verify CORS settings in backend
   - Check firewall and network configuration
   - Ensure WebSocket URL is correct in frontend

3. **Build Errors**
   ```bash
   # Clear dependencies and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

### Debug Mode
```bash
# Enable detailed logging
NODE_ENV=development npm run dev
```

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For support and questions:
- Create an issue in the GitHub repository
- Contact the development team
- Check the troubleshooting section above

---

**Built with ❤️ using the MERN stack and modern web technologies**
