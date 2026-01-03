import z from 'zod';

import { OrderByDirection } from '../../enums/OrderByDirection';

export const OrderByDirectionSchema = z.enum(OrderByDirection).meta({
  description: 'OrderByDirection',
  examples: [OrderByDirection.ASC],
});
