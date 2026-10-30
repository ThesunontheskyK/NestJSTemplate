import { Controller, Post, Body, Res, HttpStatus } from '@nestjs/common';
import type { Response } from 'express';
import * as sql from 'mssql';
import { poolPromise } from '../config/db.config';
import * as bcrypt from 'bcrypt';
import * as jwt from 'jsonwebtoken';

@Controller('auth')
export class AuthController {
  @Post('login')
  async login(@Body() body: any, @Res() res: Response) {
    try {
      const { userName, password } = body;

      if (!userName || !password) {
        return res.status(HttpStatus.BAD_REQUEST).json({
          message: 'Please provide both userName and password',
        });
      }

      const pool = await poolPromise;

      const result = await pool
        .request()
        .input('userName', sql.VarChar, userName)
        .query(
          'SELECT Top 1 u.* , r.roleName FROM mst_User u LEFT JOIN mst_Role r ON u.roleId = r.roleId WHERE userName = @userName and delFlag = 0',
        );

      const user = result.recordset[0];

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({
          message: 'Invalid userName or passwordss',
        });
      }

      let isMatch = false;

      const isHashed =
        user.password.startsWith('$2a$') || user.password.startsWith('$2b$');

      if (isHashed) {
        // Normal login for already hashed passwords
        isMatch = await bcrypt.compare(password, user.password);
      } else {
        // Plain text check (Migration path)
        if (password === user.password) {
          isMatch = true;

          // Hash the password for future logins
          const salt = await bcrypt.genSalt(10);
          const hashedPassword = await bcrypt.hash(password, salt);

          // Update the database with the hashed password
          await pool
            .request()
            .input('hashedPassword', sql.VarChar, hashedPassword)
            .input('userId', sql.Int, user.userId)
            .query(
              'UPDATE mst_User SET password = @hashedPassword WHERE userId = @userId',
            );
        }
      }

      if (!isMatch) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'Invalid userName or password',
        });
      }

      const secretKey = process.env.JWT_SECRET as string;
      const token = jwt.sign(
        {
          userId: user.userId,
          fullname: user.fullName,
          userName: user.userName,
          companyId: user.companyId,
          roleName: user.roleName,
        },
        secretKey,
        { expiresIn: '7d' },
      );
      console.log(user.fullname);
      
      return res.status(HttpStatus.OK).json({
        message: 'Login successful',
        token: token,
      });
    } catch (error) {
      console.error('Login Error:', error);
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: 'Internal Server Error during login',
      });
    }
  }
}
