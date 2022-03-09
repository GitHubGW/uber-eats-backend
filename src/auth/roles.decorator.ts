import { CustomDecorator, SetMetadata } from '@nestjs/common';
import { Role } from 'src/users/enums/role.enum';

export type RolesType = Role.Owner | Role.Customer | Role.Driver | Role.Any;

export const Roles = (roles: RolesType[]): CustomDecorator<string> => {
  return SetMetadata('roles', roles);
};
