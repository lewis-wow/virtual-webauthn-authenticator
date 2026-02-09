import type { MergeShallow } from './MergeShallow';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type MergedShallow<T extends any[]> = T extends [
  infer Head,
  ...infer Tail,
]
  ? MergeShallow<Head, MergedShallow<Tail>>
  : // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    {};
