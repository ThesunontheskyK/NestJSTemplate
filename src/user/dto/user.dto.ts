import { IsOptional, IsString, Min, IsNotEmpty } from 'class-validator';
import { Type } from 'class-transformer';

export class GetUserDto {
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @Min(1)
  pageSize: number = 10;

  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  sort?: string = 'userId';

  @IsOptional()
  @IsString()
  sortOrder?: string = 'ASC';
}

export class CreateUserDto  {
  @IsString()
  fullname? : string;

  @IsString()
  email? : string;

  @IsString()

  password? : string;

  @IsString()
  department? : string;

  @IsString()
  position? : string;
}

export class UpdateUserDto {}