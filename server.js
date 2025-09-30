import express from 'express';
import dotenv from 'dotenv'
import ssoRouter from './routes/sso.js';
import cors from 'cors'
import { connectDB } from './config/db.js';
dotenv.config();
const app = express();
app.use(express.json());
app.use(cors())

// mount SSO module
app.use('/sso', ssoRouter);

// simple health
app.get('/', (req, res) => res.send('App backend (with SSO module) running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on http://localhost:${PORT}`);
});
