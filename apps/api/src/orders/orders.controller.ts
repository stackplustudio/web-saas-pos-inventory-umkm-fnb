import { Controller, Post, Body, UseGuards, Request, Get } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role, OrderType } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Roles(Role.KASIR, Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { tipe: OrderType; tableId?: string; metode_bayar: string; items: any[] }) {
    return this.ordersService.createOrder(req.user.tenantId, req.user.id, body);
  }

  // Pastikan Anda juga meng-import Get dari '@nestjs/common' di atas
  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Request() req: any) {
    return this.ordersService.findAll(req.user.tenantId);
  }
}