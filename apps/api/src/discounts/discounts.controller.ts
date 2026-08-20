import { Controller, Get, Post, Body, Patch, Param, Query, UseGuards, Request } from '@nestjs/common';
import { DiscountsService } from './discounts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('discounts')
export class DiscountsController {
  constructor(private readonly discountsService: DiscountsService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { nama: string; tipe: string; nilai: number }) {
    return this.discountsService.create(req.user.tenantId, body);
  }

  // Kasir bisa mengambil data promo untuk melihat daftar promo yang aktif
  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Get()
  findAll(@Request() req: any, @Query('activeOnly') activeOnly?: string) {
    return this.discountsService.findAll(req.user.tenantId, activeOnly === 'true');
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id/status')
  updateStatus(@Request() req: any, @Param('id') id: string, @Body() body: { status: boolean }) {
    return this.discountsService.updateStatus(req.user.tenantId, id, body.status);
  }
}