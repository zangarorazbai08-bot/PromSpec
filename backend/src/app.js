import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import env from './config/env.js';
import authRoutes from './routes/authRoutes.js';
import userRoutes from './routes/userRoutes.js';
import materialRoutes from './routes/materialRoutes.js';
import projectRoutes from './routes/projectRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import requestRoutes from './routes/requestRoutes.js';
import { errorHandler, notFound } from './middlewares/errorMiddleware.js';
import statsRoutes from './routes/statsRoutes.js';

const app = express();

app.set('trust proxy', 1);
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || env.clientUrls.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error('CORS рұқсат етілмеді'));
    },
    credentials: true
  })
);
app.use(express.json({ limit: '5mb' }));
app.use(cookieParser());

app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    app: 'Prom Spec Stroy ERP'
  });
});

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/materials', materialRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/requests', requestRoutes);
app.use('/api/dashboard', statsRoutes);


app.use(notFound);
app.use(errorHandler);

export default app;
