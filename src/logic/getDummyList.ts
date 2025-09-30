import { shuffleArray } from '@/logic/shuffleArray'
/**
  ダミー配列作成関数
   * @param source ダミー配列のもとになる配列。当選者を含んでもよい
   * @param  count ダミー配列の長さ
   * @param winner 当選者
   * @return ダミー配列。最後の(count-1)個には当選者は含まれない
   */
export function getDummyList<T extends { id: string | number }>(
  source: T[],
  count: number,
  winner: T
) {
  const dummyList: T[] = []
  const candidateNumber = source.length
  for (let i = 0; i < Math.floor(count / candidateNumber); i++) {
    dummyList.push(...shuffleArray<T>(source))
  }
  dummyList.push(...shuffleArray<T>(source).filter((p) => p.id !== winner.id))
  return dummyList.slice(-count)
}
