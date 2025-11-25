import type { PaginationState, OnChangeFn } from '@tanstack/react-table';
import { useState, useMemo, useCallback } from 'react';

interface UseCursorPaginationProps {
  /** * The initial number of rows per page.
   * @default 10
   */
  defaultPageSize?: number;
  /** * The 'nextCursor' returned from your most recent API call.
   * Pass `undefined` or `null` if the query is loading or there is no next page.
   */
  nextCursor?: string | null;
  /** * The 'hasNext' boolean from your API.
   * Used to calculate the fake rowCount.
   */
  hasNextPage?: boolean;
}

interface UseCursorPaginationReturn {
  /** State object to pass to the DataTable `pagination` prop */
  pagination: PaginationState;
  /** Handler to pass to the DataTable `onPaginationChange` prop */
  onPaginationChange: OnChangeFn<PaginationState>;
  /** The specific cursor string to pass to your API query for the CURRENT page */
  cursor: string | undefined;
  /** * Calculated total row count to pass to DataTable.
   * This tricks the table into enabling/disabling the 'Next' button correctly.
   */
  rowCount: number;
  /** Helper to fully reset state (e.g., when applying new filters) */
  reset: () => void;
}

export function useCursorPagination({
  defaultPageSize = 10,
  nextCursor = null,
  hasNextPage = false,
}: UseCursorPaginationProps): UseCursorPaginationReturn {
  // 1. Standard TanStack Pagination State
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  // 2. Cursor History State
  // We store the cursor required to reach each page index.
  // Index 0 is always null (start of list).
  // Index 1 is the cursor needed to fetch Page 1, etc.
  const [cursorHistory, setCursorHistory] = useState<(string | null)[]>([null]);

  // 3. Derive current cursor to fetch based on current page index
  const cursor = useMemo(() => {
    return cursorHistory[pagination.pageIndex] ?? undefined;
  }, [cursorHistory, pagination.pageIndex]);

  // 4. Calculate 'Fake' Row Count
  // TanStack Table requires a rowCount to know if it can go to the next page.
  // Since we don't have a total, we dynamically adjust this number.
  const rowCount = useMemo(() => {
    const itemsSeenSoFar = (pagination.pageIndex + 1) * pagination.pageSize;

    // If the API says there is a next page, we pretend we have 1 more item than currently visible.
    // This forces the "Next" button to be enabled.
    if (hasNextPage) {
      return itemsSeenSoFar + 1;
    }

    // If no next page, the total is exactly what we've seen. "Next" button becomes disabled.
    return itemsSeenSoFar;
  }, [hasNextPage, pagination.pageIndex, pagination.pageSize]);

  // 5. Handle Page Changes
  const onPaginationChange: OnChangeFn<PaginationState> = useCallback(
    (updater) => {
      setPagination((old) => {
        const newState = typeof updater === 'function' ? updater(old) : updater;

        // A. Handle Page Size Change
        // Changing size invalidates cursors because the "chunks" of data change.
        if (newState.pageSize !== old.pageSize) {
          setCursorHistory([null]); // Reset history
          return { ...newState, pageIndex: 0 }; // Go back to start
        }

        // B. Handle Next Page
        if (newState.pageIndex > old.pageIndex) {
          setCursorHistory((prev) => {
            const newHistory = [...prev];
            // We save the 'nextCursor' (passed from props) to the index of the page we are ABOUT to visit.
            newHistory[newState.pageIndex] = nextCursor || null;
            return newHistory;
          });
        }

        // C. Handle Previous Page
        // No action needed; the cursor is already safely stored in history[newState.pageIndex]

        return newState;
      });
    },
    [nextCursor],
  );

  // 6. Reset Utility
  // Call this when the user changes filters (search, date range, etc.)
  const reset = useCallback(() => {
    setPagination({ pageIndex: 0, pageSize: defaultPageSize });
    setCursorHistory([null]);
  }, [defaultPageSize]);

  return {
    pagination,
    onPaginationChange,
    cursor,
    rowCount,
    reset,
  };
}
