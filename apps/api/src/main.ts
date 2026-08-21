import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 🔥 KONFIGURASI CORS UNTUK PRODUCTION (Vercel -> Back4App)
  app.enableCors({
    origin: true, // 'true' akan memantulkan kembali domain Vercel Anda secara otomatis dan aman
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true, // Wajib diaktifkan jika Axios mengirim Authorization/Cookie
  });
  
  // Jalankan backend dengan port dinamis dari cloud, atau 3001 untuk lokal
  const port = process.env.PORT || 3001;
  await app.listen(port);
}
bootstrap();