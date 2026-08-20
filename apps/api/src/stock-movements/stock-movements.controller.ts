import { Controller, Get, Post, Body, Query, UseGuards, Request } from '@nestjs/common';
import { StockMovementsService } from './stock-movements.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('stock-movements')
export class StockMovementsController {
  constructor(private readonly stockMovementsService: StockMovementsService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { ingredientId: string; tipe: string; jumlah: number; catatan?: string }) {
    return this.stockMovementsService.create(req.user.tenantId, body);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Request() req: any, @Query('ingredientId') ingredientId?: string) {
    return this.stockMovementsService.findAll(req.user.tenantId, ingredientId);
  }
}