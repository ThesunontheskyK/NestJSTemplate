import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  InternalServerErrorException,
} from '@nestjs/common';
import jwt, { TokenExpiredError } from 'jsonwebtoken';
import { poolPromise } from '../config/db.config';
import * as sql from 'mssql';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('No Token provided');
    }

    try {
      // 1. ตรวจสอบ JWT Token
      const secretKey = process.env.JWT_SECRET as string;
      const decoded = jwt.verify(token, secretKey) as any;
      request.user = decoded;

      const userId = decoded?.userId;
      if (!userId) {
        throw new UnauthorizedException(
          'Unauthorized: Invalid token payload (User ID missing)',
        );
      }

      // 2. ตรวจสอบฐานข้อมูลว่ายังมี User นี้อยู่ในระบบหรือไม่ (ยังไม่ถูกลบ)
      const pool = await poolPromise;
      const result = await pool
        .request()
        .input('userId', sql.Int, userId)
        .query('SELECT 1 FROM mst_User WHERE userId = @userId AND delFlag = 0');

      if (result.recordset.length === 0) {
        throw new ForbiddenException(
          'Forbidden: User no longer exists in the system',
        );
      }

      return true;
    } catch (error) {
      if (error instanceof TokenExpiredError) {
        throw new UnauthorizedException('Token Expired');
      }
      if (
        error instanceof UnauthorizedException ||
        error instanceof ForbiddenException
      ) {
        throw error;
      }
      if (error instanceof jwt.JsonWebTokenError) {
        throw new UnauthorizedException('Invalid Token');
      }
      console.error('Database Error during Auth Guard:', error);
      throw new InternalServerErrorException('Internal Server Error');
    }
  }
}
