import { Controller, Get, Post, Body, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { RecipesService } from './recipes.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('recipes')
export class RecipesController {
  constructor(private readonly recipesService: RecipesService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() body: { menuItemId: string; ingredientId: string; jumlah_takaran: number }) {
    return this.recipesService.create(req.user.tenantId, body);
  }

  // Mengambil daftar komposisi resep berdasarkan ID Menu
  @Roles(Role.OWNER, Role.MANAGER)
  @Get('menu/:menuItemId')
  findByMenu(@Request() req: any, @Param('menuItemId') menuItemId: string) {
    return this.recipesService.findByMenu(req.user.tenantId, menuItemId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.recipesService.remove(req.user.tenantId, id);
  }
}