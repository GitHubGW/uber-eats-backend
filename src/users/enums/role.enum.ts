import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  Owner = 'Owner',
  Customer = 'Customer',
  DeliveryMan = 'DeliveryMan',
}

registerEnumType(Role, { name: 'Role' });
