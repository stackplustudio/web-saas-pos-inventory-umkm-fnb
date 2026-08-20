import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { SuppliersService } from './suppliers.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('suppliers')
export class SuppliersController {
  constructor(private readonly suppliersService: SuppliersService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { nama: string; kontak?: string }) {
    return this.suppliersService.create(req.user.tenantId, body);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Request() req: any) {
    return this.suppliersService.findAll(req.user.tenantId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: { nama?: string; kontak?: string }) {
    return this.suppliersService.update(req.user.tenantId, id, body);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.suppliersService.remove(req.user.tenantId, id);
  }
}