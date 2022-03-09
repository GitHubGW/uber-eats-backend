import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  Owner = 'Owner',
  Customer = 'Customer',
  Driver = 'Driver',
  Any = 'Any',
}

registerEnumType(Role, { name: 'Role' });
