import express from 'express';
import dotenv from 'dotenv'
import ssoRouter from './routes/sso.js';
import studentRouter from './routes/student.js'
import tutorRouter from './routes/tutor.js'
import cors from 'cors'
import { connectDB, studentClient, tutorClient } from './config/db.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())

app.use('/sso', ssoRouter);
app.use('/student', studentRouter);
app.use('/tutor', tutorRouter);
app.get('/', (req, res) => res.send('App backend (with SSO module) running'));
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
