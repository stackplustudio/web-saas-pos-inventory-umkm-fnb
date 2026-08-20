import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { TablesService } from './tables.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tables')
export class TablesController {
  constructor(private readonly tablesService: TablesService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { nomor_meja: string; area?: string }) {
    return this.tablesService.create(req.user.tenantId, body);
  }

  // KASIR butuh melihat daftar meja untuk transaksi POS
  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Get()
  findAll(@Request() req: any) {
    return this.tablesService.findAll(req.user.tenantId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: { nomor_meja?: string; area?: string; status?: string }) {
    return this.tablesService.update(req.user.tenantId, id, body);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.tablesService.remove(req.user.tenantId, id);
  }
}