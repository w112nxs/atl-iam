import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import eventRoutes from './routes/events';
import userRoutes from './routes/users';
import submissionRoutes from './routes/submissions';
import adminRoutes from './routes/admin';
import auditRoutes from './routes/audit';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/audit', auditRoutes);

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok' });
});

app.listen(PORT, () => {
  console.log(`Atlanta IAM API running on port ${PORT}`);
});
