import { z } from 'zod';

import { ILitNodeClientSchema } from '@lit-protocol/schemas';

export type ILitNodeClient = z.infer<typeof ILitNodeClientSchema>;
