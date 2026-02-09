import z from 'zod';

import { ContextAction } from '../enums/ContextAction';

export const ContextActionSchema = z.enum(ContextAction);
