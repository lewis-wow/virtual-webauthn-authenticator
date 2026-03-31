// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const wrapIsNullish = <T extends (arg: any) => any>(wrappedFn: T) => {
  return <Input extends Parameters<T>[0] | null | undefined>(
    input: Input,
  ):
    | ReturnType<T>
    | (null extends Input ? null : never)
    | (undefined extends Input ? undefined : never) => {
    if (input === null || input === undefined) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return input as any;
    }

    return wrappedFn(input);
  };
};
