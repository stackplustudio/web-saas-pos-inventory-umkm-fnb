import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  getProfile(@Request() req: any) {
    return this.settingsService.getTenantProfile(req.user.tenantId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch()
  updateProfile(@Request() req: any, @Body() body: { nama_bisnis?: string; alamat?: string }) {
    return this.settingsService.updateTenantProfile(req.user.tenantId, body);
  }
}