import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../db/client';
import { Role, BillingTier } from '@prisma/client';

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-me';

export class AuthService {
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }

  static async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  static generateToken(userId: string, role: Role): string {
    return jwt.sign({ userId, role }, JWT_SECRET, { expiresIn: '7d' });
  }

  static async createUser(data: { email: string; passwordHash: string; username: string }) {
    return prisma.user.create({
      data: {
        ...data,
        profile: {
          create: {
            handle: data.username,
            settings: {
              audioQuality: 'NORMAL',
              theme: 'SYSTEM',
              dataSaver: false,
              explicitFilter: false,
            },
          },
        },
      },
      include: {
        profile: true,
      },
    });
  }

  static async validateUser(email: string) {
    return prisma.user.findUnique({
      where: { email },
      include: { profile: true, artistProfile: true },
    });
  }
}
