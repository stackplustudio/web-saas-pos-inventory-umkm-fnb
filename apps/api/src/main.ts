import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const allowedOrigins = [
    'http://localhost:3000',
    'https://web-saas-pos-inventory-umkm-fnb-web.vercel.app', 
    'https://pos.stackplustudio.com'
  ];

  app.enableCors({
    origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // 🔥 PERBAIKAN: Default ke 3000 agar selaras dengan Dockerfile
  const port = process.env.PORT || 3000;
  
  // 🔥 KUNCI UTAMA: Wajib pakai '0.0.0.0' agar terbuka untuk Back4App
  await app.listen(port, '0.0.0.0'); 
}
bootstrap();