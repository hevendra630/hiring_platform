import { Server as HttpServer } from 'http';
import { Server } from 'socket.io';
import { logger } from '@utils/logger';

let io: Server;

export function initSocket(server: HttpServer) {
  io = new Server(server, {
    cors: {
      origin: '*', // For MVP
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    logger.info(`Socket connected: ${socket.id}`);

    // Join a room specifically for this interview
    socket.on('join_interview', (interviewId: string) => {
      socket.join(`interview_${interviewId}`);
      logger.info(`Socket ${socket.id} joined interview_${interviewId}`);
    });

    // Broadcast code changes to the room
    socket.on('code_change', (data: { interviewId: string, code: string }) => {
      // Send to everyone in the room EXCEPT the sender
      socket.to(`interview_${data.interviewId}`).emit('code_update', data.code);
    });

    socket.on('disconnect', () => {
      logger.info(`Socket disconnected: ${socket.id}`);
    });
  });

  return io;
}

export function getIO(): Server {
  if (!io) {
    throw new Error('Socket.io not initialized!');
  }
  return io;
}
