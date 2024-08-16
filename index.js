import express from 'express';
import cors from 'cors';
import connectDB from './config/db.js';
import propertyRoutes from './routes/addProperty.js';
import studentRoutes from './routes/students.js';
import paymentRoutes from './routes/paymentRoutes.js';
import expenseRoutes from './routes/expense.js';
import dotenv from 'dotenv';
import http from 'http';
import { Server as SocketIOServer } from 'socket.io';
import signupRoute from './routes/signup.js';


dotenv.config();


const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: 'https://heavens-client.onrender.com',
    methods: ['GET', 'POST'],
  },
});


connectDB();

// Middleware
app.use(express.json()); // For parsing application/json
app.use(cors()); // Enable CORS for all routes

// Define routes
app.use('/api/properties', propertyRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api', expenseRoutes);
app.use('/api/user', signupRoute);


// Set up Socket.IO events
io.on('connection', (socket) => {
    console.log('New client connected:', socket.id);
  
    socket.on('disconnect', () => {
      console.log('Client disconnected:', socket.id);
    });
  
    // Example: Listen for 'update' events from clients
    socket.on('update', (data) => {
      console.log('Update received:', data);
  
      // Broadcast the update to all clients
      io.emit('update', data);
    });
  });

  export { io };

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
