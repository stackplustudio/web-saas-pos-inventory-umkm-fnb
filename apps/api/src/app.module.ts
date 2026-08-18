import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';

@Module({
  imports: [
    // Mendaftarkan semua modul ke dalam ekosistem aplikasi utama
    PrismaModule,
    AuthModule,
    CategoriesModule,
    MenuItemsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}