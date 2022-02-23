import { registerEnumType } from '@nestjs/graphql';

export enum Role {
  Owner,
  Customer,
  DeliveryMan,
}

registerEnumType(Role, { name: 'Role' });
