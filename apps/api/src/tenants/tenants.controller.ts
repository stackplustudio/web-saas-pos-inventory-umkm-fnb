import { Controller, Get, Post, Patch, Param, Body, UseGuards } from '@nestjs/common';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('tenants')
export class TenantsController {
  constructor(private readonly tenantsService: TenantsService) {}

  @Roles(Role.SUPER_ADMIN)
  @Get()
  findAll() {
    return this.tenantsService.findAll();
  }

  // 🔥 ENDPOINT BARU UNTUK TAMBAH KLIEN
  @Roles(Role.SUPER_ADMIN)
  @Post()
  createTenant(@Body() body: any) {
    return this.tenantsService.createTenant(body);
  }

  @Roles(Role.SUPER_ADMIN)
  @Patch(':id/status')
  updateStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return this.tenantsService.updateStatus(id, body.status);
  }
}