import express, { Express, Request, Response } from 'express';
import { log } from '@utils/logger';
import dotenv from 'dotenv';

dotenv.config();

const app: Express = express();
const port = process.env.PORT || 3000;

app.get('/', (req: Request, res: Response) => {
  res.send('Hello World!');
});

app.listen(port, () => {
  log(`[server]: Server is running at https://localhost:${port}`);
});