export interface Participant {
  id: string
  name: string
  groupId: string
}

export interface Group {
  id: string
  label: string
}

export interface Assignment {
  giverId: string
  receiverId: string
}

export interface AppState {
  participants: Participant[]
  groups: Group[]
  assignments: Assignment[]
  currentStep: number
  isExchangeReady: boolean
  isCheckingExchange: boolean
  errorMessage: string | null
}

export type Step = 'input' | 'group' | 'exchange' | 'result'

export const STEPS: Record<Step, number> = {
  input: 1,
  group: 2,
  exchange: 3,
  result: 4,
} as const

// 正規化関数の型
export type NormalizeName = (name: string) => string

// 交換判定の結果
export interface ExchangeValidationResult {
  isValid: boolean
  message?: string
}
