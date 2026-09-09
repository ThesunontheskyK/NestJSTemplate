import { IsOptional, IsString, Min } from 'class-validator';
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