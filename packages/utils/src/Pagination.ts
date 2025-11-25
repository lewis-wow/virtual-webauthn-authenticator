import type { PaginationResult } from './validation/PaginationResultSchema';

export type QueryFn<T extends { id: string }> = (opts: {
  limit?: number;
  cursor?: string;
}) => Promise<T[]>;

export class Pagination<T extends { id: string }> {
  constructor(private readonly _queryFn: QueryFn<T>) {}

  async fetch(opts: Parameters<QueryFn<T>>[0]): Promise<PaginationResult<T>> {
    const { limit, cursor } = opts;

    const results = await this._queryFn({
      limit: limit !== undefined ? limit + 1 : undefined,
      cursor: cursor,
    });

    let nextCursor: string | null = null;

    if (results.length > (limit ?? Infinity)) {
      const nextItem = results.pop()!;
      nextCursor = nextItem.id;
    }

    return {
      data: results,
      meta: {
        nextCursor,
        hasNext: !!nextCursor,
      },
    } as PaginationResult<T>;
  }
}
