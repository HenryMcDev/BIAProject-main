import { io } from 'socket.io-client';

let socket;

export const connectSocket = (userId) => {
  if (socket) {
    return socket;
  }

  // Assuming the event server runs on port 3001 locally or an environment variable for production
  const serverUrl = import.meta.env.VITE_EVENT_SERVER_URL || 'http://localhost:3001';

  socket = io(serverUrl, {
    auth: {
      userId: userId
    }
  });

  socket.on('connect_error', (err) => {
    console.error('Socket connection error:', err.message);
  });

  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

export const onEvent = (eventName, callback) => {
  if (socket) {
    socket.on(eventName, callback);
  }
};

export const offEvent = (eventName, callback) => {
  if (socket) {
    if (callback) {
      socket.off(eventName, callback);
    } else {
      socket.off(eventName);
    }
  }
};

export const getSocket = () => socket;
