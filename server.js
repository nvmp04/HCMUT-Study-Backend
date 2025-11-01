import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import jwt from 'jsonwebtoken';

import adminRouter from './routes/admin.js'
import ssoRouter from './routes/sso.js';
import studentRouter from './routes/student.js';
import tutorRouter from './routes/tutor.js';
import notificationRouter from './routes/notification.js';
import { connectDB } from './config/db.js';
import { initCronJobs } from './jobs/cronJobs.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());

// Tạo HTTP server và Socket.IO server
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    credentials: true
  }
});

app.set('io', io);

// Middleware xác thực token trước khi kết nối Socket.IO
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  
  if (!token) {
    console.log('Socket không có token');
    return next(new Error('Token không tồn tại'));
  }

  try {
    const decoded = jwt.verify(token, process.env.SSO_SECRET);
    socket.userId = decoded.id;
    socket.user = decoded;
    console.log('Token xác thực thành công, User ID:', decoded.id);
    next();
  } catch (err) {
    console.log('Token không hợp lệ:', err.message);
    next(new Error('Token không hợp lệ: ' + err.message));
  }
});

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id, 'User ID:', socket.userId);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });

});

// Xử lý lỗi kết nối Socket.IO
io.on('connect_error', (error) => {
  console.error('Socket connection error:', error);
});

// Routes API
app.use('/sso', ssoRouter);
app.use('/admin', adminRouter);
app.use('/student', studentRouter);
app.use('/tutor', tutorRouter);
app.use('/notification', notificationRouter);
// Start server

const PORT = process.env.PORT || 5000;
server.listen(PORT,'0.0.0.0', async () => {
  initCronJobs(io);
  await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
