import { Injectable, NotFoundException } from '@nestjs/common';
import { poolPromise } from '../config/db.config';
import * as sql from 'mssql';
import { NotFoundError } from 'rxjs';
import { AppError } from '../middleware/AppError';
import { GetUserDto, CreateUserDto, UpdateUserDto } from './dto/user.dto';
import { permission } from 'process';

@Injectable()
export class UserService {
  create(createUserDto: CreateUserDto) {
    return 'This action adds a new user';
  }

  async findAll() {
    const pool = await poolPromise;
    const result = await pool.query('SELECT * FROM dbo.mst_User');
    return result.recordset;
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

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }

  async findAllUser(query: GetUserDto) {
    const { page, pageSize, search, sort, sortOrder } = query;

    // คำนวณ offset สำหรับ SQL Server (ถ้าหน้า 1 ให้เริ่มที่ 0)
    const offset = (page - 1) * pageSize;
    const pool = await poolPromise;
    const request = pool
      .request()
      .input('Offset', sql.Int, offset)
      .input('PageSize', sql.Int, pageSize);

    let baseQuery = ' FROM dbo.mst_User';

    if (search) {
      baseQuery += ' WHERE fullname LIKE @Search OR email LIKE @Search';
      request.input('Search', sql.NVarChar, `%${search}%`);
    }

    const countQuery = `SELECT COUNT(*) as total${baseQuery}`;

    // จัดการการเรียงลำดับ (ต้องใช้ White-list ป้องกัน SQL Injection)
    const allowedSortColumns = ['userId', 'fullname', 'email'];
    const safeSort =
      sort && allowedSortColumns.includes(sort) ? sort : 'userId';
    const safeOrder = sortOrder?.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';

    // สร้างคำสั่งดึงข้อมูลพร้อมแบ่งหน้า
    const dataQuery = `SELECT fullname,email,department,position,permission${baseQuery} ORDER BY ${safeSort} ${safeOrder} OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY`;

    const countResult = await request.query(countQuery);
    const dataResult = await request.query(dataQuery);

    const totalItems = countResult.recordset[0].total;
    const totalPages = Math.ceil(totalItems / pageSize);

    return {
      currentPage: page,
      pageSize,
      totalItems,
      totalPages,
      data: dataResult.recordset.map((row) => {
        return {
          ...row,
          permission: JSON.parse(row.permission),
        };
      }),
    };
  }
}
