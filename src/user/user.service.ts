import { Injectable } from '@nestjs/common';
import { poolPromise } from '../config/db.config';
import * as sql from 'mssql';
import { AppError } from '../middleware/AppError';
import { CreateUserDto, UpdateUserDto,DeleteUserDto } from './validation/user.validation';

@Injectable()
export class UserService {
  async checkCompany(companyId: number) {
    const pool = await poolPromise;
    const checkUser = await pool
      .request()
      .input('companyId', sql.Int, companyId)
      .query(
        `SELECT TOP 1 * FROM dbo.mst_Company WHERE companyId = @companyId`,
      );
    if (checkUser.recordset.length === 0) {
      throw new AppError('Company not found', 404);
    }
  }

  async create(createUserDto: CreateUserDto, companyId: number) {
    await this.checkCompany(companyId);
    const { userName, password, roleId,fullName  } = createUserDto;
    const pool = await poolPromise;
    const checkUser = await pool
      .request()
      .input('userName', sql.NVarChar, userName)
      .input('companyId', sql.Int, companyId)
      .query(
        `SELECT TOP 1 * FROM dbo.mst_User WHERE userName = @userName AND companyId = @companyId`,
      );
    if (checkUser.recordset.length > 0) {
      throw new AppError('User already exists', 400);
    }
    const request = pool.request();
    request.input('userName', sql.NVarChar, userName);
    request.input('password', sql.NVarChar, password);
    request.input('roleId', sql.Int, roleId);
    request.input('fullName', sql.NVarChar, fullName);
    request.input('companyId', sql.Int, companyId);
    await request.query(`INSERT INTO dbo.mst_User (userName, password, roleId,fullName, companyId) 
    VALUES (@userName, @password, @roleId,@fullName, @companyId) `);

    return { message: 'Create User Successfully' };
  }

  async findOne(id: number) {
    const pool = await poolPromise;
    const result = await pool
      .request()
      .input('ID', sql.Int, id)
      .query('SELECT * FROM dbo.mst_User WHERE userId = @ID');

    if (result.recordset.length === 0) {
      throw new AppError('User not found', 404);
    }
    return result.recordset[0];
  }

  async update(updateUserDto: UpdateUserDto, companyId: number) {
    await this.checkCompany(companyId);
    
    const { userId, password, roleId ,fullName} = updateUserDto;
    const pool = await poolPromise;
    const request = pool.request();
    request.input('userId', sql.Int, userId);
    request.input('fullName', sql.NVarChar, fullName);
    request.input('password', sql.NVarChar, password);
    request.input('roleId', sql.Int, roleId);
    request.input('companyId', sql.Int, companyId);
    await request.query(
      `UPDATE dbo.mst_User SET fullName = ISNULL(@fullName,fullName), password = ISNULL(@password,password), roleId = ISNULL(@roleId,roleId) WHERE userId = @userId and  companyId = @companyId`,
    );

    return { message: 'Update User Successfully' };
  }

  async remove(deleteUserDto: DeleteUserDto,companyId: number) {
    await this.checkCompany(companyId);
    const pool = await poolPromise;
    const checkUser = await pool
      .request()
      .input('userId', sql.Int, deleteUserDto.userId)
      .input('companyId', sql.Int, companyId)
      .query(
        `SELECT TOP 1 * FROM dbo.mst_User WHERE userId = @userId AND companyId = @companyId `,
      );
    if (checkUser.recordset.length === 0) {
      throw new AppError('User not found', 404);
    }
    await pool
      .request()
      .input('userId', sql.Int, deleteUserDto.userId)
      .input('companyId', sql.Int, companyId)
      .query(`UPDATE dbo.mst_User SET delFlag = 1 WHERE userId = @userId AND companyId = @companyId`);
    return { message: 'Delete User Successfully' };
  }

  async findAllUser(companyId: number) {
    await this.checkCompany(companyId);
    const pool = await poolPromise;
    const request = await pool.request().input('companyId', sql.Int, companyId)
      .query(`
        SELECT u.userId,u.userName,r.roleName,u.lastUpdate,u.roleId,u.fullName FROM dbo.mst_User u LEFT JOIN dbo.mst_Role r ON u.roleId = r.roleId WHERE u.companyId = @companyId and delFlag=0 ORDER BY userId ASC
        `);
    return request.recordset;
  }
}
