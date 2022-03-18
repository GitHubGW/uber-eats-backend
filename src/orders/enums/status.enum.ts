import { registerEnumType } from '@nestjs/graphql';

export enum Status {
  Pending = 'Pending',
  Cooking = 'Cooking',
  PickedUp = 'PickedUp',
  Delivered = 'Delivered',
}

registerEnumType(Status, { name: 'Status' });
