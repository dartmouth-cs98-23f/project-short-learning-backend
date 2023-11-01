export function arrayHasNoDuplicates(val: string[]): boolean {
    return new Set(val).size === val.length
  }