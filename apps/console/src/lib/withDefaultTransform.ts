import type { FieldTransform } from "../types";

export const withDefaultFieldTransform = <
  T extends {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    transform?: FieldTransform<any>;
  },
>(
  fieldProps: T,
) => {
  return {
    ...fieldProps,
    transform: fieldProps.transform ?? {
      input: (value) => value as string,
      output: (value) => value,
    },
  };
};
