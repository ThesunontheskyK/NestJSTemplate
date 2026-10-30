import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  UseGuards,
  Query,
  Req,
} from '@nestjs/common';
import { UserService } from './user.service';
import { JwtAuthGuard } from 'src/middleware/jwt-auth.guard';
import { CreateUserSchema, type CreateUserDto, UpdateUserSchema, type UpdateUserDto, DeleteUserSchema, type DeleteUserDto } from './validation/user.validation';
import * as bcrypt from 'bcrypt';
import { UsePipes, ValidationPipe } from '@nestjs/common';
import { RolesGuard, Roles } from '../auth/roleAuthen'
import { Role, RoleGroup } from '../auth/role.enum';
import { AppError } from 'src/middleware/AppError';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) { }

  @UseGuards(JwtAuthGuard)
  @Post() 
  async create(@Req() req: any, @Body() body: any) {
    const createUserDto = CreateUserSchema.parse(body);
    const companyId = req.user.companyId;
    if (!companyId) {
      throw new AppError('Company ID is required', 400);
    }
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(createUserDto.password, salt);
    createUserDto.password = hashedPassword;
    return await this.userService.create(createUserDto, companyId);
  }

 
  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleGroup.Default)
  @Post('list')
  async findAllUser(@Req() req:any, @Body() body: any) {
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError('Company ID is required', 400);
    }
    return await this.userService.findAllUser(companyId);
  }


  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleGroup.Default)
  @Put('')
  async update(@Req() req: any, @Body() body: any) {
    const updateUserDto = UpdateUserSchema.parse(body);
    const companyId = req.user?.companyId; 
    if (!companyId) {
      throw new AppError('Company ID is required', 400);
    }
    if (updateUserDto.password) {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(updateUserDto.password, salt);
      updateUserDto.password = hashedPassword;
    }

    return await this.userService.update(updateUserDto, companyId);
  }

  @UseGuards(JwtAuthGuard,RolesGuard)
  @Roles(RoleGroup.Default)
  @Delete('')
  async remove(@Req() req: any, @Body() body: any) {
    const deleteUserDto = DeleteUserSchema.parse(body);
    const companyId = req.user?.companyId;
    if (!companyId) {
      throw new AppError('Company ID is required', 400);
    }
    return await this.userService.remove(deleteUserDto, companyId);
  }
}
