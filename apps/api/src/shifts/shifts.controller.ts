import { Controller, Get, Post, Body, Patch, Param, UseGuards, Request } from '@nestjs/common';
import { ShiftsService } from './shifts.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('shifts')
export class ShiftsController {
  constructor(private readonly shiftsService: ShiftsService) {}

  @Roles(Role.KASIR, Role.OWNER, Role.MANAGER)
  @Post('open')
  openShift(@Request() req: any, @Body() body: { modal_awal: number }) {
    return this.shiftsService.openShift(req.user.tenantId, req.user.id, body.modal_awal);
  }

  @Roles(Role.KASIR, Role.OWNER, Role.MANAGER)
  @Patch('close/:id')
  closeShift(@Request() req: any, @Param('id') id: string, @Body() body: { kas_fisik: number; catatan?: string }) {
    return this.shiftsService.closeShift(req.user.tenantId, req.user.id, id, body.kas_fisik, body.catatan);
  }

  @Roles(Role.KASIR, Role.OWNER, Role.MANAGER)
  @Get('active')
  getActiveShift(@Request() req: any) {
    return this.shiftsService.getActiveShift(req.user.tenantId, req.user.id);
  }
}