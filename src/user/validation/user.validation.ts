import { z } from 'zod';

export const GetUserSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  pageSize: z.coerce.number().int().min(1).default(10),
  search: z.string().optional(),
  sort: z.string().optional(),
  sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc']).optional(),
});

export type GetUserDto = z.infer<typeof GetUserSchema>;

export const CreateUserSchema = z.object({
  fullName: z.string().min(1, 'Full name is required'),
  userName: z.string().min(1, 'Username is required'),
  password: z.string().min(1, 'Password is required'),
  roleId: z.coerce.number().int().min(1, 'Role ID is required'),
});

export const UpdateUserSchema = CreateUserSchema.extend({
  userId: z.coerce.number().int().min(1, 'User ID is required'),
  password: z.string().optional(),
  userName: z.string().optional(),
});
export const DeleteUserSchema = z.object({
  userId: z.coerce.number().int().min(1, 'User ID is required'),
});
export type CreateUserDto = z.infer<typeof CreateUserSchema>;
export type UpdateUserDto = z.infer<typeof UpdateUserSchema>; 
export type DeleteUserDto = z.infer<typeof DeleteUserSchema>;