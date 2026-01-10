export class HashOnion {
  static readonly DELIMITER = ':';

  static fromArray(hashes: string[]): string {
    return hashes.join(HashOnion.DELIMITER);
  }

  static push(hash: string, hashes?: string): string {
    if (hashes === undefined) {
      return hash;
    }

    return `${hash}${HashOnion.DELIMITER}${hashes}`;
  }

  static pop(
    hashes: string | undefined,
  ): [string | undefined, string | undefined] {
    if (hashes === undefined) {
      return [undefined, undefined];
    }

    const [first, ...rest] = hashes.split(HashOnion.DELIMITER);
    const joinedRest = HashOnion.fromArray(rest);

    return [first, joinedRest.length > 0 ? joinedRest : undefined];
  }
}
