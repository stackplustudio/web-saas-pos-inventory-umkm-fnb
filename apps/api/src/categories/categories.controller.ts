import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { CategoriesService } from './categories.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

// Pasang pagar Guard di level controller (berlaku untuk semua rute di dalamnya)
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('categories')
export class CategoriesController {
  constructor(private readonly categoriesService: CategoriesService) {}

  // 🔒 Create: Hanya Owner & Manager
  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { nama_kategori: string }) {
    // req.user.tenantId otomatis didapat dari token JWT yang sudah divalidasi
    return this.categoriesService.create(req.user.tenantId, body);
  }

  // 🔓 Read: Owner, Manager, dan Kasir boleh akses
  @Roles(Role.OWNER, Role.MANAGER, Role.KASIR)
  @Get()
  findAll(@Request() req: any) {
    return this.categoriesService.findAll(req.user.tenantId);
  }

  // 🔒 Update: Hanya Owner & Manager
  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() body: { nama_kategori: string }) {
    return this.categoriesService.update(req.user.tenantId, id, body);
  }

  // 🔒 Delete: Hanya Owner & Manager
  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.categoriesService.remove(req.user.tenantId, id);
  }
}