import { Request, Response } from 'express';

export function helloWorldHandler(req: Request, res: Response) {
  res.send('Hello World!');
}