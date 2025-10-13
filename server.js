import express from 'express';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';

import ssoRouter from './routes/sso.js';
import studentRouter from './routes/student.js';
import tutorRouter from './routes/tutor.js';
import notificationRouter from './routes/notification.js'
import { connectDB } from './config/db.js';
import { initCronJobs } from './jobs/cronJobs.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
  },
});
app.set('io', io);
app.use('/sso', ssoRouter);
app.use('/student', studentRouter);
app.use('/tutor', tutorRouter);
app.use('/notification', notificationRouter)
initCronJobs();

io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});
const PORT = process.env.PORT || 5000;
server.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
