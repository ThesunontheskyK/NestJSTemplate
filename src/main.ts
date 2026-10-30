import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './middleware/errorHandler';
import helmet from 'helmet';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.use(helmet({
    crossOriginResourcePolicy: false, // ป้องกัน Helmet บล็อก Cross-Origin
  }));
  
  app.enableCors({
    origin: true, // อนุญาตทุก Origin หรือระบุเป็น array เช่น ['http://localhost:3000']
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });

  await app.listen(process.env.SERVER_PORT ?? 3000);
}
bootstrap();
