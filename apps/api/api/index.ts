import 'reflect-metadata';
import { VercelRequest, VercelResponse } from '@vercel/node';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';

let cachedServer: any;

async function bootstrapServer() {
  if (!cachedServer) {
    const app = await NestFactory.create(AppModule);
    app.setGlobalPrefix('api');
    await app.init();
    cachedServer = app.getHttpAdapter().getInstance();
  }
  return cachedServer;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const server = await bootstrapServer();
  return server(req, res);
}
