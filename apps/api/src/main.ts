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
    // 🔥 PERBAIKAN: Tambahkan definisi tipe data untuk origin dan callback
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
  
  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();