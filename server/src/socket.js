const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');

let io;

// Map to store userId -> socketId
const userSockets = new Map();

const initializeSocket = (server, allowedOrigins) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  io.use((socket, next) => {
    // Authenticate the socket
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }
    
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.id; // Store userId in socket
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    console.log(`[Socket.IO] User connected: ${socket.userId} (socket: ${socket.id})`);
    
    // Join a room specifically for this user to allow broadcasting to all their devices
    socket.join(`user_${socket.userId}`);
    
    // Track user socket
    userSockets.set(socket.userId, socket.id);

    socket.on('disconnect', () => {
      console.log(`[Socket.IO] User disconnected: ${socket.userId}`);
      userSockets.delete(socket.userId);
    });
  });

  return io;
};

const sendNotificationToUser = (userId, notification) => {
  if (io) {
    // Emit only to the specific user's room
    io.to(`user_${userId}`).emit('notification', notification);
    console.log(`[Socket.IO] Sent notification to user: ${userId}`);
  }
};

const getIo = () => {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
};

module.exports = {
  initializeSocket,
  sendNotificationToUser,
  getIo
};
