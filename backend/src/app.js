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
      // Allow: no origin (mobile apps, curl), localhost, known URLs
      if (
        !origin || 
        origin.startsWith('http://localhost') ||
        origin.startsWith('http://192.168.') ||
        origin.startsWith('http://10.') ||
        origin.endsWith('.loca.lt') ||
        env.clientUrls.includes(origin) || 
        origin.endsWith('.netlify.app')
      ) {
        callback(null, true);
        return;
      }
      // For mobile apps (Flutter), origin is usually undefined — allow all
      callback(null, true);
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
