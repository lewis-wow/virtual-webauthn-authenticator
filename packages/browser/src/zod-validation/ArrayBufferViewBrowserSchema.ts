import z from 'zod';

export const ArrayBufferViewBrowserSchema = z.custom<ArrayBufferView>((data) =>
  ArrayBuffer.isView(data),
);
