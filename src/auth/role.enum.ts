export enum Role {
  Admin = 'Admin',
  User = 'User',
  AdminPriva='AdminPriva'
}

export const RoleGroup = {
  Default: [Role.Admin, Role.User],
  AdminOnly: [Role.Admin],
  All: Object.values(Role),
  AdminPriva:[Role.AdminPriva]
  
};

