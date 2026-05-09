import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import type { Express } from 'express';
import logger from '@/core/logger';
import { requestLogger } from '@/shared/middleware/request-logger';
import { errorHandler } from '@/shared/middleware/error-handler';
import healthRoutes from '@/modules/health/health.routes'
import { toNodeHandler } from "better-auth/node";
import { auth } from '@/utils/auth';



const app: Express = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestLogger);

app.all("/api/v1/auth/*",toNodeHandler(auth))

app.use('/health', healthRoutes);

app.use(errorHandler);


export default app;
