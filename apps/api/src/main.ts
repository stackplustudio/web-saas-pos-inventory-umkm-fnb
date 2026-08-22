import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  app.enableCors({
    origin: [
      'http://localhost:3000',
      'https://web-saas-pos-inventory-umkm-fnb-web.vercel.app', 
      'https://pos.stackplustudio.com'
    ],
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // 🔥 KEMBALIKAN KE 3001 AGAR LOKAL TIDAK BENTROK
  const port = process.env.PORT || 3001;
  
  await app.listen(port, '0.0.0.0'); 
}
bootstrap();