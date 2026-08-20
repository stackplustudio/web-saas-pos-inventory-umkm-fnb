import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '@prisma/client';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Roles(Role.OWNER, Role.MANAGER)
  @Post()
  create(@Request() req: any, @Body() createUserDto: CreateUserDto) {
    return this.usersService.create(req.user.tenantId, createUserDto);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get()
  findAll(@Request() req: any) {
    return this.usersService.findAll(req.user.tenantId);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Get(':id')
  findOne(@Request() req: any, @Param('id') id: string) {
    return this.usersService.findOne(req.user.tenantId, id);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Patch(':id')
  update(@Request() req: any, @Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(req.user.tenantId, id, updateUserDto);
  }

  @Roles(Role.OWNER, Role.MANAGER)
  @Delete(':id')
  remove(@Request() req: any, @Param('id') id: string) {
    return this.usersService.remove(req.user.tenantId, id);
  }
}