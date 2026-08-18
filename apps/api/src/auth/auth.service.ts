import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  // 1. Validasi kredensial (Email & Password)
  async validateUser(email: string, pass: string): Promise<any> {
    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (user && (await bcrypt.compare(pass, user.password))) {
      // Pastikan akun berstatus ACTIVE
      if (user.status !== 'ACTIVE') {
        return null;
      }
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  // 2. Generate Tokens (Access & Refresh)
  async login(user: any) {
    // JWT Payload sekarang membawa tenantId (Krusial untuk SaaS Multi-Tenant)
    const payload = { 
      email: user.email, 
      sub: user.id, 
      role: user.role,
      tenantId: user.tenantId // Inject tenantId ke dalam token
    };

    // Access token (umur default biasanya 15m - 1h diatur di auth.module)
    const accessToken = this.jwtService.sign(payload);
    
    // Refresh token untuk disimpan di HTTP-Only Cookie (umur 7 hari)
    const refreshToken = this.jwtService.sign(payload, {
      secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret-cahyodev',
      expiresIn: '7d',
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        tenantId: user.tenantId, // Kirim ke frontend agar web dashboard tahu context bisnisnya
      },
      access_token: accessToken,
      refreshToken,
    };
  }
}