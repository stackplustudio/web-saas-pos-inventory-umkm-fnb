import { Injectable, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PrismaService } from '../../prisma/prisma.service'; // Import Prisma Service

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  // 🔥 Inject PrismaService ke dalam constructor
  constructor(private prisma: PrismaService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'secret-cahyodev',
    });
  }

  async validate(payload: any) {
    // 1. Cari user di database berdasarkan ID yang ada di dalam token (payload.sub)
    const user = await this.prisma.user.findUnique({
      where: { id: payload.sub },
      include: { tenant: true } // Tarik juga data Tenant (Restoran) miliknya
    });

    if (!user) {
      throw new UnauthorizedException('Token tidak valid atau user tidak ditemukan.');
    }

    // 2. 🔥 LOGIKA SUSPEND SaaS 🔥
    // Jika user punya tenant, dan status tenant tersebut SUSPENDED, tolak semua akses!
    if (user.tenant && user.tenant.status_langganan === 'SUSPENDED') {
      throw new ForbiddenException('SUSPENDED_TENANT');
    }

    // 3. Kembalikan data user agar bisa diakses menggunakan req.user di Controller
    return { 
      id: user.id, 
      email: user.email, 
      role: user.role,
      tenantId: user.tenantId 
    };
  }
}