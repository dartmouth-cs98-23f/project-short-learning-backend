export function arrayHasNoDuplicates(val: string[]): boolean {
  return new Set(val).size === val.length
}

export function arrayLimit(limit: number) {
  return (val: any[]) => val.length <= limit
}
