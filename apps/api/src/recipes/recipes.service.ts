import { Injectable, NotFoundException, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecipesService {
  constructor(private prisma: PrismaService) {}

  // Memastikan bahwa menu item adalah milik tenant yang sedang login
  private async verifyMenuOwnership(tenantId: string, menuItemId: string) {
    const menu = await this.prisma.menuItem.findFirst({
      where: { id: menuItemId, tenantId },
    });
    if (!menu) throw new ForbiddenException('Akses ditolak atau Menu tidak ditemukan.');
    return menu;
  }

  async create(tenantId: string, data: { menuItemId: string; ingredientId: string; jumlah_takaran: number }) {
    await this.verifyMenuOwnership(tenantId, data.menuItemId);
    
    try {
      return await this.prisma.recipe.create({
        data,
      });
    } catch (error: any) {
      // Menangkap error unique constraint Prisma jika bahan yang sama diinput 2x di menu yang sama
      if (error.code === 'P2002') {
        throw new ConflictException('Bahan baku ini sudah ada di dalam resep menu tersebut.');
      }
      throw error;
    }
  }

  // Mengambil komposisi resep dari 1 menu spesifik
  async findByMenu(tenantId: string, menuItemId: string) {
    await this.verifyMenuOwnership(tenantId, menuItemId);
    
    return this.prisma.recipe.findMany({
      where: { menuItemId },
      include: {
        ingredient: true, // Join agar FE bisa melihat nama bahan bakunya
      },
    });
  }

  async remove(tenantId: string, id: string) {
    const recipe = await this.prisma.recipe.findUnique({
      where: { id },
      include: { menuItem: true },
    });

    if (!recipe || recipe.menuItem.tenantId !== tenantId) {
      throw new NotFoundException('Resep tidak ditemukan atau akses ditolak.');
    }

    return this.prisma.recipe.delete({
      where: { id },
    });
  }
}