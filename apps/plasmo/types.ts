export type MessageResponse<TData> =
  | {
      data: TData;
      success: true;
    }
  | {
      success: false;
      error: Error;
    };
