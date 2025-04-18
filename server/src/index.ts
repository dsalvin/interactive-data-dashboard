import express, { Request, Response } from 'express';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

// Import routes
import authRoutes from './routes/auth';
import dataRoutes from './routes/data';

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Health check route
app.get('/api/health', (req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', message: 'Server is running' });
});

// Socket.IO connection handler
io.on('connection', (socket) => {
  console.log('New client connected');
  
  // Join a dashboard room for real-time updates
  socket.on('join-dashboard', (dashboardId: string) => {
    socket.join(`dashboard-${dashboardId}`);
    console.log(`Client joined dashboard: ${dashboardId}`);
  });
  
  // Leave a dashboard room
  socket.on('leave-dashboard', (dashboardId: string) => {
    socket.leave(`dashboard-${dashboardId}`);
    console.log(`Client left dashboard: ${dashboardId}`);
  });
  
  // Handle data update event
  socket.on('data-update', (data: { dashboardId: string, widgetId: string, data: any }) => {
    // Broadcast to all clients in the same dashboard room
    socket.to(`dashboard-${data.dashboardId}`).emit('widget-data', {
      widgetId: data.widgetId,
      data: data.data
    });
  });
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../../client/build')));
  
  app.get('*', (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, '../../client/build/index.html'));
  });
}

// Database connection
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/data-dashboard');
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});

export { app, io };