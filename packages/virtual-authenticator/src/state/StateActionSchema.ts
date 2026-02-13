import z from 'zod';

import { StateAction } from './StateAction';

export const StateActionSchema = z.enum(StateAction);
