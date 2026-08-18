import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { MenuItemsService } from './menu-items.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('menu-items')
export class MenuItemsController {
  constructor(private readonly menuItemsService: MenuItemsService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { nama: string; harga_jual: number; categoryId: string }) {
    return this.menuItemsService.create(req.user.tenantId, body);
  }

  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Get()
  findAll(@Request() req: any) {
    return this.menuItemsService.findAll(req.user.tenantId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: { nama?: string; harga_jual?: number; status?: boolean }) {
    return this.menuItemsService.update(req.user.tenantId, id, body);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.menuItemsService.remove(req.user.tenantId, id);
  }
}