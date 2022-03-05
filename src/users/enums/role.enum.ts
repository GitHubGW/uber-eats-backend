import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  Owner = 'Owner',
  Customer = 'Customer',
  Driver = 'Driver',
}

registerEnumType(Role, { name: 'Role' });
