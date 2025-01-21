import express, { Express, Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import { log } from '@utils/logger';
import { helloWorldHandler } from '@handlers/index';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

// cors
const corsOptions: cors.CorsOptions = {
  origin: "http://localhost:8080"
};
app.use(cors(corsOptions));

app.get('/', helloWorldHandler);

app.listen(port, () => {
  log(`[server]: Server is running at https://localhost:${port}`);
});