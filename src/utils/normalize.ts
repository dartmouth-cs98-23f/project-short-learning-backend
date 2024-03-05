export const featureNormalize = (Arr: number[]): number[] => {
  const max = Math.max(...Arr)
  const min = Math.min(...Arr)
  const range = max - min
  return Arr.map((val) => (val - min) / range)
}
export default featureNormalize
