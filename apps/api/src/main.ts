import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔥 KITA DAFTARKAN SEMUA DOMAIN SECARA EKSPLISIT
  const allowedOrigins = [
    'http://localhost:3000',
    'https://web-saas-pos-inventory-umkm-fnb-web.vercel.app', 
    'https://pos.stackplustudio.com' // Tambahkan custom domain baru Anda di sini!
  ];

  app.enableCors({
    origin: (origin, callback) => {
      // Jika request datang tanpa origin (misal dari postman/curl) atau dari origin yang diizinkan
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();