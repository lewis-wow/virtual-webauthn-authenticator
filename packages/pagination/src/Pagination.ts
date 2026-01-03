import { OrderByDirection } from './enums/OrderByDirection';
import type { PaginationResult } from './zod-validation/PaginationResultSchema';

// Fetch one extra item to determine if there's a next page
const PAGINATION_LOOKAHEAD_OFFSET = 1;
const ID_SORT_ORDER = OrderByDirection.ASC;

export type QueryFn<T extends { id: string }> = (opts: {
  pagination: {
    cursor: undefined | { id: string };
    take?: number;
  };
  orderBy: {
    id: 'asc';
  };
}) => Promise<T[]>;

/**
 * Handles cursor-based pagination for database queries.
 * @template T - Type of items being paginated, must have an 'id' property
 */
export class Pagination<T extends { id: string }> {
  constructor(private readonly _queryFn: QueryFn<T>) {}

  /**
   * Fetches a page of results using cursor-based pagination.
   * @param opts.limit - Maximum number of items to return
   * @param opts.cursor - Cursor ID to start pagination from
   * @returns Paginated results with metadata
   */
  async fetch(opts: {
    limit?: number;
    cursor?: string;
  }): Promise<PaginationResult<T>> {
    const { limit, cursor } = opts;

    const results = await this._queryFn({
      pagination: {
        take:
          limit !== undefined ? limit + PAGINATION_LOOKAHEAD_OFFSET : undefined,
        cursor: cursor !== undefined ? { id: cursor } : undefined,
      },
      orderBy: {
        id: ID_SORT_ORDER,
      },
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
