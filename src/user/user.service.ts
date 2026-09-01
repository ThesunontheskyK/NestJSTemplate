import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { poolPromise } from '../config/db.config';
import * as sql from 'mssql';
import { NotFoundError } from 'rxjs';
import { AppError } from '../middleware/AppError';

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

    if(result.recordset.length === 0){
      throw new AppError('User not found', 404)
    }
    return result.recordset[0];
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
