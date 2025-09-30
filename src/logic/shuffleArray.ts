/**
 * 既存の配列を変更せずシャッフル
 * @param source 元の配列(変更されない)
 * @returns シャッフルされた配列
 */
export function shuffleArray<T>(source: T[]): T[] {
  const sourceCopy = [...source]
  const shuffled = []
  for (let i = sourceCopy.length; i > 0; i--) {
    shuffled.push(sourceCopy.splice(Math.floor(i * Math.random()), 1)[0])
  }
  return shuffled
}
