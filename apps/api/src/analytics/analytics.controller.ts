import { Controller, Get, Query, UseGuards, Request } from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('analytics')
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Get('summary')
  getTodaySummary(@Request() req: any) {
    return this.analyticsService.getTodaySummary(req.user.tenantId);
  }

  // 🔥 ENDPOINT BARU
  @Roles(Role.OWNER, Role.MANAGER)
  @Get('profit-loss')
  getProfitLoss(
    @Request() req: any,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.analyticsService.getProfitLoss(req.user.tenantId, startDate, endDate);
  }
}