import { Module } from '@nestjs/common';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { CategoriesModule } from './categories/categories.module';
import { MenuItemsModule } from './menu-items/menu-items.module';
import { IngredientsModule } from './ingredients/ingredients.module';
import { RecipesModule } from './recipes/recipes.module';
import { ShiftsModule } from './shifts/shifts.module';
import { TablesModule } from './tables/tables.module';
import { OrdersModule } from './orders/orders.module';
import { StockMovementsModule } from './stock-movements/stock-movements.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { SettingsModule } from './settings/settings.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { DiscountsModule } from './discounts/discounts.module';
import { PurchaseOrdersModule } from './purchase-orders/purchase-orders.module';
import { TenantsModule } from './tenants/tenants.module';

@Module({
  imports: [
    // Mendaftarkan semua modul ke dalam ekosistem aplikasi utama
    PrismaModule,
    AuthModule,
    UsersModule,
    CategoriesModule,
    MenuItemsModule,
    IngredientsModule,
    RecipesModule,
    ShiftsModule,
    TablesModule,
    OrdersModule,
    StockMovementsModule,
    AnalyticsModule,
    SettingsModule,
    SuppliersModule,
    DiscountsModule,
    PurchaseOrdersModule,
    TenantsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}